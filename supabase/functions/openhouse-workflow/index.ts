// OpenHouse persisted MVP workflow API.
// Deploy with: supabase functions deploy openhouse-workflow --no-verify-jwt
// Supabase provides SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL to Edge Functions.
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

// New Supabase projects provision secret keys as a named JSON dictionary.
// Keep the legacy variable as a backwards-compatible fallback for older
// projects, but do not depend on a user-created copy of either secret.
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

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('OPENHOUSE_ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

class WorkflowError extends Error {
  constructor(message: string, readonly status = 400) { super(message) }
}
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: corsHeaders })
const requireString = (value: unknown, name: string, max = 500) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new WorkflowError(`Invalid ${name}.`)
  return value.trim()
}
const asObject = (value: unknown) => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const optionalString = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''

async function requireUser(request: Request) {
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) throw new WorkflowError('Authentication required.', 401)
  const accessToken = authorization.slice('Bearer '.length)
  const { data, error } = await service.auth.getUser(accessToken)
  if (error || !data.user) throw new WorkflowError('Authentication required.', 401)
  return data.user
}

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data, error } = await service.from('workspace_members')
    .select('workspace_id').eq('workspace_id', workspaceId).eq('user_id', userId).maybeSingle()
  if (error || !data) throw new WorkflowError('You do not have access to this workspace.', 403)
}

async function propertyForMember(userId: string, propertyId: string) {
  const { data: property, error } = await service.from('properties').select('*').eq('id', propertyId).maybeSingle()
  if (error || !property) throw new WorkflowError('Property not found.', 404)
  await assertWorkspaceMember(userId, property.workspace_id)
  return property
}

function fileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'upload.bin'
}

async function signedUpload(bucket: 'property-media' | 'captures', path: string) {
  const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) throw new WorkflowError('Could not prepare secure upload.', 502)
  return { bucket, path: data.path, token: data.token, signedUrl: data.signedUrl }
}

async function createProperty(userId: string, rawInput: unknown) {
  const input = asObject(rawInput)
  const workspaceId = requireString(input.workspaceId, 'workspace id', 120)
  await assertWorkspaceMember(userId, workspaceId)
  const rooms = Array.isArray(input.rooms) ? input.rooms.map((room) => asObject(room)).map((room) => ({
    name: requireString(room.name, 'room name', 120),
    captured: room.captured === true,
  })) : []
  if (!rooms.length) throw new WorkflowError('At least one advertised space is required.')
  const id = crypto.randomUUID()
  const timestamp = Date.now()
  const row = {
    id,
    workspace_id: workspaceId,
    title: requireString(input.title, 'title', 200),
    address: requireString(input.address, 'address', 300),
    type: requireString(input.type, 'property type', 120),
    bedrooms: Number.isFinite(input.bedrooms) ? Number(input.bedrooms) : 0,
    bathrooms: Number.isFinite(input.bathrooms) ? Number(input.bathrooms) : 0,
    price: requireString(input.price, 'price', 120),
    description: typeof input.description === 'string' ? input.description.slice(0, 4000) : '',
    status: 'checking_media',
    spaces: [], source_media: [], timeline: [],
    created_at: timestamp, updated_at: timestamp,
  }
  const { error } = await service.from('properties').insert(row)
  if (error) throw new WorkflowError(`Could not create property: ${error.message}`, 502)
  const { error: spacesError } = await service.from('property_spaces').insert(rooms.map((room) => ({
    property_id: id, name: room.name, captured: room.captured,
  })))
  if (spacesError) throw new WorkflowError(`Could not create property spaces: ${spacesError.message}`, 502)
  return { id, status: row.status }
}

