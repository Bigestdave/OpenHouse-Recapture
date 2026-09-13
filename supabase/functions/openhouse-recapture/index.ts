// OpenHouse Recapture is the operations agent for one blocked media-evidence gap.
// The mission record is persisted before any external action. Connectors only
// write receipts back to that record; they never become a second source of truth.
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

function getServiceKey() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy
  const raw = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (!raw) return ''
  try {
    const keys = JSON.parse(raw) as Record<string, unknown>
    return typeof keys.default === 'string' ? keys.default : ''
  } catch { return '' }
}

const serviceKey = getServiceKey()
if (!supabaseUrl || !serviceKey) throw new Error('Supabase Edge Function credentials are unavailable.')
const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('OPENHOUSE_ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.7-flash'
const connectorMode = Deno.env.get('RECAPTURE_CONNECTOR_MODE') ?? 'demo'
type Json = Record<string, unknown>
type GapType = 'missing_connection' | 'missing_room' | 'low_light' | 'poor_coverage' | 'blurred_media'
type Severity = 'blocking' | 'advisory'

class ApiError extends Error { constructor(message: string, readonly status = 400) { super(message) } }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders })
const asObject = (value: unknown): Json => value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {}
const text = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''

async function requireUser(request: Request) {
  const value = request.headers.get('Authorization')
  if (!value?.startsWith('Bearer ')) throw new ApiError('Authentication required.', 401)
  const { data, error } = await service.auth.getUser(value.slice(7))
  if (error || !data.user) throw new ApiError('Authentication required.', 401)
  return data.user
}

async function propertyForMember(userId: string, propertyId: string) {
  const { data: property, error } = await service.from('properties').select('id,title,address,workspace_id').eq('id', propertyId).maybeSingle()
  if (error || !property) throw new ApiError('Property not found.', 404)
  const { data: member, error: memberError } = await service.from('workspace_members')
    .select('workspace_id').eq('workspace_id', property.workspace_id).eq('user_id', userId).maybeSingle()
  if (memberError || !member) throw new ApiError('You do not have access to this property.', 403)
  return property
}

async function sha256(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')
}

function gapFrom(input: Json) {
  const gapType = text(input.gapType, 40) as GapType
  if (!['missing_connection', 'missing_room', 'low_light', 'poor_coverage', 'blurred_media'].includes(gapType)) throw new ApiError('A supported evidence-gap type is required.')
  const severity = text(input.severity, 20) as Severity
  if (!['blocking', 'advisory'].includes(severity)) throw new ApiError('A supported gap severity is required.')
  const fromSpace = text(input.fromSpace, 120)
  const toSpace = text(input.toSpace, 120)
  const reason = text(input.reason, 1000)
  if (!reason) throw new ApiError('The evidence reason is required.')
  if (gapType === 'missing_connection' && (!fromSpace || !toSpace)) throw new ApiError('A connection gap needs a start and end space.')
  return { gapType, severity, fromSpace, toSpace, reason }
}

function fallbackInstruction(gap: ReturnType<typeof gapFrom>) {
  if (gap.gapType === 'missing_connection') return `Start in ${gap.fromSpace}. Walk continuously to ${gap.toSpace} without cuts, then hold the final view for five seconds. Keep the route, doorways, and landmarks clearly visible. Aim for 20–30 seconds.`
  if (gap.gapType === 'low_light') return `Re-record ${gap.toSpace || gap.fromSpace || 'the affected space'} in daylight or with the lights on. Move slowly, keep the room in focus, and show each wall and main feature for at least five seconds.`
  if (gap.gapType === 'blurred_media') return `Re-record ${gap.toSpace || gap.fromSpace || 'the affected space'} with a clean lens and steady movement. Pause briefly on the important details so the room is visibly usable.`
  return `Record a steady, well-lit walkthrough of ${gap.toSpace || gap.fromSpace || 'the missing space'}. Show the entrance, main features, and a clear exit path without cuts.`
}

