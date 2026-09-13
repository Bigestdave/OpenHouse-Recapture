// OpenHouse's server-side evidence inspector.
// Gemini may only describe a single asset using this constrained schema. The
// deterministic rules below decide coverage, capture requests and readiness.
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

// Hosted Supabase now supplies new secret keys as JSON in
// SUPABASE_SECRET_KEYS. Retain the legacy service-role variable solely for
// older projects that have not migrated yet.
function getServiceKey() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy
  const rawKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (!rawKeys) return ''
  try {
    const keys = JSON.parse(rawKeys) as Record<string, unknown>
    return typeof keys.default === 'string' ? keys.default : ''
  } catch {
    return ''
  }
}

const serviceKey = getServiceKey()
if (!supabaseUrl || !serviceKey) throw new Error('Supabase Edge Function credentials are unavailable.')
const service = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

// Gemini 3.7 Flash is the production default. A project secret can still
// override this deliberately (for example while testing a future model).
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.7-flash'
const RULES_VERSION = 'evidence-rules/1.0.0'
const SCHEMA_VERSION = 'asset-observation/1.0.0'
const PROMPT_VERSION = 'asset-inspector/1.0.0'
// Base64 expands the payload by roughly one third. Keep source files below
// 12 MiB so the complete inline Gemini request remains safely below 20 MiB.
const MAX_INLINE_BYTES = 12 * 1024 * 1024
const MAX_ASSETS_PER_RUN = 12

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('OPENHOUSE_ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openhouse-worker-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

type Json = Record<string, unknown>
type Space = { id: string; name: string }
type Asset = {
  id: string
  property_id: string
  storage_bucket: 'property-media' | 'captures'
  storage_path: string
  original_name: string
  mime_type: string
  size_bytes: number
  kind: 'image' | 'video' | 'floor_plan'
}
type ObservationStatus = 'accepted' | 'rejected' | 'uncertain' | 'skipped' | 'failed'
type AssetObservation = {
  assetId: string
  status: ObservationStatus
  observedSpaceIds: string[]
  evidence: 'usable' | 'unusable' | 'uncertain'
  reasons: string[]
  raw: Json
}

class ApiError extends Error {
  constructor(message: string, readonly status = 400) { super(message) }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders })
const asObject = (value: unknown): Json => value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {}
const asString = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''

async function requireUser(request: Request) {
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) throw new ApiError('Authentication required.', 401)
  const { data, error } = await service.auth.getUser(authorization.slice('Bearer '.length))
  if (error || !data.user) throw new ApiError('Authentication required.', 401)
  return data.user
}

async function propertyForMember(userId: string, propertyId: string) {
  const { data: property, error } = await service.from('properties').select('*').eq('id', propertyId).maybeSingle()
  if (error || !property) throw new ApiError('Property not found.', 404)
  const { data: membership, error: membershipError } = await service.from('workspace_members')
    .select('workspace_id').eq('workspace_id', property.workspace_id).eq('user_id', userId).maybeSingle()
  if (membershipError || !membership) throw new ApiError('You do not have access to this property.', 403)
  return property as Json
}