async function recordPropertyMedia(userId: string, rawInput: unknown) {
  const input = asObject(rawInput)
  const property = await propertyForMember(userId, requireString(input.propertyId, 'property id', 120))
  const storagePath = requireString(input.storagePath, 'storage path', 500)
  if (!storagePath.startsWith(`${property.id}/`)) throw new WorkflowError('Invalid property media path.', 403)
  const { data, error } = await service.from('media_assets').insert({
    property_id: property.id,
    storage_bucket: 'property-media',
    kind: requireString(input.kind, 'media type', 20),
    storage_path: storagePath,
    original_name: requireString(input.originalName, 'file name', 240),
    mime_type: requireString(input.mimeType, 'media type', 160),
    size_bytes: Number(input.sizeBytes) || 0,
    room_name: typeof input.roomName === 'string' ? input.roomName.slice(0, 120) : null,
  }).select('id').single()
  if (error || !data) throw new WorkflowError(`Could not record media: ${error?.message ?? 'Unknown error'}`, 502)
  return data
}

async function publishProperty(userId: string, propertyId: string) {
  const property = await propertyForMember(userId, propertyId)
  if (!['ready_for_review', 'live'].includes(property.status)) throw new WorkflowError('Property must complete review before publication.', 409)
  const { data: latest } = await service.from('experience_versions').select('version').eq('property_id', property.id).order('version', { ascending: false }).limit(1).maybeSingle()
  const token = crypto.randomUUID()
  const { data, error } = await service.from('experience_versions').insert({
    property_id: property.id, version: (latest?.version ?? 0) + 1, status: 'published', public_token: token, published_at: new Date().toISOString(),
  }).select().single()
  if (error || !data) throw new WorkflowError('Could not publish experience.', 502)
  await service.from('properties').update({ status: 'live', updated_at: Date.now() }).eq('id', property.id)
  return { id: data.id, publicToken: token, publicUrl: `/public/${token}` }
}

async function productionProperty(userId: string, propertyId: string) {
  const property = await propertyForMember(userId, propertyId)
  const [{ data: spaces }, { data: captures }, { data: jobs }] = await Promise.all([
    service.from('property_spaces').select('*').eq('property_id', property.id).order('name'),
    service.from('capture_requests').select('id,room,reason,instructions,status,capture_url,attempt_count,created_at,updated_at').eq('property_id', property.id).order('updated_at', { ascending: false }),
    service.from('workflow_jobs').select('id,kind,status,attempt_count,max_attempts,next_attempt_at,progress_phase,progress_message,result,error_message,created_at,completed_at').eq('property_id', property.id).order('created_at', { ascending: false }),
  ])
  return { property, spaces: spaces ?? [], captureRequests: captures ?? [], jobs: jobs ?? [] }
}

async function listWorkspaceProperties(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const { data, error } = await service.from('properties')
    .select('id,title,address,type,bedrooms,bathrooms,price,status,cover_image,created_at,updated_at')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  if (error) throw new WorkflowError('Could not load workspace properties.', 502)
  return data ?? []
}

// This is deliberately a read model, not a second source of truth. The
// workspace screens need properties, capture requests, jobs, and published
// versions together, but every record remains owned by the tables above.
async function workspaceDashboard(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const { data: properties, error: propertiesError } = await service.from('properties')
    .select('id,title,address,type,bedrooms,bathrooms,price,status,cover_image,created_at,updated_at')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  if (propertiesError) throw new WorkflowError('Could not load workspace properties.', 502)

  const propertyIds = (properties ?? []).map((property) => property.id)
  if (!propertyIds.length) return { properties: [], captures: [], jobs: [], experiences: [] }

  const [{ data: captures, error: capturesError }, { data: jobs, error: jobsError }, { data: experiences, error: experiencesError }] = await Promise.all([
    service.from('capture_requests').select('id,property_id,property_title,room,reason,instructions,estimated_time,status,recipient_name,capture_url,capture_token,expires_at,attempt_count,created_at,updated_at').in('property_id', propertyIds).order('updated_at', { ascending: false }),
    service.from('workflow_jobs').select('id,property_id,kind,status,attempt_count,max_attempts,next_attempt_at,progress_phase,progress_message,result,error_message,created_at,started_at,completed_at').in('property_id', propertyIds).order('created_at', { ascending: false }),
    service.from('experience_versions').select('id,property_id,version,status,public_token,published_at,created_at').in('property_id', propertyIds).order('version', { ascending: false }),
  ])
  if (capturesError || jobsError || experiencesError) throw new WorkflowError('Could not load workspace workflow records.', 502)
  return { properties: properties ?? [], captures: captures ?? [], jobs: jobs ?? [], experiences: experiences ?? [] }
}

