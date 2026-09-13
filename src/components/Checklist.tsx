import { Spinner } from './icons'

export type CheckState = 'done' | 'active' | 'todo'

export function CheckDot({ state }: { state: CheckState }) {
  if (state === 'done') return <span className="h-2.5 w-2.5 rounded-full bg-accent" />
  if (state === 'active') return <Spinner size={14} />
  return <span className="h-2.5 w-2.5 rounded-full border border-ink-3" />
}

export interface CheckItem {
  label: string
  state: CheckState
}

/** Vertical checklist with connecting rail (Assembly / Audio progress) */
export function Checklist({ items, className = '' }: { items: CheckItem[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-3.5 ${className}`}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-3">
          <span className="flex w-4 justify-center"><CheckDot state={it.state} /></span>
          <span className={`text-[14.5px] ${it.state === 'todo' ? 'text-ink-3' : it.state === 'active' ? 'font-medium text-ink' : 'text-ink-2'}`}>
            {it.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