async function sha256(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function toBase64(bytes: Uint8Array) {
  const chunks: string[] = []
  for (let index = 0; index < bytes.length; index += 0x8000) chunks.push(String.fromCharCode(...bytes.subarray(index, index + 0x8000)))
  return btoa(chunks.join(''))
}

const observationSchema = {
  type: 'object',
  properties: {
    evidence: { type: 'string', description: 'Exactly usable, unusable, or uncertain.' },
    observed_space_ids: { type: 'array', items: { type: 'string' } },
    reasons: { type: 'array', items: { type: 'string' } },
  },
  required: ['evidence', 'observed_space_ids', 'reasons'],
}

async function inspectWithGemini(asset: Asset, spaces: Space[]): Promise<Json> {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) throw new ApiError('Gemini analysis is not configured.', 503)
  const { data: file, error } = await service.storage.from(asset.storage_bucket).download(asset.storage_path)
  if (error || !file) throw new ApiError(`Could not read ${asset.original_name} for analysis.`, 502)
  const prompt = [
    'You are an evidence extractor for a real-estate media audit.',
    'Inspect only what is visible in this single asset. Do not infer unseen rooms, layout, quality, or connections.',
    'Return usable only when this asset directly and clearly shows at least one listed space.',
    'Return unusable when it does not provide usable interior or floor-plan evidence.',
    'Return uncertain if image quality, ambiguity, or obstruction prevents a reliable observation.',
    'Only return exact space IDs from this list; never invent an ID or use a room name in its place.',
    `Listed spaces: ${spaces.map((space) => `${space.id} = ${space.name}`).join('; ')}`,
  ].join('\n')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Gemini 3.x rejects the deprecated temperature and candidateCount
        // sampling parameters. Determinism comes from the fixed evidence
        // contract and the rules engine below, not from a model confidence.
        generationConfig: { responseMimeType: 'application/json', responseSchema: observationSchema },
        contents: [{ parts: [
          { inlineData: { mimeType: asset.mime_type || 'application/octet-stream', data: toBase64(new Uint8Array(await file.arrayBuffer())) } },
          { text: prompt },
        ] }],
      }),
    },
  )
  if (!response.ok) throw new ApiError('Gemini did not return an analysis result.', 502)
  const payload = await response.json()
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') throw new ApiError('Gemini returned an incomplete analysis result.', 502)
  try { return asObject(JSON.parse(text)) } catch { throw new ApiError('Gemini returned invalid structured evidence.', 502) }
}

function normalizeObservation(asset: Asset, raw: Json, validSpaceIds: Set<string>): AssetObservation {
  const evidence = raw.evidence === 'usable' || raw.evidence === 'unusable' || raw.evidence === 'uncertain' ? raw.evidence : 'uncertain'
  const observedSpaceIds = Array.isArray(raw.observed_space_ids)
    ? [...new Set(raw.observed_space_ids.filter((id): id is string => typeof id === 'string' && validSpaceIds.has(id)))] : []
  const reasons = Array.isArray(raw.reasons)
    ? raw.reasons.filter((reason): reason is string => typeof reason === 'string').map((reason) => reason.slice(0, 300)).slice(0, 5) : []
  const status: ObservationStatus = evidence === 'usable' && observedSpaceIds.length > 0 ? 'accepted' : evidence === 'unusable' ? 'rejected' : 'uncertain'
  return { assetId: asset.id, status, observedSpaceIds, evidence, reasons, raw }
}

function skipped(asset: Asset, reason: string): AssetObservation {
  return { assetId: asset.id, status: 'skipped', observedSpaceIds: [], evidence: 'uncertain', reasons: [reason], raw: {} }
}

async function inspectAsset(asset: Asset, spaces: Space[]): Promise<AssetObservation> {
  if (!['image', 'video', 'floor_plan'].includes(asset.kind)) return skipped(asset, 'Unsupported media kind.')
  if (!asset.mime_type.startsWith('image/') && !asset.mime_type.startsWith('video/') && asset.mime_type !== 'application/pdf') return skipped(asset, 'Unsupported media format.')
  if (Number(asset.size_bytes) > MAX_INLINE_BYTES) return skipped(asset, 'Asset requires the queued video worker because it exceeds the Edge inspection limit.')
  try {
    return normalizeObservation(asset, await inspectWithGemini(asset, spaces), new Set(spaces.map((space) => space.id)))
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) throw error
    return { assetId: asset.id, status: 'failed', observedSpaceIds: [], evidence: 'uncertain', reasons: ['Provider inspection failed; no automatic capture decision was made from this asset.'], raw: {} }
  }
}

