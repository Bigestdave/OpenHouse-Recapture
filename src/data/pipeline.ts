// Shared production pipeline metadata.
export const STAGE_ORDER = [
  'QUEUED', 'CREATED', 'NORMALIZING_INPUT', 'PLANNING', 'PLAN_VALIDATION', 'REFERENCE_RESOLUTION',
  'KEYFRAME_GENERATION', 'KEYFRAME_QC', 'VIDEO_GENERATION', 'VIDEO_QC', 'AUDIO_GENERATION',
  'ASSEMBLY', 'FINAL_QC', 'READY_FOR_REVIEW',
]

export function stageProgress(stage?: string | null): number {
  const idx = STAGE_ORDER.indexOf((stage || '').toUpperCase())
  if (idx < 0) return 0
  return Math.round((idx / (STAGE_ORDER.length - 1)) * 100)
}

export function stageScreen(stage?: string | null): string {
  const s = (stage || '').toUpperCase()
  if (s.startsWith('REFERENCE')) return '/references'
  if (s.startsWith('KEYFRAME') || s.startsWith('STORYBOARD')) return '/keyframes'
  if (s.startsWith('VIDEO') || s === 'ANIMATION') return '/animation'
  if (s.startsWith('AUDIO')) return '/audio'
  if (s === 'ASSEMBLY') return '/assembly'
  if (s === 'FINAL_QC' || s === 'READY_FOR_REVIEW') return '/final-review'
  return '/plan'
}

export function prettyStage(stage?: string | null): string {
  if (!stage) return 'Starting'
  return stage.charAt(0) + stage.slice(1).toLowerCase().replace(/_/g, ' ')
}

/** Sidebar step names, in pipeline order (mirrors data/shots.ts sidebarSteps). */
export const SIDEBAR_STEPS = [
  'Brief', 'Plan', 'References', 'Keyframes',
  'Animation', 'Audio', 'Assembly', 'Final review',
] as const

/** Map a backend current_stage to the sidebar step it belongs to. */
export function stageStep(stage?: string | null): (typeof SIDEBAR_STEPS)[number] {
  const s = (stage || '').toUpperCase()
  if (s.startsWith('REFERENCE')) return 'References'
  if (s.startsWith('KEYFRAME') || s.startsWith('STORYBOARD')) return 'Keyframes'
  if (s.startsWith('VIDEO') || s === 'ANIMATION') return 'Animation'
  if (s.startsWith('AUDIO')) return 'Audio'
  if (s === 'ASSEMBLY') return 'Assembly'
  if (s === 'FINAL_QC' || s === 'READY_FOR_REVIEW') return 'Final review'
  if (s.startsWith('PLAN') || s === 'SHOT_PLANNING' || s === 'NORMALIZING_INPUT') return 'Plan'
  return 'Brief'
}
