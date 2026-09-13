import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pause } from './icons'
import { getProductionDetail, pauseProduction, resumeProduction, type ProductionDetail } from '../data/api'
import { prettyStage, stageScreen, stageStep } from '../data/pipeline'
import type { StepName } from '../data/shots'
import logoImg from '../assets/logo.png'

interface TopBarProps {
  status?: string
  showElapsed?: boolean
  showPause?: boolean
  /** Live production, supplied by AppShell. If omitted, TopBar self-fetches. */
  production?: ProductionDetail | null
  /** The sidebar step of the screen currently shown, to hide Continue when already live. */
  activeStep?: StepName
}

function elapsedSince(iso?: string | null): string {
  if (!iso) return '—'
  const then = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z')).getTime()
  if (Number.isNaN(then)) return '—'
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')} elapsed`
}

export function TopBar({ showElapsed = true, showPause = true, production: productionProp, activeStep }: TopBarProps) {
  const [searchParams] = useSearchParams()
  const productionId = searchParams.get('productionId')
  const [selfProduction, setSelfProduction] = useState<ProductionDetail | null>(null)
  const production = productionProp ?? selfProduction
  const [tick, setTick] = useState(0)
  const [pausing, setPausing] = useState(false)

  // Only self-fetch when AppShell didn't supply the production (backward compat).
  useEffect(() => {
    if (productionProp !== undefined) return
    if (!productionId) return
    const load = () => getProductionDetail(productionId).then(setSelfProduction).catch(console.error)
    load()
    const poll = setInterval(load, 10000)
    return () => clearInterval(poll)
  }, [productionId, productionProp])

  // Re-render elapsed time every second while producing
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000)
    return () => clearInterval(t)
  }, [])
  void tick

  const isPaused = (production?.status || '').toLowerCase() === 'paused'
  const isDone = ['complete', 'failed', 'ready_for_review'].includes((production?.status || '').toLowerCase())

  // Continue jumps to the live stage's screen; hidden when already viewing it.
  const liveStep = stageStep(production?.current_stage)
  const showContinue = Boolean(productionId) && !isDone && activeStep !== undefined && activeStep !== liveStep
  const continueTo = production?.current_stage
    ? `${stageScreen(production.current_stage)}?productionId=${encodeURIComponent(productionId!)}`
    : '#'

  const handlePauseResume = async () => {
    if (!productionId) return
    setPausing(true)
    try {
      if (isPaused) await resumeProduction(productionId)
      else await pauseProduction(productionId)
      setSelfProduction(await getProductionDetail(productionId))
    } catch (e) {
      console.error(e)
    } finally {
      setPausing(false)
    }
  }

  return (
    <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-line bg-surface px-6 shadow-subtle">
      {/* Brand logo container */}
      <div className="flex items-center gap-2">
        <Link to="/shows" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-ink">
          <img src={logoImg} alt="OpenHouse" className="h-6 w-6 object-contain" />
          <span>OpenHouse</span>
        </Link>
        <span className="mx-4 h-4 w-px bg-line" />
        <Link
          to={production?.show_id ? `/show/${production.show_id}` : '/productions'}
          className="text-ink-3 transition-colors hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </Link>
        <nav className="flex items-center gap-2.5 text-[14.5px] pl-2">
          <span className="font-medium text-ink">{production?.show_title || '8 Admiralty Way'}</span>
          <span className="text-ink-4">/</span>
          <span className="font-normal text-ink-2">
            {production?.episode_title || 'Interactive Experience'}
          </span>
        </nav>
      </div>

      {/* Center status area */}
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-warn' : 'bg-accent'}`} />
        <span className="text-[14.5px] font-medium text-ink">
          {isPaused ? 'Paused' : prettyStage(production?.current_stage) || 'Preparing'}
        </span>
      </div>

      {/* Right control panel */}
      <div className="flex items-center gap-6">
        <span className="text-[14.5px]">
          <span className="text-ink-3">Credits </span>
          <span className="font-medium text-accent">
            {production ? `${production.budget_used}/${production.budget_limit}` : '100'}
          </span>
        </span>

        {showElapsed && (
          <span className="text-[14px] font-normal text-ink-3">
            {production?.completed_at ? 'Finished' : elapsedSince(production?.started_at)}
          </span>
        )}

        {showContinue && (
          <Link
            to={continueTo}
            className="flex h-[36.5px] items-center gap-2 rounded-md bg-accent px-[17px] text-[14.5px] font-medium text-white transition-colors hover:bg-accent-strong shadow-subtle"
          >
            Continue ↗
          </Link>
        )}

        {showPause && !isDone && (
          <button
            onClick={handlePauseResume}
            disabled={pausing || !productionId}
            className="flex h-[36.5px] items-center gap-2 rounded-md border border-line bg-surface px-[17px] text-[14px] font-medium text-ink transition-colors hover:bg-raised disabled:opacity-50 shadow-subtle"
          >
            <Pause size={12} />
            {pausing ? '…' : isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
    </header>
  )
}
