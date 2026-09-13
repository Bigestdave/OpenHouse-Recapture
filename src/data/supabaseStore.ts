import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Property, CaptureRequest, Booking, Workspace, StoreState } from './types'

/**
 * Maps a Supabase property row to the client-side Property model.
 */
function mapRowToProperty(row: any): Property {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    address: row.address,
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    price: row.price,
    description: row.description,
    status: row.status,
    spaces: Array.isArray(row.spaces) ? row.spaces : [],
    sourceMedia: Array.isArray(row.source_media) ? row.source_media : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    experienceUrl: row.experience_url || undefined,
    coverImage: row.cover_image || undefined,
    createdAt: Number(row.created_at) || Date.now(),
    updatedAt: Number(row.updated_at) || Date.now(),
  }
}

/**
 * Maps a client-side Property model to Supabase table row format.
 */
function mapPropertyToRow(p: Property) {
  return {
    id: p.id,
    workspace_id: p.workspaceId || 'ws-default',
    title: p.title,
    address: p.address,
    type: p.type,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    price: p.price,
    description: p.description,
    status: p.status,
    spaces: p.spaces,
    source_media: p.sourceMedia,
    timeline: p.timeline,
    experience_url: p.experienceUrl || null,
    cover_image: p.coverImage || null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }
}

/**
 * Maps a Supabase capture request row to CaptureRequest model.
 */
function mapRowToCaptureRequest(row: any): CaptureRequest {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    room: row.room,
    reason: row.reason,
    instructions: row.instructions,
    estimatedTime: row.estimated_time,
    status: row.status,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone || undefined,
    recipientEmail: row.recipient_email || undefined,
    captureUrl: row.capture_url,
    uploadedMedia: Array.isArray(row.uploaded_media) ? row.uploaded_media : undefined,
    createdAt: Number(row.created_at) || Date.now(),
    updatedAt: Number(row.updated_at) || Date.now(),
  }
}

/**
 * Maps a client CaptureRequest model to Supabase table row format.
 */
function mapCaptureRequestToRow(cr: CaptureRequest) {
  return {
    id: cr.id,
    property_id: cr.propertyId,
    property_title: cr.propertyTitle,
    room: cr.room,
    reason: cr.reason,
    instructions: cr.instructions,
    estimated_time: cr.estimatedTime,
    status: cr.status,
    recipient_name: cr.recipientName,
    recipient_phone: cr.recipientPhone || null,
    recipient_email: cr.recipientEmail || null,
    capture_url: cr.captureUrl,
    uploaded_media: cr.uploadedMedia || null,
    created_at: cr.createdAt,
    updated_at: cr.updatedAt,
  }
}

/**
 * Maps a Supabase booking row to Booking model.
 */
function mapRowToBooking(row: any): Booking {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    renterName: row.renter_name,
    renterPhone: row.renter_phone,
    renterEmail: row.renter_email,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    message: row.message || undefined,
    status: row.status,
    createdAt: Number(row.created_at) || Date.now(),
  }
}

/**
 * Maps a client Booking model to Supabase table row format.
 */
function mapBookingToRow(b: Booking) {
  return {
    id: b.id,
    property_id: b.propertyId,
    property_title: b.propertyTitle,
    renter_name: b.renterName,
    renter_phone: b.renterPhone,
    renter_email: b.renterEmail,
    preferred_date: b.preferredDate,
    preferred_time: b.preferredTime,
    message: b.message || null,
    status: b.status,
    created_at: b.createdAt,
  }
}

/**
 * Fetches the entire workspace and property state from Supabase.
 * Returns null if Supabase is not configured or an error occurs.
 */