async function generateInstruction(gap: ReturnType<typeof gapFrom>) {
  const key = Deno.env.get('GEMINI_API_KEY')
  const fallback = fallbackInstruction(gap)
  if (!key) return { instruction: fallback, source: 'policy_template' }
  const schema = { type: 'object', properties: { instruction: { type: 'string' } }, required: ['instruction'] }
  const prompt = [
    'You write one precise, safety-conscious real-estate recapture instruction.',
    'Use only the structured gap below. Do not claim that a new recording proves anything.',
    'Do not mention AI, confidence, or hidden analysis. Keep to 55 words or fewer.',
    JSON.stringify(gap),
  ].join('\n')
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generationConfig: { responseMimeType: 'application/json', responseSchema: schema }, contents: [{ parts: [{ text: prompt }] }] }),
    })
    const payload = await response.json()
    const candidate = payload?.candidates?.[0]?.content?.parts?.[0]?.text
    const instruction = typeof candidate === 'string' ? text(asObject(JSON.parse(candidate)).instruction, 800) : ''
    return instruction ? { instruction, source: 'gemini' } : { instruction: fallback, source: 'policy_template' }
  } catch { return { instruction: fallback, source: 'policy_template' } }
}

type ConnectorAction = 'calendar_check_and_create' | 'drive_create_folder' | 'telegram_send' | 'gmail_send' | 'drive_list_files'
type Receipt = { ref: string; simulated: boolean; data?: Json }

// A Google Apps Script Web App can carry out Gmail, Calendar, and Drive calls
// under a real team's Google identity. Its shared secret is only held in Edge
// Function secrets. Demo mode is intentionally explicit: it is for rehearsals,
// never presented as an external side effect.
async function googleBridge(action: ConnectorAction, payload: Json): Promise<Receipt> {
  const endpoint = Deno.env.get('RECAPTURE_GOOGLE_BRIDGE_URL')
  const secret = Deno.env.get('RECAPTURE_GOOGLE_BRIDGE_SECRET')
  if (connectorMode === 'live') {
    if (!endpoint || !secret) throw new ApiError('Google connector credentials are unavailable. The mission was not dispatched.', 503)
    // Apps Script Web Apps expose request bodies but not reliable custom request
    // headers, so the bridge secret lives in this server-to-server JSON body.
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, action, payload }) })
    const result = asObject(await response.json().catch(() => ({})))
    if (!response.ok || !text(result.ref, 300)) throw new ApiError(`Google connector could not complete ${action.replaceAll('_', ' ')}.`, 502)
    return { ref: text(result.ref, 300), simulated: false, data: asObject(result.data) }
  }
  return { ref: `demo:${action}:${crypto.randomUUID()}`, simulated: true, data: { connectorMode: 'demo' } }
}

async function telegramSend(payload: Json): Promise<Receipt> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (connectorMode === 'live') {
    if (!token || !chatId) throw new ApiError('Telegram connector credentials are unavailable. The mission was not dispatched.', 503)
    const message = text(payload.message, 3500)
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: message }) })
    const result = asObject(await response.json().catch(() => ({})))
    const messageId = asObject(result.result).message_id
    if (!response.ok || (typeof messageId !== 'number' && typeof messageId !== 'string')) throw new ApiError('Telegram could not deliver the capture mission.', 502)
    return { ref: String(messageId), simulated: false }
  }
  return { ref: `demo:telegram:${crypto.randomUUID()}`, simulated: true, data: { connectorMode: 'demo' } }
}

async function log(missionId: string, action: string, actor: 'agent' | 'realtor' | 'photographer' | 'system', payload: Json = {}, externalApp?: string, externalRef?: string) {
  const { error } = await service.from('recapture_events').insert({ mission_id: missionId, action, actor, payload, external_app: externalApp ?? null, external_ref: externalRef ?? null })
  if (error) throw new ApiError('Could not record the mission audit event.', 502)
}