type ImportedListingInput = {
  title: string
  address: string
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  price: string
  description: string
  mediaUrls: string[]
  spaces: string[]
  sourceReference: string
  sourceUrl: string
  rawData: Record<string, unknown>
}

function asNumber(value: unknown) {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[^0-9.]/g, '')) : NaN
  return Number.isFinite(number) && number >= 0 && number <= 1000 ? number : null
}

function stringList(value: unknown, maxItems = 30, maxLength = 500) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean))].slice(0, maxItems).map((item) => item.slice(0, maxLength))
}

function importedListingInput(value: unknown): ImportedListingInput {
  const raw = asObject(value)
  const title = optionalString(raw.title ?? raw.name, 200)
  const address = optionalString(raw.address ?? raw.location, 300)
  const propertyType = optionalString(raw.propertyType ?? raw.type ?? raw.listingType, 120)
  const price = optionalString(raw.price ?? raw.listPrice, 120)
  const description = optionalString(raw.description, 4000)
  const sourceReference = optionalString(raw.sourceReference ?? raw.reference ?? raw.mlsNumber ?? raw.mlsId, 160)
  const sourceUrl = optionalString(raw.sourceUrl ?? raw.url, 1800)
  return {
    title, address, propertyType, bedrooms: asNumber(raw.bedrooms ?? raw.beds), bathrooms: asNumber(raw.bathrooms ?? raw.baths), price, description,
    mediaUrls: stringList(raw.mediaUrls ?? raw.images, 40, 1800).filter((url) => /^https:\/\//i.test(url)),
    spaces: stringList(raw.spaces ?? raw.rooms, 40, 120), sourceReference, sourceUrl,
    rawData: { title, address, propertyType, bedrooms: asNumber(raw.bedrooms ?? raw.beds), bathrooms: asNumber(raw.bathrooms ?? raw.baths), price, sourceReference, sourceUrl },
  }
}

async function fingerprintForListing(workspaceId: string, listing: ImportedListingInput) {
  const identity = JSON.stringify([workspaceId, listing.sourceUrl.toLowerCase(), listing.sourceReference.toLowerCase(), listing.title.toLowerCase(), listing.address.toLowerCase()])
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function incompleteListing(listing: ImportedListingInput) {
  return !listing.title || !listing.address
}

async function createImportedListings(userId: string, workspaceId: string, kind: 'csv' | 'url' | 'connected_source', values: unknown[], sourceId?: string) {
  await assertWorkspaceMember(userId, workspaceId)
  if (!['csv', 'url', 'connected_source'].includes(kind)) throw new WorkflowError('Invalid import kind.', 400)
  if (!values.length || values.length > 100) throw new WorkflowError('Import between 1 and 100 listings at a time.', 400)
  if (sourceId) {
    const { data: source } = await service.from('listing_sources').select('id').eq('id', sourceId).eq('workspace_id', workspaceId).maybeSingle()
    if (!source) throw new WorkflowError('Listing source not found.', 404)
  }
  const listings = await Promise.all(values.map(async (value) => {
    const listing = importedListingInput(value)
    return {
      workspace_id: workspaceId, listing_source_id: sourceId ?? null, import_kind: kind,
      source_url: listing.sourceUrl || null, source_reference: listing.sourceReference || null,
      fingerprint: await fingerprintForListing(workspaceId, listing), status: incompleteListing(listing) ? 'incomplete' : kind === 'url' ? 'in_review' : 'new',
      title: listing.title || null, address: listing.address || null, property_type: listing.propertyType || null,
      bedrooms: listing.bedrooms, bathrooms: listing.bathrooms, price: listing.price || null, description: listing.description || null,
      media_urls: listing.mediaUrls, spaces: listing.spaces, raw_data: listing.rawData, updated_at: new Date().toISOString(),
    }
  }))
  const { data, error } = await service.from('imported_listings').upsert(listings, { onConflict: 'workspace_id,fingerprint' }).select()
  if (error) throw new WorkflowError(`Could not save imported listings: ${error.message}`, 502)
  return { listings: data ?? [], created: (data ?? []).length }
}

async function importedListingsForMember(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const { data, error } = await service.from('imported_listings').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false })
  if (error) throw new WorkflowError('Could not load imported listings.', 502)
  return data ?? []
}

