import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProductionEvents } from './useProductionEvents'
import { stageScreen } from '../data/pipeline'

/**
 * Auto-follows the backend production as it advances stage-to-stage.
 *
 * The pipeline is server-driven: it emits a `stage_changed` SSE event each time
 * `current_stage` moves. When the user is watching the screen for the stage that
 * just finished, we navigate them forward to the new stage's screen (preserving
 * ?productionId). If they have manually navigated back to review an earlier stage,
 * we do NOT yank them forward — the TopBar "Continue" button lets them rejoin the
 * live stage whenever they choose.
 */
export function useStageAutoFollow(productionId: string | null) {
  const navigate = useNavigate()
  const location = useLocation()
  const { lastEvent } = useProductionEvents(productionId)
  // Avoid acting twice on the same event across re-renders.
  const handledRef = useRef<string | null>(null)

  useEffect(() => {
    if (!productionId || !lastEvent) return
    if (lastEvent.event_type !== 'stage_changed') return
    if (handledRef.current === lastEvent.id) return
    handledRef.current = lastEvent.id

    const newStage = lastEvent.payload?.new_stage as string | undefined
    const prevStage = lastEvent.payload?.previous_stage as string | undefined
    if (!newStage) return

    const targetScreen = stageScreen(newStage)
    const prevScreen = stageScreen(prevStage)

    // Only follow if the user is currently on the screen for the stage that just
    // completed (i.e. they were watching the live stage). Skip no-op hops where
    // several stages share one screen (e.g. STORYBOARD_GENERATION -> STORYBOARD_QC).
    if (location.pathname === prevScreen && targetScreen !== location.pathname) {
      navigate(`${targetScreen}?productionId=${encodeURIComponent(productionId)}`)
    }
  }, [lastEvent, productionId, location.pathname, navigate])
}
