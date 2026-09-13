import type { ReactNode } from 'react'

export interface CalloutProps {
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function Callout({ children, icon, className = '' }: CalloutProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-raised-2/70 p-3.5 flex items-center gap-3 text-xs text-ink-2 font-medium shadow-subtle ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className="h-5 w-5 rounded-full bg-border text-ink-2 flex items-center justify-center font-serif italic text-xs shrink-0">
          i
        </span>
      )}
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  )
}