async function importedListingForMember(userId: string, listingId: string) {
  const { data, error } = await service.from('imported_listings').select('*').eq('id', listingId).maybeSingle()
  if (error || !data) throw new WorkflowError('Imported listing not found.', 404)
  await assertWorkspaceMember(userId, data.workspace_id)
  return data
}

async function updateImportedListingStatus(userId: string, listingId: string, status: string) {
  if (!['new', 'in_review', 'ignored'].includes(status)) throw new WorkflowError('Invalid listing review status.', 400)
  const listing = await importedListingForMember(userId, listingId)
  if (listing.status === 'added') throw new WorkflowError('An added listing cannot be returned to the inbox.', 409)
  const { data, error } = await service.from('imported_listings').update({ status, updated_at: new Date().toISOString() }).eq('id', listing.id).select().single()
  if (error || !data) throw new WorkflowError('Could not update imported listing.', 502)
  return data
}

async function markImportAdded(userId: string, listingId: string, propertyId: string) {
  const [listing, property] = await Promise.all([importedListingForMember(userId, listingId), propertyForMember(userId, propertyId)])
  if (listing.workspace_id !== property.workspace_id) throw new WorkflowError('The property and import must be in the same workspace.', 403)
  const { error } = await service.from('imported_listings').update({ status: 'added', added_property_id: property.id, updated_at: new Date().toISOString() }).eq('id', listing.id)
  if (error) throw new WorkflowError('Could not mark imported listing as added.', 502)
  return { id: listing.id, propertyId: property.id, status: 'added' }
}

function safePublicListingUrl(value: string) {
  let url: URL
  try { url = new URL(value) } catch { throw new WorkflowError('Enter a valid public listing URL.', 400) }
  const host = url.hostname.toLowerCase()
  const blocked = host === 'localhost' || host.endsWith('.local') || host === '::1' || /^127\./.test(host) || /^0\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || blocked) throw new WorkflowError('That URL is not an eligible public listing page.', 400)
  return url
}

function cleanMarkup(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function flattenJsonLd(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd)
  const object = asObject(value)
  if (!Object.keys(object).length) return []
  const graph = Array.isArray(object['@graph']) ? object['@graph'].flatMap(flattenJsonLd) : []
  return [object, ...graph]
}

