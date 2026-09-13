import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import type { StepName } from '../data/shots'
import { getProductionDetail, type ProductionDetail } from '../data/api'
import { useStageAutoFollow } from '../hooks/useStageAutoFollow'
import { useProductionEvents } from '../hooks/useProductionEvents'

interface AppShellProps {
  active: StepName
  sidebarOverrides?: Parameters<typeof Sidebar>[0]['overrides']
  sidebarBadges?: Parameters<typeof Sidebar>[0]['badges']
  topBarStatus?: string
  showElapsed?: boolean
  showPause?: boolean
  /** Main content (left/center column) */
  children: ReactNode
  /** Right panel content */
  panel?: ReactNode
  /** Bottom shot strip */
  strip?: ReactNode
}

export function AppShell({ active, sidebarOverrides, sidebarBadges, topBarStatus, showElapsed, showPause, children, panel, strip }: AppShellProps) {
  const [searchParams] = useSearchParams()
  const productionId = searchParams.get('productionId')
  const [production, setProduction] = useState<ProductionDetail | null>(null)

  // Auto-advance the UI as the backend moves stage-to-stage.
  useStageAutoFollow(productionId)
  // Re-fetch production detail whenever a new pipeline event arrives so the
  // Sidebar checkmarks and TopBar Continue target track the live stage.
  const { lastEvent } = useProductionEvents(productionId)

  useEffect(() => {
    if (!productionId) {
      setProduction(null)
      return
    }
    let cancelled = false
    const load = () =>
      getProductionDetail(productionId)
        .then((p) => { if (!cancelled) setProduction(p) })
        .catch(console.error)
    load()
    // Slow safety poll in case SSE drops; SSE (lastEvent) drives the fast path.
    const poll = setInterval(load, 15000)
    return () => { cancelled = true; clearInterval(poll) }
  }, [productionId, lastEvent])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app">
      <TopBar status={topBarStatus} showElapsed={showElapsed} showPause={showPause} production={production} activeStep={active} />
      <div className="flex min-h-0 flex-1">
        <Sidebar active={active} liveStage={production?.current_stage} overrides={sidebarOverrides} badges={sidebarBadges} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4 pb-0">
            <main className="min-w-0 flex-1 overflow-y-auto rounded-xl bg-surface border border-line shadow-subtle">
              {children}
            </main>
            {panel && (
              <section className="w-[380px] shrink-0 overflow-y-auto rounded-xl bg-surface border border-line shadow-subtle">
                {panel}
              </section>
            )}
          </div>
          {strip && <div className="shrink-0 p-4">{strip}</div>}
        </div>
      </div>
    </div>
  )
}