export async function fetchCloudStoreState(): Promise<Partial<StoreState> | null> {
  if (!isSupabaseConfigured) return null

  try {
    const { data: workspaceResult, error: workspaceFunctionError } = await supabase.functions.invoke('openhouse-workflow', {
      body: { action: 'get_workspace' },
    })
    if (workspaceFunctionError || workspaceResult?.error) {
      console.warn('[SupabaseStore] Failed to resolve workspace from workflow:', workspaceFunctionError?.message || workspaceResult?.error)
    }

    // The workflow is the authority for a member's selected workspace.  A
    // direct owner lookup is deliberately retained as a recovery path: a
    // temporary Edge Function failure must not make a signed-in owner appear
    // to have no workspace or block the Properties empty state.
    let wsData = workspaceResult?.workspace ?? null
    if (!wsData) {
      const { data: authData } = await supabase.auth.getUser()
      if (authData.user) {
        const { data: ownedWorkspace, error: ownedWorkspaceError } = await (supabase.from('workspaces') as any)
          .select('*')
          .eq('owner_user_id', authData.user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
        if (ownedWorkspaceError) {
          console.warn('[SupabaseStore] Fallback workspace lookup failed:', ownedWorkspaceError.message)
        } else {
          wsData = ownedWorkspace
        }
      }
    }

    const [
      { data: propData, error: propError },
      { data: crData },
      { data: bookData },
    ] = await Promise.all([
      (supabase.from('properties') as any).select('*').order('created_at', { ascending: false }),
      (supabase.from('capture_requests') as any).select('*').order('created_at', { ascending: false }),
      (supabase.from('bookings') as any).select('*').order('created_at', { ascending: false }),
    ])

    if (propError) {
      console.warn('[SupabaseStore] Failed to fetch properties from cloud:', propError.message)
      return null
    }

    const properties: Property[] = (propData || []).map(mapRowToProperty)
    const captureRequests: CaptureRequest[] = (crData || []).map(mapRowToCaptureRequest)
    const bookings: Booking[] = (bookData || []).map(mapRowToBooking)

    let workspace: Workspace | null = null
    if (wsData) {
      workspace = {
        id: wsData.id,
        name: wsData.name,
        ownerName: wsData.owner_name,
        ownerEmail: wsData.owner_email,
        workType: (wsData.work_type as any) || 'agency',
        portfolioSize: wsData.portfolio_size,
        primaryMarket: wsData.primary_market,
        teamSize: wsData.team_size,
        listingSource: (wsData.listing_source as any) || 'demo',
        requireApproval: wsData.require_approval,
        defaultVisibility: (wsData.default_visibility as any) || 'unlisted',
        notificationPreferences: wsData.notification_preferences,
        branding: wsData.branding || undefined,
        createdAt: Number(wsData.created_at) || Date.now(),
      }
    }

    return {
      workspace: workspace || undefined,
      properties,
      captureRequests,
      bookings,
    }
  } catch (err: any) {
    console.warn('[SupabaseStore] Cloud hydration error:', err.message)
    return null
  }
}

/**
 * Asynchronously persists workspace updates to Supabase.
 */
export async function syncWorkspaceToCloud(workspace: Workspace): Promise<void> {
  if (!isSupabaseConfigured) return

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw new Error('A signed-in user is required to save a workspace.')
  const { error } = await (supabase.from('workspaces') as any).upsert({
      id: workspace.id,
      owner_user_id: authData.user.id,
      name: workspace.name,
      owner_name: workspace.ownerName,
      owner_email: workspace.ownerEmail,
      work_type: workspace.workType,
      portfolio_size: workspace.portfolioSize,
      primary_market: workspace.primaryMarket,
      team_size: workspace.teamSize,
      listing_source: workspace.listingSource,
      require_approval: workspace.requireApproval,
      default_visibility: workspace.defaultVisibility,
      notification_preferences: workspace.notificationPreferences,
      branding: workspace.branding || null,
      created_at: workspace.createdAt,
      updated_at: Date.now(),
  })
  if (error) throw new Error(`Could not create workspace: ${error.message}`)
}

/**
 * Asynchronously persists a property insert or update to Supabase.
 */
export async function syncPropertyToCloud(property: Property): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    const row = mapPropertyToRow(property)
    await (supabase.from('properties') as any).upsert(row)
  } catch (err) {
    console.warn('[SupabaseStore] Failed to sync property:', err)
  }
}

/**
 * Asynchronously removes a property from Supabase.
 */
export async function deletePropertyFromCloud(id: string): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    await (supabase.from('properties') as any).delete().eq('id', id)
  } catch (err) {
    console.warn('[SupabaseStore] Failed to delete property from cloud:', err)
  }
}

/**
 * Asynchronously persists a capture request insert or update to Supabase.
 */
export async function syncCaptureRequestToCloud(request: CaptureRequest): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    const row = mapCaptureRequestToRow(request)
    await (supabase.from('capture_requests') as any).upsert(row)
  } catch (err) {
    console.warn('[SupabaseStore] Failed to sync capture request:', err)
  }
}

/**
 * Asynchronously persists a booking to Supabase.
 */
export async function syncBookingToCloud(booking: Booking): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    const row = mapBookingToRow(booking)
    await (supabase.from('bookings') as any).upsert(row)
  } catch (err) {
    console.warn('[SupabaseStore] Failed to sync booking:', err)
  }
}