async function previewListingUrl(value: string) {
  const url = safePublicListingUrl(value)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  let response: Response
  try {
    response = await fetch(url, { method: 'GET', redirect: 'error', signal: controller.signal, headers: { Accept: 'text/html,application/xhtml+xml' } })
  } catch {
    throw new WorkflowError('OpenHouse could not read that public listing URL.', 422)
  } finally { clearTimeout(timeout) }
  if (!response.ok) throw new WorkflowError('OpenHouse could not read that public listing URL.', 422)
  const html = (await response.text()).slice(0, 1_500_000)
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
    try { return flattenJsonLd(JSON.parse(match[1])) } catch { return [] }
  })
  const candidate = blocks.find((item) => item.address || item.offers || item['@type'] === 'Residence' || item['@type'] === 'Apartment') ?? blocks[0] ?? {}
  const addressValue = candidate.address
  const address = typeof addressValue === 'string' ? addressValue : [optionalString(asObject(addressValue).streetAddress), optionalString(asObject(addressValue).addressLocality), optionalString(asObject(addressValue).addressRegion), optionalString(asObject(addressValue).postalCode)].filter(Boolean).join(', ')
  const offers = asObject(Array.isArray(candidate.offers) ? candidate.offers[0] : candidate.offers)
  const images = stringList(candidate.image ?? candidate.images, 12, 1800).filter((image) => /^https:\/\//i.test(image))
  const title = optionalString(candidate.name, 200) || cleanMarkup((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')).slice(0, 200)
  const preview = importedListingInput({ title, address, propertyType: candidate['@type'], bedrooms: candidate.numberOfRooms ?? candidate.numberOfBedrooms, bathrooms: candidate.numberOfBathroomsTotal, price: offers.price, description: cleanMarkup(optionalString(candidate.description, 6000)), mediaUrls: images, sourceUrl: url.toString() })
  if (!preview.title && !preview.address) throw new WorkflowError('That page does not expose enough standard listing data to import. Use CSV or add it manually.', 422)
  return preview
}

async function listingSourcesForMember(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const { data, error } = await service.from('listing_sources').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false })
  if (error) throw new WorkflowError('Could not load listing sources.', 502)
  return data ?? []
}

async function createListingSource(userId: string, workspaceId: string, rawInput: unknown) {
  await assertWorkspaceMember(userId, workspaceId)
  const input = asObject(rawInput)
  const kind = requireString(input.kind, 'source type', 30)
  if (!['mls_reso', 'crm', 'other'].includes(kind)) throw new WorkflowError('Invalid source type.', 400)
  const endpoint = optionalString(input.endpoint, 1800)
  if (endpoint) safePublicListingUrl(endpoint)
  const { data, error } = await service.from('listing_sources').insert({
    workspace_id: workspaceId, name: requireString(input.name, 'source name', 120), kind, status: 'draft', endpoint: endpoint || null,
    credential_secret_ref: optionalString(input.credentialSecretRef, 120) || null,
    configuration: { provider: optionalString(input.provider, 120), fieldMappingVersion: '1' }, updated_at: new Date().toISOString(),
  }).select().single()
  if (error || !data) throw new WorkflowError('Could not save the listing source.', 502)
  return data
}

