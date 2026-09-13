import type { ReactNode } from 'react'

export interface SelectableCardProps {
  selected: boolean
  onClick: () => void
  icon?: ReactNode
  title: string
  badge?: ReactNode
  description?: string
  checklist?: string[]
  footerAction?: ReactNode
  className?: string
}

export function SelectableCard({
  selected,
  onClick,
  icon,
  title,
  badge,
  description,
  checklist,
  footerAction,
  className = '',
}: SelectableCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 relative flex flex-col justify-between cursor-pointer transition-all duration-150 select-none ${
        selected
          ? 'border-2 border-primary bg-primary/5 shadow-subtle'
          : 'border border-border bg-surface hover:border-line-strong hover:bg-raised-2 shadow-subtle'
      } ${className}`}
    >
      {selected && (
        <span className="h-5 w-5 rounded-full bg-primary text-text-inverse flex items-center justify-center text-[10px] font-bold absolute top-3.5 right-3.5 shadow-xs">
          ✓
        </span>
      )}

      <div>
        {icon && (
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center mb-3 transition-colors ${
              selected ? 'bg-primary/10 text-primary' : 'bg-surface-elevated text-ink-2 border border-border'
            }`}
          >
            {icon}
          </div>
        )}

        <h3 className="text-[15px] font-bold text-ink">{title}</h3>

        {badge && <div className="mt-1.5 mb-2">{badge}</div>}

        {description && <p className="text-xs text-ink-2 leading-relaxed mt-1">{description}</p>}

        {checklist && checklist.length > 0 && (
          <div className="space-y-1.5 text-xs text-ink font-medium pt-3.5">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {footerAction && <div className="pt-4 mt-auto">{footerAction}</div>}
    </div>
  )
}