async function ensureCaptureRequest(property: { id: string; title: string }, providedId: string, gap: ReturnType<typeof gapFrom>, instruction: string) {
  if (providedId) {
    const { data: existing, error } = await service.from('capture_requests').select('id,capture_url').eq('id', providedId).eq('property_id', property.id).maybeSingle()
    if (error || !existing) throw new ApiError('The supplied capture request does not belong to this property.', 409)
    return { id: existing.id as string, captureUrl: existing.capture_url as string, created: false }
  }

  const id = crypto.randomUUID()
  const token = crypto.randomUUID()
  const now = Date.now()
  const room = gap.toSpace || gap.fromSpace || 'Evidence recapture'
  const captureUrl = `/capture/${token}`
  const { error } = await service.from('capture_requests').insert({
    id, property_id: property.id, property_title: property.title, room, reason: gap.reason,
    instructions: instruction, estimated_time: '20–30 second walkthrough', status: 'awaiting_capture',
    recipient_name: 'Assigned photographer', capture_url: captureUrl, capture_token: token,
    expires_at: new Date(now + 72 * 60 * 60 * 1000).toISOString(), created_at: now, updated_at: now,
  })
  if (error) throw new ApiError('Could not prepare the secure capture link.', 502)
  return { id, captureUrl, created: true }
}

function plannedTime(value: unknown) {
  const raw = text(value, 80)
  if (!raw) return null
  const timestamp = Date.parse(raw)
  if (Number.isNaN(timestamp) || timestamp < Date.now() - 5 * 60_000) throw new ApiError('A future scheduled time is required.')
  return new Date(timestamp).toISOString()
}

async function startMission(userId: string, raw: unknown) {
  const input = asObject(raw)
  const property = await propertyForMember(userId, text(input.propertyId, 120))
  const gap = gapFrom(input)
  const fingerprint = await sha256({ propertyId: property.id, gapType: gap.gapType, fromSpace: gap.fromSpace.toLocaleLowerCase(), toSpace: gap.toSpace.toLocaleLowerCase() })
  const idempotencyKey = `recapture:${property.id}:${fingerprint}`
  const instruction = await generateInstruction(gap)
  const scheduledFor = plannedTime(input.scheduledFor)
  const approvalRequired = input.approvalRequired !== false
  // Check before preparing a capture link. A duplicate request must not create
  // another link or a second photographer task.
  const { data: prior } = await service.from('recapture_missions').select('*').eq('idempotency_key', idempotencyKey).maybeSingle()
  if (prior) {
    await log(prior.id, 'mission_deduplicated', 'agent', { idempotencyKey, requestedAt: new Date().toISOString() })
    return { mission: prior, duplicate: true }
  }
  const capture = await ensureCaptureRequest(property, text(input.captureRequestId, 120), gap, instruction.instruction)
  const { data: mission, error } = await service.from('recapture_missions').insert({
    property_id: property.id, capture_request_id: capture.id,
    idempotency_key: idempotencyKey, gap_fingerprint: fingerprint, gap_type: gap.gapType,
    from_space: gap.fromSpace || null, to_space: gap.toSpace || null, severity: gap.severity,
    reason: gap.reason, capture_instruction: instruction.instruction,
    status: approvalRequired || !scheduledFor ? 'awaiting_realtor_approval' : 'planning',
    scheduled_for: scheduledFor,
    agent_decision: { instructionSource: instruction.source, policy: { approvalRequired, scheduledForProvided: Boolean(scheduledFor) } },
  }).select().single()
  if (error?.code === '23505') {
    const { data: existing } = await service.from('recapture_missions').select('*').eq('idempotency_key', idempotencyKey).single()
    if (!existing) throw new ApiError('A matching mission already exists.', 409)
    if (capture.created) await service.from('capture_requests').delete().eq('id', capture.id)
    await log(existing.id, 'mission_deduplicated', 'agent', { idempotencyKey, requestedAt: new Date().toISOString() })
    return { mission: existing, duplicate: true }
  }
  if (error || !mission) throw new ApiError('Could not create the recapture mission.', 502)
  await log(mission.id, 'gap_detected', 'agent', { ...gap, fingerprint, captureRequestId: capture.id, captureUrl: capture.captureUrl })
  await log(mission.id, 'instruction_generated', 'agent', { source: instruction.source, instruction: instruction.instruction })
  await log(mission.id, 'policy_checked', 'agent', { approvalRequired, scheduledForProvided: Boolean(scheduledFor), result: mission.status })
  if (mission.status === 'awaiting_realtor_approval') await log(mission.id, 'awaiting_realtor_approval', 'agent', { reason: approvalRequired ? 'Realtor approval is required before a photographer is booked.' : 'A capture time has not been selected.' })
  if (mission.status === 'planning') await executeMission(mission.id)
  return { mission: await missionById(mission.id), duplicate: false }
}

