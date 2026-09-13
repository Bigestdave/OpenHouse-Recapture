import type { ReactNode } from 'react'

export type BadgeVariant = 'success' | 'accent' | 'neutral' | 'dark' | 'danger' | 'info'

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  icon?: ReactNode
  className?: string
}

export function Badge({ children, variant = 'neutral', icon, className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-primary/10 text-primary border border-primary/20',
    accent: 'bg-accent-soft text-accent border border-accent-border',
    neutral: 'bg-raised-2 text-ink-2 border border-border',
    dark: 'bg-sidebar text-text-inverse border border-sidebar',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-info/10 text-info border border-info/20',
  }[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase select-none ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
