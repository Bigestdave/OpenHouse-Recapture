import { supabase } from './supabase'

export type RecaptureEvent = {
  id: string
  action: string
  actor: 'agent' | 'realtor' | 'photographer' | 'system'
  external_app: 'google_calendar' | 'google_drive' | 'telegram' | 'gmail' | 'arga' | 'lemma' | null
  external_ref: string | null
  payload: Record<string, unknown>
  created_at: string
}

export type RecaptureMission = {
  id: string
  property_id: string
  capture_request_id: string | null
  gap_type: 'missing_connection' | 'missing_room' | 'low_light' | 'poor_coverage' | 'blurred_media'
  from_space: string | null
  to_space: string | null
  severity: 'blocking' | 'advisory'
  reason: string
  capture_instruction: string
  status: 'detected' | 'planning' | 'awaiting_realtor_approval' | 'scheduled' | 'capture_uploaded' | 'verifying' | 'resolved' | 'needs_follow_up' | 'failed' | 'cancelled'
  scheduled_for: string | null
  created_at: string
  updated_at: string
  property?: { id: string; title: string; address: string } | null
  events?: RecaptureEvent[]
}

async function callRecapture<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('openhouse-recapture', { body: { action, ...payload } })
  if (error) throw new Error(error.message || 'Recapture agent request failed.')
  if (data?.error) throw new Error(data.error)
  return data as T
}

export function listRecaptureMissions(workspaceId: string) {
  return callRecapture<RecaptureMission[]>('list_missions', { workspaceId })
}

export function startRecaptureMission(input: {
  propertyId: string
  gapType: RecaptureMission['gap_type']
  severity: RecaptureMission['severity']
  fromSpace?: string
  toSpace?: string
  reason: string
  scheduledFor?: string
  approvalRequired?: boolean
}) {
  return callRecapture<{ mission: RecaptureMission; duplicate: boolean }>('start_mission', input)
}

export function approveRecaptureMission(missionId: string, scheduledFor: string) {
  return callRecapture<RecaptureMission>('approve_mission', { missionId, scheduledFor })
}

export function verifyRecaptureMission(missionId: string, resolved: boolean, remainingReason?: string) {
  return callRecapture<RecaptureMission>('verify_mission', { missionId, resolved, remainingReason })
}

