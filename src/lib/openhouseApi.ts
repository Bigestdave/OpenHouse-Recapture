import { supabase, isSupabaseConfigured } from './supabase'
import { isProductionMode } from './runtime'

export type SpatialFinding = {
  fromRoom: string
  toRoom: string
  reason: string
  recommendedCaptureTimeSeconds: number
}

export type SpatialAnalysisResponse = {
  passed: boolean
  totalSpacesDetected: number
  expectedSpaces: number
  missingConnections: SpatialFinding[]
  confidenceScore: number
}

/** Calls the server-side OpenHouse function. Provider keys stay in function secrets. */
export async function invokeOpenHouseAi<T>(
  action: 'analyze_property' | 'analysis_status' | 'retry_analysis' | 'answer',
  payload: Record<string, unknown>,
): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error('OpenHouse services are not configured.')
  }

  const { data, error } = await supabase.functions.invoke('openhouse-ai', {
    body: { action, ...payload },
  })

  if (error) {
    throw new Error(error.message || 'OpenHouse service request failed.')
  }
  return data as T
}

export function assertProductionServicesConfigured() {
  if (isProductionMode && !isSupabaseConfigured) {
    throw new Error('Production mode requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
}
