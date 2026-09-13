/**
 * DemoControlBar.tsx
 * Hidden floating bar (bottom-right) that lets the presenter manually advance
 * the demo through stages during a live recording.
 *
 * Keyboard shortcuts:
 *   `         = toggle the control panel
 *   ]         = advance one stage SILENTLY (no panel opens, nothing visible on screen)
 *   Shift+`   = hide/show the chip entirely (use before recording)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoContext, type DemoStage } from '../context/DemoContext'

const STAGE_LABELS: Record<DemoStage, string> = {
  0: 'Idle',
  1: 'Listing imported',
  2: 'Build in progress',
  3: 'Capture issue detected',
  4: 'Recapture received',
  5: 'Ready for approval',
  6: 'Approved & live',
}

const STAGE_ROUTES: Record<DemoStage, string> = {
  0: '/portal',
  1: '/portal',
  2: '/property/homestead-pd',
  3: '/capture-requests/homestead-pool',
  4: '/property/homestead-pd',
  5: '/approvals',
  6: '/public/homestead-pd',
}

export function DemoControlBar() {
  const [open, setOpen] = useState(false)
  const [chipHidden, setChipHidden] = useState(false)
  const { stage, advance, setStage, resetDemo } = useDemoContext()
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't intercept typing in input fields
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      // ` = toggle panel
      if (e.key === '`' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen((p) => !p)
      }
      // Shift+` = hide chip entirely (clean screen for recording)
      if (e.shiftKey && (e.key === '~' || e.key === '`')) {
        e.preventDefault()
        setChipHidden((p) => !p)
        setOpen(false)
      }
      // ] = advance stage silently
      if (e.key === ']' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        advance()
        const nextStage = (Math.min(stage + 1, 6) as DemoStage)
        const route = STAGE_ROUTES[nextStage]
        if (route) setTimeout(() => navigate(route), 250)
      }
      // [ = step back one stage silently
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        const prevStage = (Math.max(stage - 1, 0) as DemoStage)
        setStage(prevStage)
        const route = STAGE_ROUTES[prevStage]
        if (route) setTimeout(() => navigate(route), 250)
      }
      // r = reset to step 1 on /portal
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey && open) {
        e.preventDefault()
        resetDemo()
        navigate('/portal')
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, navigate, resetDemo, setStage, stage, open])

  function handleAdvance() {
    advance()
    const nextStage = ((stage < 6 ? stage + 1 : 6) as DemoStage)
    const route = STAGE_ROUTES[nextStage]
    if (route) setTimeout(() => navigate(route), 250)
  }

  function handleStepBack() {
    const prevStage = (Math.max(stage - 1, 0) as DemoStage)
    setStage(prevStage)
    const route = STAGE_ROUTES[prevStage]
    if (route) setTimeout(() => navigate(route), 250)
  }

  function handleReset() {
    resetDemo()
    navigate('/portal')
    setOpen(false)
  }

  // Fully invisible when chip is hidden and panel is closed
  if (chipHidden && !open) return null

  return (
    <>
      {/* Tiny toggle chip */}
      {!chipHidden && (
        <button
          onClick={() => setOpen((p) => !p)}
          className="fixed bottom-4 right-4 z-[9998] h-7 w-7 rounded-full bg-[#194534] shadow-lg flex items-center justify-center opacity-30 hover:opacity-80 transition-opacity"
          title="` toggle · ] next · [ back · Shift+` hide"
          aria-label="Demo controller"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5"/>
            <path d="M7 4v3.5L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Control panel */}
      {open && (
        <div className="fixed bottom-14 right-4 z-[9997] w-[310px] rounded-2xl bg-[#0B1713] border border-[#293A32] shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#293A32]">
            <p className="text-[11px] font-bold tracking-widest text-[#5A7A65] uppercase">Demo Controller</p>
            <p className="text-[13px] font-semibold text-white mt-0.5">
              Stage {stage}: {STAGE_LABELS[stage]}
            </p>
            <p className="text-[10px] text-[#5A7A65] mt-1.5 flex items-center justify-between">
              <span><kbd className="bg-[#162B1E] px-1 rounded text-white">[</kbd> Back</span>
              <span><kbd className="bg-[#162B1E] px-1 rounded text-white">]</kbd> Next</span>
              <span><kbd className="bg-[#162B1E] px-1 rounded text-white">Shift+`</kbd> Clean screen</span>
            </p>
          </div>

          <div className="p-3 flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
            {([0,1,2,3,4,5,6] as DemoStage[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStage(s)
                  const route = STAGE_ROUTES[s]
                  if (route) setTimeout(() => navigate(route), 250)
                }}
                className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-1.5 text-left text-[12.5px] transition-colors ${
                  stage === s
                    ? 'bg-[#194534] text-white font-semibold'
                    : 'text-[#8AAB96] hover:bg-[#162B1E] hover:text-white font-medium'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stage === s ? 'bg-[#4ADE80]' : 'bg-[#293A32]'}`} />
                <span className="font-mono text-[11px] opacity-70">Step {s}:</span>
                <span className="truncate">{STAGE_LABELS[s]}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-[#293A32] p-3 flex gap-2">
            <button
              onClick={handleStepBack}
              disabled={stage <= 0}
              className="rounded-lg border border-[#293A32] text-[#8AAB96] hover:bg-[#162B1E] disabled:opacity-30 text-[12px] font-semibold px-3 py-2 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleAdvance}
              disabled={stage >= 6}
              className="flex-1 rounded-lg bg-[#194534] hover:bg-[#236148] disabled:opacity-30 text-white text-[12.5px] font-bold py-2 transition-colors"
            >
              Next step →
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 text-[12px] font-semibold px-3 py-2 transition-colors"
            >
              Reset to Start
            </button>
          </div>

          <p className="text-center text-[10px] text-[#3D5A46] pb-2">` toggle · ] next · [ back · Shift+` hide</p>
        </div>
      )}
    </>
  )
}
