const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()

/** API base URL is configurable per environment; the local FastAPI server is the safe fallback. */
export const API_BASE_URL = (configuredApiUrl || 'http://localhost:8000/api').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export interface ShowEpisodeSummary {
  id: string
  episode_number: number
  title: string
  status: string
  latest_production_id?: string | null
}

export interface Show {
  id: string
  title: string
  premise?: string | null
  status: string
  default_duration_seconds: number
  default_aspect_ratio: string
  default_style_profile_id?: string | null
  current_continuity_version: number
  episode_count?: number
  episodes?: ShowEpisodeSummary[]
  latest_episode?: ShowEpisodeSummary | null
}

export interface EpisodeDraft {
  title: string
  idea?: string
  /** qwen-max may return the script as formatted text or a structured object */
  script?: string | Record<string, unknown>
}

export interface Episode {
  id: string
  show_id: string
  title: string
  status: string
  target_duration_seconds: number
  aspect_ratio: string
  base_continuity_version: number
}

export interface ProductionRun {
  id: string
  episode_id: string
  version: number
  status: string
  current_stage: string
  budget_limit: number
  budget_used: number
  retry_reserve: number
  started_at?: string | null
  completed_at?: string | null
  failure_reason?: string | null
  final_video_artifact_id?: string | null
  final_video_status?: string | null
  show_id?: string | null
  show_title?: string | null
  episode_number?: number | null
  episode_title?: string | null
  target_duration_seconds?: number | null
}

export type ProductionDetail = ProductionRun

export interface ProductionListItem {
  id: string
  episode_id: string
  version: number
  status: string
  current_stage: string
  budget_limit: number
  budget_used: number
  started_at?: string | null
  completed_at?: string | null
  failure_reason?: string | null
  episode_number?: number | null
  episode_title?: string | null
  show_id?: string | null
  show_title?: string | null
}

export interface ProductionStartResponse {
  message: string
  production_id: string
}

export interface ProductionShot {
  id: string
  production_run_id: string
  sequence_number: number
  story_function: string
  duration_seconds: number
  status: string
  characters: Array<string | { id?: string; name?: string }>
  location_id?: string | null
  camera: { framing?: string; movement?: string; angle?: string }
  environment: { props?: string[] }
  keyframe_prompt?: string | null
  motion_prompt?: string | null
  approved_storyboard_artifact_id?: string | null
  approved_keyframe_artifact_id?: string | null
  approved_video_artifact_id?: string | null
}

function errorDetail(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail
    return typeof detail === 'string' ? detail : JSON.stringify(detail)
  }
  return fallback
}

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      // A proxy or server may return an empty non-JSON failure response.
    }
    throw new ApiError(response.status, errorDetail(payload, `Request failed (${response.status})`))
  }

  return response.json() as Promise<T>
}

export function getArtifactDownloadUrl(artifactId?: string | null) {
  return artifactId ? `${API_BASE_URL}/artifacts/${encodeURIComponent(artifactId)}/download` : undefined
}

export const DEFAULT_MOCK_PROPERTIES: Show[] = [
  {
    id: 'prop-01',
    title: '8 Admiralty Way',
    premise: '3-bedroom apartment · Lekki, Lagos',
    status: 'in_production',
    default_duration_seconds: 60,
    default_aspect_ratio: '16:9',
    current_continuity_version: 1,
    episode_count: 1,
    latest_episode: {
      id: 'exp-01',
      episode_number: 1,
      title: 'Interactive Experience',
      status: 'in_production',
      latest_production_id: 'prod-01',
    },
  },
  {
    id: 'prop-02',
    title: 'Orchid Apartments, Unit 4',
    premise: '2-bedroom apartment · Lekki, Lagos',
    status: 'in_production',
    default_duration_seconds: 45,
    default_aspect_ratio: '16:9',
    current_continuity_version: 1,
    episode_count: 1,
    latest_episode: {
      id: 'exp-02',
      episode_number: 1,
      title: 'Building experience',
      status: 'in_production',
      latest_production_id: 'prod-02',
    },
  },
  {
    id: 'prop-03',
    title: 'Lekki Gardens, Unit 12',
    premise: '3-bedroom terrace · Lekki, Lagos',
    status: 'needs_review',
    default_duration_seconds: 60,
    default_aspect_ratio: '16:9',
    current_continuity_version: 1,
    episode_count: 1,
    latest_episode: {
      id: 'exp-03',
      episode_number: 1,
      title: 'Running final checks',
      status: 'needs_review',
      latest_production_id: 'prod-03',
    },
  },
  {
    id: 'prop-04',
    title: 'Bourdillon Court',
    premise: '4-bedroom apartment · Ikoyi, Lagos',
    status: 'complete',
    default_duration_seconds: 90,
    default_aspect_ratio: '16:9',
    current_continuity_version: 1,
    episode_count: 1,
    latest_episode: {
      id: 'exp-04',
      episode_number: 1,
      title: 'Published experience',
      status: 'complete',
      latest_production_id: 'prod-04',
    },
  },
]