async function missionById(missionId: string) {
  const { data: mission, error } = await service.from('recapture_missions').select('*').eq('id', missionId).single()
  if (error || !mission) throw new ApiError('Recapture mission not found.', 404)
  const { data: events } = await service.from('recapture_events').select('*').eq('mission_id', missionId).order('created_at')
  return { ...mission, events: events ?? [] }
}

async function executeMission(missionId: string) {
  const record = await missionById(missionId)
  if (record.status !== 'planning') return record
  const scheduledFor = record.scheduled_for
  if (!scheduledFor) throw new ApiError('This mission needs a scheduled time before it can be dispatched.', 409)
  try {
    const calendar = await googleBridge('calendar_check_and_create', {
      title: `OpenHouse recapture: ${record.from_space ? `${record.from_space} → ` : ''}${record.to_space || record.gap_type}`,
      startAt: scheduledFor, durationMinutes: 30, propertyId: record.property_id, missionId,
    })
    await log(missionId, 'calendar_checked', 'agent', { scheduledFor, available: true, simulated: calendar.simulated }, 'google_calendar', calendar.ref)
    await log(missionId, 'calendar_event_created', 'agent', { scheduledFor, simulated: calendar.simulated }, 'google_calendar', calendar.ref)
    const drive = await googleBridge('drive_create_folder', { name: `OpenHouse Recapture ${missionId}`, missionId, propertyId: record.property_id })
    await log(missionId, 'drive_folder_created', 'agent', { simulated: drive.simulated }, 'google_drive', drive.ref)
    const telegram = await telegramSend({ message: `OpenHouse capture mission\n${record.capture_instruction}\nScheduled: ${scheduledFor}\nUpload folder: ${drive.ref}` })
    await log(missionId, 'telegram_sent', 'agent', { simulated: telegram.simulated }, 'telegram', telegram.ref)
    const gmail = await googleBridge('gmail_send', { subject: 'Capture mission scheduled', body: `A recapture mission was scheduled for ${scheduledFor}.\n\nInstruction: ${record.capture_instruction}`, missionId, propertyId: record.property_id })
    await log(missionId, 'gmail_sent', 'agent', { simulated: gmail.simulated }, 'gmail', gmail.ref)
    const { error } = await service.from('recapture_missions').update({ status: 'scheduled', calendar_event_ref: calendar.ref, drive_folder_ref: drive.ref, telegram_message_ref: telegram.ref, gmail_thread_ref: gmail.ref }).eq('id', missionId)
    if (error) throw new ApiError('Could not save the dispatched mission.', 502)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'A connector failed unexpectedly.'
    await service.from('recapture_missions').update({ status: 'failed', agent_decision: { ...record.agent_decision, failure: message } }).eq('id', missionId)
    await log(missionId, 'mission_failed', 'system', { message })
    throw error
  }
  return missionById(missionId)
}

