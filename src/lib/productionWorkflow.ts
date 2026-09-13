import { supabase } from './supabase'
import { invokeOpenHouseAi } from './openhouseApi'

type UploadTicket = { bucket: 'property-media' | 'captures'; path: string; token: string }

type WorkflowResponse<T> = Promise<T>

async function callWorkflow<T>(action: string, payload: Record<string, unknown> = {}): WorkflowResponse<T> {
  const { data, error } = await supabase.functions.invoke('openhouse-workflow', { body: { action, ...payload } })
  if (error) throw new Error(error.message || 'OpenHouse workflow request failed.')
  if (data?.error) throw new Error(data.error)
  return data as T
}

async function upload(ticket: UploadTicket, file: File) {
  const { error } = await supabase.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path, ticket.token, file, {
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`)
}

export type PropertyIntake = {
  workspaceId: string
  title: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  price: string
  description: string
  rooms: Array<{ name: string; captured: boolean }>
}

export async function createProductionProperty(input: PropertyIntake, files: File[]) {
  if (!files.length) throw new Error('Attach at least one property image, video, or floor plan.')
  const property = await callWorkflow<{ id: string }>('create_property', { input })
  for (const file of files) {
    const ticket = await callWorkflow<UploadTicket>('property_upload_url', { propertyId: property.id, fileName: file.name })
    await upload(ticket, file)
    await callWorkflow('record_property_media', {
      input: {
        propertyId: property.id,
        storagePath: ticket.path,
        kind: file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'floor_plan' : 'image',
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      },
    })
  }
  const analysis = await invokeOpenHouseAi<{ jobId: string; status: string; captureRooms: string[] }>('analyze_property', { propertyId: property.id })
  return { property, analysis }
}

export async function completeProductionCapture(captureToken: string, file: File) {
  const ticket = await callWorkflow<UploadTicket>('capture_upload_url', { captureToken, fileName: file.name })
  await upload(ticket, file)
  const capture = await callWorkflow<{ propertyId: string; status: string }>('complete_capture', {
    captureToken,
    storagePath: ticket.path,
    originalName: file.name,
    mimeType: file.type || 'video/webm',
    sizeBytes: file.size,
  })
  const analysis = await invokeOpenHouseAi<{ jobId: string; status: string; captureRooms: string[] }>('analyze_property', { propertyId: capture.propertyId })
  return { ...capture, analysis }
}

export type PublicExperience = {
  experience: { publicToken: string; publishedAt: string }
  property: { id: string; title: string; address: string; price: string; description: string }
  spaces: Array<{ id: string; name: string; verified: boolean; confidence: number; issue: string | null }>
  media: Array<{ url: string | null; room_name: string | null; kind: string; verified: boolean }>
}

export function getPublicExperience(publicToken: string) {
  return callWorkflow<PublicExperience>('public_experience', { publicToken })
}

export function createPublicBooking(publicToken: string, input: {
  name: string; email: string; phone: string; preferredDate: string; preferredTime: string; message?: string
}) {
  return callWorkflow<{ id: string; status: string }>('create_booking', { publicToken, ...input })
}

export function publishProductionProperty(propertyId: string) {
  return callWorkflow<{ publicToken: string; publicUrl: string }>('publish_property', { propertyId })
}

export function getProductionProperty(propertyId: string) {
  return callWorkflow<{
    property: { id: string; title: string; address: string; bedrooms: number; bathrooms: number; status: string; created_at: number }
    spaces: Array<{ id: string; name: string; captured: boolean; verified: boolean; confidence: number; issue: string | null }>
    captureRequests: Array<{ id: string; room: string; status: string; capture_url: string }>
    jobs: Array<{ id: string; kind: string; status: string; attempt_count?: number; max_attempts?: number; progress_phase?: string; progress_message?: string | null; error_message?: string | null }>
  }>('get_property', { propertyId })
}

export function listProductionProperties(workspaceId: string) {
  return callWorkflow<Array<{
    id: string; title: string; address: string; type: string; bedrooms: number; bathrooms: number; price: string; status: string; cover_image: string | null; updated_at: number
  }>>('list_properties', { workspaceId })
}

export type ProductionDashboard = {
  properties: Array<{ id: string; title: string; address: string; type: string; bedrooms: number; bathrooms: number; price: string; status: string; cover_image: string | null; created_at: number; updated_at: number }>
  captures: Array<{ id: string; property_id: string; property_title: string; room: string; reason: string; instructions: string; estimated_time: string; status: string; recipient_name: string; capture_url: string; capture_token: string; expires_at: string | null; attempt_count: number; created_at: number; updated_at: number }>
  jobs: Array<{ id: string; property_id: string; kind: string; status: string; attempt_count: number; max_attempts: number; next_attempt_at: string | null; progress_phase: string; progress_message: string | null; result: Record<string, unknown> | null; error_message: string | null; created_at: string; started_at: string | null; completed_at: string | null }>
  experiences: Array<{ id: string; property_id: string; version: number; status: string; public_token: string | null; published_at: string | null; created_at: string }>
}

export function getProductionWorkspaceDashboard(workspaceId: string) {
  return callWorkflow<ProductionDashboard>('workspace_dashboard', { workspaceId })
}

export type AnalysisJobStatus = {
  propertyId: string
  job: null | {
    id: string
    status: 'queued' | 'running' | 'completed' | 'failed'
    attempt_count: number
    max_attempts: number
    next_attempt_at: string | null
    progress_phase: string
    progress_message: string | null
    error_message: string | null
    created_at: string
    started_at: string | null
    completed_at: string | null
  }
}

export function getAnalysisStatus(propertyId: string) {
  return invokeOpenHouseAi<AnalysisJobStatus>('analysis_status', { propertyId })
}

export function retryProductionAnalysis(propertyId: string) {
  return invokeOpenHouseAi<{ jobId: string; status: string; attempt: number; maxAttempts: number }>('retry_analysis', { propertyId })
}

export type ImportedListingPayload = {
  title?: string
  address?: string
  propertyType?: string
  bedrooms?: number | null
  bathrooms?: number | null
  price?: string
  description?: string
  mediaUrls?: string[]
  spaces?: string[]
  sourceReference?: string
  sourceUrl?: string
}

export type ImportedListingRecord = {
  id: string
  workspace_id: string
  listing_source_id: string | null
  import_kind: 'csv' | 'url' | 'connected_source'
  status: 'new' | 'in_review' | 'incomplete' | 'added' | 'ignored' | 'failed'
  title: string | null
  address: string | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  price: string | null
  description: string | null
  media_urls: string[]
  spaces: string[]
  source_reference: string | null
  source_url: string | null
  error_message: string | null
  added_property_id: string | null
  created_at: string
  updated_at: string
}

export function previewListingUrl(url: string) {
  return callWorkflow<{ listing: ImportedListingPayload }>('preview_listing_url', { url })
}

export function createImportedListings(workspaceId: string, kind: ImportedListingRecord['import_kind'], listings: ImportedListingPayload[], sourceId?: string) {
  return callWorkflow<{ listings: ImportedListingRecord[]; created: number }>('create_imported_listings', { workspaceId, kind, listings, sourceId })
}

export function listImportedListings(workspaceId: string) {
  return callWorkflow<ImportedListingRecord[]>('list_imported_listings', { workspaceId })
}

export function getImportedListing(listingId: string) {
  return callWorkflow<ImportedListingRecord>('get_imported_listing', { listingId })
}

export function updateImportedListingStatus(listingId: string, status: 'new' | 'in_review' | 'ignored') {
  return callWorkflow<ImportedListingRecord>('update_imported_listing_status', { listingId, status })
}

export function markImportedListingAdded(listingId: string, propertyId: string) {
  return callWorkflow<{ id: string; propertyId: string; status: 'added' }>('mark_import_added', { listingId, propertyId })
}

export type ListingSource = {
  id: string
  workspace_id: string
  name: string
  kind: 'mls_reso' | 'crm' | 'other'
  status: 'draft' | 'configured' | 'active' | 'error' | 'disabled'
  endpoint: string | null
  credential_secret_ref: string | null
  last_synced_at: string | null
  last_sync_status: string | null
  last_sync_message: string | null
  created_at: string
  updated_at: string
}

export function listListingSources(workspaceId: string) {
  return callWorkflow<ListingSource[]>('list_listing_sources', { workspaceId })
}

export function createListingSource(workspaceId: string, input: { name: string; kind: ListingSource['kind']; endpoint?: string; credentialSecretRef?: string; provider?: string }) {
  return callWorkflow<ListingSource>('create_listing_source', { workspaceId, input })
}
