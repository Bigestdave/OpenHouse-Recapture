import { useState, type ReactNode } from 'react'

interface RightPanelProps {
  tabs?: string[]
  defaultTab?: string
  /** Render content for the given tab. Unhandled tabs get a muted placeholder. */
  render: (tab: string) => ReactNode
}

export function RightPanel({ tabs = ['Details', 'Quality', 'History'], defaultTab, render }: RightPanelProps) {
  const [tab, setTab] = useState(defaultTab ?? tabs[0])
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-8 border-b border-line px-6 pb-3 pt-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[15.5px] leading-6 transition-colors ${
              tab === t ? 'font-semibold text-ink border-b-2 border-accent pb-1 -mb-[13px]' : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {render(tab) ?? <p className="pt-4 text-[14px] text-ink-3">No {tab.toLowerCase()} available yet.</p>}
      </div>
    </div>
  )
}

/** Key/value row used in Details panels */
export function KV({ label, value, valueClass = '' }: { label: string; value: ReactNode; valueClass?: string }) {
  return (
    <div className="flex gap-4 py-2.5 border-b border-line/60 last:border-b-0">
      <span className="w-[130px] shrink-0 text-[14px] font-medium text-ink-2">{label}</span>
      <span className={`text-[14px] text-ink leading-relaxed ${valueClass}`}>{value}</span>
    </div>
  )
}

/** Score row with label, number and progress bar — matches Figma layout */
export function ScoreBar({ label, score, tone = 'accent' }: { label: string; score: number; tone?: 'accent' | 'warn' | 'danger' }) {
  const barColor = tone === 'accent' ? 'bg-accent' : tone === 'warn' ? 'bg-warn' : 'bg-danger'
  const numColor = tone === 'accent' ? 'text-accent font-semibold' : tone === 'warn' ? 'text-warn font-semibold' : 'text-danger font-semibold'
  return (
    <div className="flex items-center gap-0 py-2.5">
      <span className="w-[190px] shrink-0 text-[14px] font-medium text-ink-2">{label}</span>
      <span className={`w-9 shrink-0 text-[15px] leading-6 ${numColor}`}>{score}</span>
      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-raised">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