async function approveMission(userId: string, missionId: string, raw: unknown) {
  const current = await missionById(missionId)
  await propertyForMember(userId, current.property_id)
  if (current.status !== 'awaiting_realtor_approval') throw new ApiError('Only a mission awaiting approval can be approved.', 409)
  const scheduledFor = plannedTime(asObject(raw).scheduledFor) ?? current.scheduled_for
  if (!scheduledFor) throw new ApiError('Choose a capture time before approving the mission.')
  await service.from('recapture_missions').update({ status: 'planning', scheduled_for: scheduledFor }).eq('id', missionId)
  await log(missionId, 'policy_checked', 'realtor', { approved: true, scheduledFor })
  return executeMission(missionId)
}

async function recordCapture(userId: string, missionId: string, raw: unknown) {
  const current = await missionById(missionId)
  await propertyForMember(userId, current.property_id)
  if (!['scheduled', 'needs_follow_up'].includes(current.status)) throw new ApiError('This mission is not waiting for a capture upload.', 409)
  const assetRef = text(asObject(raw).assetRef, 500)
  if (!assetRef) throw new ApiError('A capture asset reference is required.')
  await service.from('recapture_missions').update({ status: 'capture_uploaded' }).eq('id', missionId)
  await log(missionId, 'capture_received', 'photographer', { assetRef })
  return missionById(missionId)
}

async function verifyMission(userId: string, missionId: string, raw: unknown) {
  const current = await missionById(missionId)
  await propertyForMember(userId, current.property_id)
  if (current.status !== 'capture_uploaded') throw new ApiError('A capture must be received before verification.', 409)
  const input = asObject(raw)
  const resolved = input.resolved === true
  const remainingReason = text(input.remainingReason, 1000)
  await service.from('recapture_missions').update({ status: resolved ? 'resolved' : 'needs_follow_up', resolved_at: resolved ? new Date().toISOString() : null }).eq('id', missionId)
  await log(missionId, 'verification_completed', 'agent', { resolved, remainingReason: resolved ? null : remainingReason || 'The submitted capture still does not meet the original evidence requirement.' })
  await log(missionId, resolved ? 'mission_resolved' : 'mission_escalated', 'agent', { reason: resolved ? 'The new evidence satisfies the bounded mission requirement.' : remainingReason || 'Additional human review is required.' })
  return missionById(missionId)
}

async function listMissions(userId: string, workspaceId: string) {
  const { data: member } = await service.from('workspace_members').select('workspace_id').eq('workspace_id', workspaceId).eq('user_id', userId).maybeSingle()
  if (!member) throw new ApiError('You do not have access to this workspace.', 403)
  const { data: properties } = await service.from('properties').select('id,title,address').eq('workspace_id', workspaceId)
  const propertyIds = (properties ?? []).map((property) => property.id)
  if (!propertyIds.length) return []
  const { data: missions, error } = await service.from('recapture_missions').select('*').in('property_id', propertyIds).order('created_at', { ascending: false })
  if (error) throw new ApiError('Could not load recapture missions.', 502)
  const names = new Map((properties ?? []).map((property) => [property.id, property]))
  return (missions ?? []).map((mission) => ({ ...mission, property: names.get(mission.property_id) ?? null }))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const body = asObject(await request.json())
    const user = await requireUser(request)
    if (body.action === 'start_mission') return json(await startMission(user.id, body))
    if (body.action === 'approve_mission') return json(await approveMission(user.id, text(body.missionId, 120), body))
    if (body.action === 'record_capture') return json(await recordCapture(user.id, text(body.missionId, 120), body))
    if (body.action === 'verify_mission') return json(await verifyMission(user.id, text(body.missionId, 120), body))
    if (body.action === 'mission') {
      const mission = await missionById(text(body.missionId, 120))
      await propertyForMember(user.id, mission.property_id)
      return json(mission)
    }
    if (body.action === 'list_missions') return json(await listMissions(user.id, text(body.workspaceId, 120)))
    throw new ApiError('Unknown recapture action.', 404)
  } catch (error) {
    const known = error instanceof ApiError ? error : new ApiError('OpenHouse Recapture failed.', 502)
    console.error('openhouse-recapture', error)
    return json({ error: known.message }, known.status)
  }
})