async function createCaptureRequests(property: Json, missing: Space[]) {
  if (!missing.length) return []
  const { data: existing } = await service.from('capture_requests').select('room,status').eq('property_id', property.id)
  const openRooms = new Set((existing ?? []).filter((request) => request.status !== 'resolved').map((request) => request.room))
  const now = Date.now()
  const rows = missing.filter((space) => !openRooms.has(space.name)).map((space) => {
    const token = crypto.randomUUID()
    return {
      id: crypto.randomUUID(), property_id: property.id, property_title: property.title, room: space.name,
      from_room: 'Entry', to_room: space.name, reason: 'No accepted media evidence directly identifies this advertised space.',
      instructions: `Record a steady walkthrough into ${space.name}. Keep the room’s main features visible for at least five seconds.`,
      estimated_time: '15 second walkthrough', status: 'awaiting_capture', recipient_name: 'Property contact',
      capture_url: `/capture/${token}`, capture_token: token, expires_at: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
      created_at: now, updated_at: now,
    }
  })
  if (rows.length) {
    const { error } = await service.from('capture_requests').insert(rows)
    if (error) throw new ApiError('Could not create the required capture requests.', 502)
  }
  return rows.map((row) => row.room)
}

async function queueAnalysis(userId: string, propertyId: string, attempt = 1) {
  const property = await propertyForMember(userId, propertyId)
  const [{ data: spaces, error: spacesError }, { data: media, error: mediaError }] = await Promise.all([
    service.from('property_spaces').select('id,name').eq('property_id', property.id).order('name'),
    service.from('media_assets').select('*').eq('property_id', property.id).order('created_at'),
  ])
  if (spacesError || mediaError) throw new ApiError('Could not load the property evidence.', 502)
  if (!spaces?.length) throw new ApiError('At least one advertised space is required.', 409)
  if (!media?.length) throw new ApiError('At least one media asset is required before analysis.', 409)

  const manifest = { propertyId: property.id, spaces, media: media.map((asset) => ({ id: asset.id, path: asset.storage_path, bucket: asset.storage_bucket, bytes: asset.size_bytes, mime: asset.mime_type })), rules: RULES_VERSION, model: MODEL }
  const inputHash = await sha256(manifest)
  const { data: job, error: jobError } = await service.from('workflow_jobs').insert({
    property_id: property.id, kind: 'analysis', status: 'queued', attempt_count: attempt, max_attempts: 3,
    progress_phase: 'queued', progress_message: 'Analysis is queued and waiting for the evidence worker.',
    result: { inputHash, rulesVersion: RULES_VERSION },
  }).select().single()
  if (jobError || !job) throw new ApiError('Could not start the analysis job.', 502)

  const run = async () => {
    try {
      const { error: startError } = await service.from('workflow_jobs').update({ status: 'running', started_at: new Date().toISOString(), progress_phase: 'loading_evidence', progress_message: 'Loading private property evidence.' }).eq('id', job.id)
      if (startError) throw new ApiError('Could not start the analysis job.', 502)
    await service.from('workflow_jobs').update({ progress_phase: 'inspecting_media', progress_message: `Inspecting ${Math.min(media.length, MAX_ASSETS_PER_RUN)} evidence item${media.length === 1 ? '' : 's'} against the advertised spaces.` }).eq('id', job.id)
    const observations: AssetObservation[] = []
    for (const asset of (media as Asset[]).slice(0, MAX_ASSETS_PER_RUN)) observations.push(await inspectAsset(asset, spaces as Space[]))
    for (const asset of (media as Asset[]).slice(MAX_ASSETS_PER_RUN)) observations.push(skipped(asset, `Run limit reached: only the first ${MAX_ASSETS_PER_RUN} assets are inspected per run.`))

    await service.from('workflow_jobs').update({ progress_phase: 'applying_rules', progress_message: 'Applying OpenHouse evidence rules to the structured observations.' }).eq('id', job.id)
    const providerFailed = observations.some((observation) => observation.status === 'failed')
    const acceptedSpaceIds = new Set(observations.filter((observation) => observation.status === 'accepted').flatMap((observation) => observation.observedSpaceIds))
    const uncertainAssetIds = new Set(observations.filter((observation) => ['uncertain', 'skipped', 'failed'].includes(observation.status)).map((observation) => observation.assetId))
    const acceptedAssetIds = new Set(observations.filter((observation) => observation.status === 'accepted').map((observation) => observation.assetId))
    const missing = (spaces as Space[]).filter((space) => !acceptedSpaceIds.has(space.id))
    const status = providerFailed || uncertainAssetIds.size ? 'needs_human_review' : missing.length ? 'needs_capture' : 'ready_for_review'
    const coverage = acceptedSpaceIds.size / spaces.length
    const summary = status === 'ready_for_review'
      ? 'Every advertised space has at least one accepted media observation.'
      : status === 'needs_capture'
        ? `${missing.length} advertised space${missing.length === 1 ? '' : 's'} has no accepted media observation.`
        : 'Analysis contains uncertain or failed evidence and requires human review; no unsupported conclusion was made.'

    const { data: run, error: runError } = await service.from('analysis_runs').insert({
      property_id: property.id, job_id: job.id, status, confidence: coverage, summary, rules_version: RULES_VERSION, model: MODEL, input_hash: inputHash,
      decision: { coverage, acceptedSpaceIds: [...acceptedSpaceIds], missingSpaceIds: missing.map((space) => space.id), uncertainAssetIds: [...uncertainAssetIds] },
    }).select().single()
    if (runError || !run) throw new ApiError('Could not store the analysis result.', 502)

    const { error: observationError } = await service.from('evidence_observations').insert(observations.map((observation) => ({
      property_id: property.id, media_asset_id: observation.assetId, analysis_run_id: run.id, provider: 'gemini', model: MODEL,
      schema_version: SCHEMA_VERSION, prompt_version: PROMPT_VERSION, input_hash: inputHash, status: observation.status,
      observation: { evidence: observation.evidence, observedSpaceIds: observation.observedSpaceIds, reasons: observation.reasons, raw: observation.raw },
    })))
    if (observationError) throw new ApiError('Could not store evidence observations.', 502)

    await Promise.all([
      ...observations.map((observation) => service.from('media_assets').update({ analysis_status: observation.status, analyzed_at: new Date().toISOString(), verified: acceptedAssetIds.has(observation.assetId) }).eq('id', observation.assetId)),
      ...(spaces as Space[]).map((space) => service.from('property_spaces').update({ verified: acceptedSpaceIds.has(space.id), confidence: acceptedSpaceIds.has(space.id) ? 1 : 0, issue: acceptedSpaceIds.has(space.id) ? null : 'No accepted evidence observation for this advertised space.', updated_at: new Date().toISOString() }).eq('id', space.id)),
    ])
    if (status === 'needs_capture') await service.from('workflow_jobs').update({ progress_phase: 'creating_capture_requests', progress_message: 'Creating targeted capture requests for evidence that is still missing.' }).eq('id', job.id)
    const captureRooms = status === 'needs_capture' ? await createCaptureRequests(property, missing) : []
    await service.from('properties').update({ status, updated_at: Date.now() }).eq('id', property.id)
    await service.from('workflow_jobs').update({ status: 'completed', completed_at: new Date().toISOString(), progress_phase: 'complete', progress_message: summary, result: { inputHash, rulesVersion: RULES_VERSION, status, coverage, captureRooms } }).eq('id', job.id)
    return { jobId: job.id, analysisRunId: run.id, status, coverage, captureRooms }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Analysis failed unexpectedly.'
      const retryAt = job.attempt_count < job.max_attempts ? new Date(Date.now() + Math.min(30, 2 ** job.attempt_count) * 60_000).toISOString() : null
      await service.from('workflow_jobs').update({ status: 'failed', error_message: message, completed_at: new Date().toISOString(), next_attempt_at: retryAt, progress_phase: 'failed', progress_message: retryAt ? 'Analysis failed safely. It can be retried without changing the original evidence.' : 'Analysis reached its retry limit and needs a human decision.' }).eq('id', job.id)
      throw error
    }
  }

  // The HTTP caller receives its durable job id immediately. Supabase keeps
  // this task alive after the response, while workflow state is stored first
  // so an interrupted execution remains visible and can be retried safely.
  EdgeRuntime.waitUntil(run().catch((error) => console.error('openhouse-ai background analysis failed', error)))
  return { jobId: job.id, status: 'queued', attempt, maxAttempts: job.max_attempts, inputHash, rulesVersion: RULES_VERSION }
}