async function workspaceForUser(userId: string) {
  const { data: membership, error: membershipError } = await service
    .from('workspace_members')
    .select('workspace_id,role,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (membershipError) throw new WorkflowError('Could not load workspace membership.', 502)
  if (!membership) return { workspace: null }

  const { data: workspace, error: workspaceError } = await service
    .from('workspaces')
    .select('*')
    .eq('id', membership.workspace_id)
    .maybeSingle()
  if (workspaceError) throw new WorkflowError('Could not load workspace.', 502)
  return { workspace: workspace ?? null, role: membership.role }
}

async function publicExperience(token: string) {
  const { data: experience, error } = await service.from('experience_versions').select('*').eq('public_token', token).eq('status', 'published').maybeSingle()
  if (error || !experience) throw new WorkflowError('Published experience not found.', 404)
  const [{ data: property }, { data: spaces }, { data: media }] = await Promise.all([
    service.from('properties').select('id,title,address,price,description,bedrooms,bathrooms,type').eq('id', experience.property_id).single(),
    service.from('property_spaces').select('id,name,verified,confidence,issue').eq('property_id', experience.property_id).order('name'),
    service.from('media_assets').select('storage_path,room_name,kind,verified').eq('property_id', experience.property_id).eq('verified', true).order('created_at'),
  ])
  if (!property) throw new WorkflowError('Published property not found.', 404)
  const mediaWithUrls = await Promise.all((media ?? []).map(async (asset) => {
    const { data } = await service.storage.from('property-media').createSignedUrl(asset.storage_path, 3600)
    return { ...asset, url: data?.signedUrl ?? null }
  }))
  return { experience: { publicToken: token, publishedAt: experience.published_at }, property, spaces: spaces ?? [], media: mediaWithUrls }
}

async function completePublicCapture(rawInput: unknown) {
  const input = asObject(rawInput)
  const token = requireString(input.captureToken, 'capture token', 120)
  const { data: capture, error } = await service.from('capture_requests').select('*').eq('capture_token', token).maybeSingle()
  if (error || !capture || (capture.expires_at && new Date(capture.expires_at).getTime() < Date.now())) throw new WorkflowError('This capture link is invalid or has expired.', 404)
  const storagePath = requireString(input.storagePath, 'storage path', 500)
  if (!storagePath.startsWith(`${capture.id}/`)) throw new WorkflowError('Invalid capture upload path.', 403)
  await service.from('media_assets').insert({ property_id: capture.property_id, capture_request_id: capture.id, kind: 'video', storage_bucket: 'captures', storage_path: storagePath, original_name: requireString(input.originalName, 'file name', 240), mime_type: requireString(input.mimeType, 'media type', 160), size_bytes: Number(input.sizeBytes) || 0, room_name: capture.room, verified: false, analysis_status: 'pending' })
  await service.from('capture_requests').update({ status: 'uploaded_pending_verification', attempt_count: (capture.attempt_count ?? 0) + 1, updated_at: Date.now() }).eq('id', capture.id)
  // Recapture missions are a separate, durable operational record. Tie the
  // secure mobile upload back to its mission so “footage received” is real
  // state, not a dashboard-only label.
  const { data: missions } = await service.from('recapture_missions')
    .select('id,status').eq('capture_request_id', capture.id).in('status', ['scheduled', 'needs_follow_up'])
  for (const mission of missions ?? []) {
    await service.from('recapture_missions').update({ status: 'capture_uploaded' }).eq('id', mission.id)
    await service.from('recapture_events').insert({
      mission_id: mission.id, action: 'capture_received', actor: 'photographer',
      payload: { assetPath: storagePath, captureRequestId: capture.id },
    })
  }
  await service.from('property_spaces').update({ captured: true, verified: false, confidence: 0, issue: 'New capture uploaded; awaiting evidence analysis.', updated_at: new Date().toISOString() }).eq('property_id', capture.property_id).eq('name', capture.room)
  await service.from('properties').update({ status: 'checking_media', updated_at: Date.now() }).eq('id', capture.property_id)
  return { propertyId: capture.property_id, status: 'checking_media' }
}

async function createBooking(rawInput: unknown) {
  const input = asObject(rawInput)
  const experience = await publicExperience(requireString(input.publicToken, 'public token', 120))
  const name = requireString(input.name, 'name', 160)
  const email = requireString(input.email, 'email', 254).toLowerCase()
  const phone = requireString(input.phone, 'phone', 80)
  const now = Date.now()
  const { count } = await service.from('bookings').select('*', { count: 'exact', head: true }).eq('property_id', experience.property.id).eq('renter_email', email).gt('created_at', now - 60 * 60 * 1000)
  if (count && count > 0) throw new WorkflowError('An inspection request from this email was already received recently.', 429)
  const { data, error } = await service.from('bookings').insert({
    id: crypto.randomUUID(), property_id: experience.property.id, property_title: experience.property.title,
    renter_name: name, renter_email: email, renter_phone: phone,
    preferred_date: requireString(input.preferredDate, 'preferred date', 80), preferred_time: requireString(input.preferredTime, 'preferred time', 80),
    message: typeof input.message === 'string' ? input.message.slice(0, 2000) : null, status: 'requested', created_at: now,
  }).select('id').single()
  if (error || !data) throw new WorkflowError('Could not submit inspection request.', 502)
  return { id: data.id, status: 'requested' }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405)
  try {
    const body = await request.json() as Record<string, unknown>
    const action = body.action
    if (action === 'public_experience') return reply(await publicExperience(requireString(body.publicToken, 'public token', 120)))
    if (action === 'create_booking') return reply(await createBooking(body))
    if (action === 'capture_upload_url') {
      const token = requireString(body.captureToken, 'capture token', 120)
      const { data: capture } = await service.from('capture_requests').select('id,expires_at').eq('capture_token', token).maybeSingle()
      if (!capture || (capture.expires_at && new Date(capture.expires_at).getTime() < Date.now())) throw new WorkflowError('This capture link is invalid or has expired.', 404)
      return reply(await signedUpload('captures', `${capture.id}/${Date.now()}-${fileName(requireString(body.fileName, 'file name', 240))}`))
    }
    if (action === 'complete_capture') return reply(await completePublicCapture(body))

    const user = await requireUser(request)
    if (action === 'get_workspace') return reply(await workspaceForUser(user.id))
    if (action === 'preview_listing_url') return reply({ listing: await previewListingUrl(requireString(body.url, 'listing URL', 1800)) })
    if (action === 'create_imported_listings') return reply(await createImportedListings(user.id, requireString(body.workspaceId, 'workspace id', 120), requireString(body.kind, 'import kind', 30) as 'csv' | 'url' | 'connected_source', Array.isArray(body.listings) ? body.listings : [], typeof body.sourceId === 'string' ? body.sourceId : undefined))
    if (action === 'list_imported_listings') return reply(await importedListingsForMember(user.id, requireString(body.workspaceId, 'workspace id', 120)))
    if (action === 'get_imported_listing') return reply(await importedListingForMember(user.id, requireString(body.listingId, 'listing id', 120)))
    if (action === 'update_imported_listing_status') return reply(await updateImportedListingStatus(user.id, requireString(body.listingId, 'listing id', 120), requireString(body.status, 'listing status', 30)))
    if (action === 'mark_import_added') return reply(await markImportAdded(user.id, requireString(body.listingId, 'listing id', 120), requireString(body.propertyId, 'property id', 120)))
    if (action === 'list_listing_sources') return reply(await listingSourcesForMember(user.id, requireString(body.workspaceId, 'workspace id', 120)))
    if (action === 'create_listing_source') return reply(await createListingSource(user.id, requireString(body.workspaceId, 'workspace id', 120), body.input))
    if (action === 'create_property') return reply(await createProperty(user.id, body.input))
    if (action === 'property_upload_url') {
      const property = await propertyForMember(user.id, requireString(body.propertyId, 'property id', 120))
      return reply(await signedUpload('property-media', `${property.id}/${Date.now()}-${fileName(requireString(body.fileName, 'file name', 240))}`))
    }
    if (action === 'record_property_media') return reply(await recordPropertyMedia(user.id, body.input))
    if (action === 'get_property') return reply(await productionProperty(user.id, requireString(body.propertyId, 'property id', 120)))
    if (action === 'list_properties') return reply(await listWorkspaceProperties(user.id, requireString(body.workspaceId, 'workspace id', 120)))
    if (action === 'workspace_dashboard') return reply(await workspaceDashboard(user.id, requireString(body.workspaceId, 'workspace id', 120)))
    if (action === 'analyze_property') throw new WorkflowError('Analysis is performed by the auditable OpenHouse AI evidence service.', 410)
    if (action === 'publish_property') return reply(await publishProperty(user.id, requireString(body.propertyId, 'property id', 120)))
    throw new WorkflowError('Unknown workflow action.', 404)
  } catch (error) {
    const known = error instanceof WorkflowError ? error : new WorkflowError('Workflow request failed.', 502)
    console.error('openhouse-workflow', error)
    return reply({ error: known.message }, known.status)
  }
})