// Shows / Properties
export const getShows = async () => {
  try {
    const list = await fetchJson<Show[]>('/shows/')
    return list.length ? list : DEFAULT_MOCK_PROPERTIES
  } catch {
    return DEFAULT_MOCK_PROPERTIES
  }
}

export const getShow = async (showId: string) => {
  try {
    return await fetchJson<Show>(`/shows/${encodeURIComponent(showId)}`)
  } catch {
    const found = DEFAULT_MOCK_PROPERTIES.find((p) => p.id === showId || p.title.toLowerCase().includes(showId.toLowerCase()))
    if (found) return found
    return {
      ...DEFAULT_MOCK_PROPERTIES[0],
      id: showId,
      title: showId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  }
}
export const deleteShow = (showId: string) =>
  fetchJson<{ deleted: string }>(`/shows/${encodeURIComponent(showId)}`, { method: 'DELETE' })

export async function generateShowProposal(params: {
  genre: string
  animation_style: string
  tone: string
  target_audience: string
  default_duration_seconds: number
  idea_seed: string
}) {
  const query = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))
  return fetchJson(`/shows/proposal?${query}`, { method: 'POST' })
}

export const generateIdea = (genre: string, tone: string) =>
  fetchJson<{ idea: string; source: string }>(
    `/shows/idea?genre=${encodeURIComponent(genre)}&tone=${encodeURIComponent(tone)}`,
    { method: 'POST' },
  )

export const generateShowPoster = (showId: string) =>
  fetchJson<{ artifact_id: string; download_url: string }>(
    `/shows/${encodeURIComponent(showId)}/poster/generate`,
    { method: 'POST' },
  )

export const getShowPoster = (showId: string) =>
  fetchJson<{ artifact_id: string; download_url: string }>(`/shows/${encodeURIComponent(showId)}/poster`)

export const generateCharacterReference = (characterId: string) =>
  fetchJson<{ reference_id: string; artifact_id: string; download_url: string }>(
    `/characters/${encodeURIComponent(characterId)}/references/generate`,
    { method: 'POST' },
  )

export function createShow(data: {
  title: string
  premise?: string
  visual_style?: { animation_style?: string; creative_direction?: { colors?: string } | string; negative_prompt?: string }
}) {
  const creativeDirection = data.visual_style?.creative_direction
  return fetchJson<Show>('/shows/', {
    method: 'POST',
    body: JSON.stringify({
      title: data.title,
      premise: data.premise,
      animation_style: data.visual_style?.animation_style || '3D',
      creative_direction: typeof creativeDirection === 'string' ? creativeDirection : creativeDirection?.colors || '',
      negative_constraints: data.visual_style?.negative_prompt || '',
    }),
  })
}

// Characters
export interface CharacterSummary {
  id: string
  name: string
  canonical_description?: string | null
}

export interface CharacterReference {
  id: string
  character_id: string
  reference_type: string
  artifact_id: string
  is_canonical: boolean
}

export const listCharacters = (showId: string) =>
  fetchJson<CharacterSummary[]>(`/shows/${encodeURIComponent(showId)}/characters`)

export const listCharacterReferences = (characterId: string) =>
  fetchJson<CharacterReference[]>(`/characters/${encodeURIComponent(characterId)}/references`)

export async function uploadCharacterReference(characterId: string, file: File, referenceType = 'front_view') {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(
    `${API_BASE_URL}/characters/${encodeURIComponent(characterId)}/references?reference_type=${encodeURIComponent(referenceType)}`,
    { method: 'POST', body: form },
  )
  if (!response.ok) throw new ApiError(response.status, `Reference upload failed (${response.status})`)
  return response.json() as Promise<CharacterReference>
}