async function retryAnalysis(userId: string, propertyId: string) {
  const property = await propertyForMember(userId, propertyId)
  const { data: latest, error } = await service.from('workflow_jobs').select('attempt_count,max_attempts,status').eq('property_id', property.id).eq('kind', 'analysis').order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new ApiError('Could not inspect the prior analysis job.', 502)
  if (!latest || latest.status !== 'failed') throw new ApiError('Only a failed analysis can be retried.', 409)
  if (latest.attempt_count >= latest.max_attempts) throw new ApiError('This analysis reached its retry limit and needs human review.', 409)
  return queueAnalysis(userId, property.id, latest.attempt_count + 1)
}

async function analysisStatus(userId: string, propertyId: string) {
  const property = await propertyForMember(userId, propertyId)
  const { data: job, error } = await service.from('workflow_jobs').select('id,kind,status,attempt_count,max_attempts,next_attempt_at,progress_phase,progress_message,error_message,created_at,started_at,completed_at,result').eq('property_id', property.id).eq('kind', 'analysis').order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new ApiError('Could not load analysis status.', 502)
  return { propertyId: property.id, job: job ?? null }
}

async function processDueRetries(request: Request) {
  const expected = Deno.env.get('OPENHOUSE_WORKER_SECRET')
  if (!expected || request.headers.get('x-openhouse-worker-secret') !== expected) throw new ApiError('Worker authentication failed.', 401)
  const { data: jobs, error } = await service.from('workflow_jobs')
    .select('id,property_id,attempt_count,max_attempts')
    .eq('kind', 'analysis').eq('status', 'failed')
    .lte('next_attempt_at', new Date().toISOString())
    .order('next_attempt_at', { ascending: true }).limit(10)
  if (error) throw new ApiError('Could not load due retries.', 502)
  let queued = 0
  for (const job of jobs ?? []) {
    if (job.attempt_count >= job.max_attempts) continue
    // Claim the retry before queuing a new attempt so two scheduler calls
    // cannot create duplicate jobs for the same failed attempt.
    const { data: claimed } = await service.from('workflow_jobs').update({ next_attempt_at: null, progress_message: 'Retry attempt is being queued by the worker.' })
      .eq('id', job.id).eq('status', 'failed').not('next_attempt_at', 'is', null).select('id').maybeSingle()
    if (!claimed) continue
    try {
      const { data: property } = await service.from('properties').select('workspace_id').eq('id', job.property_id).maybeSingle()
      if (!property) throw new ApiError('Property no longer exists.', 404)
      const { data: member } = await service.from('workspace_members').select('user_id').eq('workspace_id', property.workspace_id).order('created_at', { ascending: true }).limit(1).maybeSingle()
      if (!member) throw new ApiError('No workspace member can retry this analysis.', 409)
      await queueAnalysis(member.user_id, job.property_id, job.attempt_count + 1)
      queued += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not queue the retry.'
      await service.from('workflow_jobs').update({ next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString(), progress_message: message }).eq('id', job.id)
    }
  }
  return { queued }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const body = asObject(await request.json())
    if (body.action === 'process_due_retries') return json(await processDueRetries(request))
    const user = await requireUser(request)
    if (body.action === 'analyze_property') {
      const propertyId = asString(body.propertyId, 120)
      if (!propertyId) throw new ApiError('A property id is required.')
      return json(await queueAnalysis(user.id, propertyId))
    }
    if (body.action === 'retry_analysis') return json(await retryAnalysis(user.id, asString(body.propertyId, 120)))
    if (body.action === 'analysis_status') return json(await analysisStatus(user.id, asString(body.propertyId, 120)))
    if (body.action === 'answer') return json({ answer: 'OpenHouse does not have enough verified evidence to answer that yet.', badge: 'Not verified' })
    throw new ApiError('Unknown AI action.', 404)
  } catch (error) {
    const known = error instanceof ApiError ? error : new ApiError('OpenHouse analysis failed.', 502)
    console.error('openhouse-ai', error)
    return json({ error: known.message }, known.status)
  }
})

