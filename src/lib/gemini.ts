/**
 * Client façade retained for existing screens. AI calls are made by the
 * openhouse-ai Edge Function; no model key is ever bundled into Vite output.
 */
import { invokeOpenHouseAi, type SpatialAnalysisResponse } from './openhouseApi'
import { isDemoMode } from './runtime'

export interface SpatialValidationResult extends SpatialAnalysisResponse {}

const demoAnalysis = (propertyTitle: string): SpatialValidationResult => {
  const needsTerraceBridge = /laurel|admiralty|homestead/i.test(propertyTitle)
  return {
    passed: !needsTerraceBridge,
    totalSpacesDetected: needsTerraceBridge ? 6 : 7,
    expectedSpaces: 7,
    missingConnections: needsTerraceBridge
      ? [{
          fromRoom: 'Living room',
          toRoom: 'Balcony terrace',
          reason: 'The indoor-to-outdoor threshold has no continuous evidence.',
          recommendedCaptureTimeSeconds: 15,
        }]
      : [],
    confidenceScore: needsTerraceBridge ? 0.78 : 0.96,
  }
}

export async function validatePropertySpatialContinuity(
  propertyTitle: string,
  _spacesList: string[],
): Promise<SpatialValidationResult> {
  if (isDemoMode) return demoAnalysis(propertyTitle)
  throw new Error('Production analysis requires a persisted property and runs through the OpenHouse evidence workflow.')
}

export async function askOpenHouseAssistant(
  question: string,
  propertyContext: { title: string; location: string; rooms: string[] },
): Promise<{ answer: string; badge: string }> {
  if (isDemoMode) {
    return {
      answer: 'This is a demo response. In production, answers are limited to verified listing facts and captured evidence.',
      badge: 'Demo mode — not verified',
    }
  }
  return invokeOpenHouseAi<{ answer: string; badge: string }>('answer', { question, propertyContext })
}