export function createCharacter(showId: string, data: { name: string; canonical_description?: string }) {
  return fetchJson<{ id: string; name: string; canonical_description?: string }>(`/shows/${encodeURIComponent(showId)}/characters`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Episodes
export async function generateEpisodeDraft(showId: string, ideaSeed: string) {
  const query = new URLSearchParams({ idea_seed: ideaSeed })
  return fetchJson<EpisodeDraft>(`/shows/${encodeURIComponent(showId)}/episodes/draft?${query}`, { method: 'POST' })
}

export function createEpisode(showId: string, data: EpisodeDraft & { duration_seconds?: number }) {
  // qwen-max sometimes returns the script as a structured object — the episodes API stores a string.
  const script =
    typeof data.script === 'string' ? data.script : data.script ? JSON.stringify(data.script, null, 2) : undefined
  return fetchJson<Episode>('/episodes/', {
    method: 'POST',
    body: JSON.stringify({
      show_id: showId,
      title: data.title || 'Untitled',
      idea: data.idea,
      script,
      duration_seconds: data.duration_seconds || 45,
    }),
  })
}

export const DEFAULT_MOCK_PRODUCTIONS: ProductionListItem[] = [
  {
    id: 'prod-01',
    episode_id: 'exp-01',
    version: 1,
    status: 'in_progress',
    current_stage: 'KEYFRAME_QC',
    budget_limit: 100,
    budget_used: 42,
    show_id: 'prop-01',
    show_title: '8 Admiralty Way',
    episode_number: 1,
    episode_title: '3-bedroom apartment · Lekki, Lagos',
    started_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'prod-02',
    episode_id: 'exp-02',
    version: 1,
    status: 'in_progress',
    current_stage: 'VIDEO_GENERATION',
    budget_limit: 100,
    budget_used: 65,
    show_id: 'prop-02',
    show_title: 'Orchid Apartments, Unit 4',
    episode_number: 1,
    episode_title: '2-bedroom apartment · Lekki, Lagos',
    started_at: new Date(Date.now() - 7200000).toISOString(),
  },
]

export const listProductions = async () => {
  try {
    const list = await fetchJson<ProductionListItem[]>('/productions/')
    return list.length ? list : DEFAULT_MOCK_PRODUCTIONS
  } catch {
    return DEFAULT_MOCK_PRODUCTIONS
  }
}

export const getProductionDetail = async (productionId: string) => {
  try {
    return await fetchJson<ProductionDetail>(`/productions/${encodeURIComponent(productionId)}`)
  } catch {
    return {
      ...DEFAULT_MOCK_PRODUCTIONS[0],
      id: productionId,
      retry_reserve: 20,
    }
  }
}
export const pauseProduction = (productionId: string) =>
  fetchJson<{ message: string }>(`/productions/${encodeURIComponent(productionId)}/pause`, { method: 'POST' })
export const resumeProduction = (productionId: string) =>
  fetchJson<{ message: string }>(`/productions/${encodeURIComponent(productionId)}/resume`, { method: 'POST' })
export const startProduction = (episodeId: string) =>
  fetchJson<ProductionStartResponse>(`/productions/${encodeURIComponent(episodeId)}`, { method: 'POST' })

// Events / notifications
export interface WorkflowEventItem {
  id: string
  event_type: string
  severity: string
  payload?: { message?: string } & Record<string, unknown>
  production_run_id?: string | null
  created_at?: string | null
}

export const getRecentEvents = () => fetchJson<WorkflowEventItem[]>('/events/recent')
export const getProduction = (productionId: string) =>
  fetchJson<ProductionRun>(`/productions/${encodeURIComponent(productionId)}`)
export const getProductionShots = (productionId: string) =>
  fetchJson<ProductionShot[]>(`/productions/${encodeURIComponent(productionId)}/shots`)
export const getShotAttempts = (shotId: string) =>
  fetchJson(`/shots/${encodeURIComponent(shotId)}/attempts`)
export const retryShot = (shotId: string) =>
  fetchJson(`/shots/${encodeURIComponent(shotId)}/retry`, { method: 'POST' })
export const approveAttempt = (shotId: string, attemptId: string) =>
  fetchJson(`/shots/${encodeURIComponent(shotId)}/approve-attempt?attempt_id=${encodeURIComponent(attemptId)}`, { method: 'POST' })
export const approveProduction = (productionId: string) =>
  fetchJson<{ message: string; status: string }>(`/productions/${encodeURIComponent(productionId)}/approve`, { method: 'POST' })
