import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon } from './icons'
import { Stepper, Input, Textarea, Select } from './ui'

const steps = ['Property', 'Capture', 'Publish'] as const

interface WizardShellProps {
  step: 1 | 2 | 3
  children: ReactNode
  /** footer actions, right-aligned; left slot for Back */
  footerLeft?: ReactNode
  footerRight: ReactNode
}

import logoIconUrl from '../assets/logo-icon.png'

export function WizardShell({ step, children, footerLeft, footerRight }: WizardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <header className="flex h-[68px] shrink-0 items-center justify-between px-8 border-b border-border bg-surface">
        <div className="flex items-center gap-6">
          <Link to="/shows" className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-tight text-ink">
            <img src={logoIconUrl} alt="OpenHouse" className="h-7 w-7 rounded-lg object-contain" />
            <span>OpenHouse</span>
          </Link>
          <span className="h-5 w-px bg-border" />
          <Link to="/shows" className="flex items-center gap-2.5 text-[14.5px] font-semibold text-ink-2 transition-colors hover:text-ink">
            <CloseIcon size={16} />
            <span>Cancel & Back</span>
          </Link>
        </div>
        <span className="text-xs font-bold text-ink-2 uppercase tracking-wider">Step {step} of 3</span>
      </header>

      {/* Stepper */}
      <div className="flex justify-center pt-8 pb-4">
        <Stepper steps={steps} currentStep={step} />
      </div>

      <main className="flex-1 pb-28">{children}</main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur-md shadow-overlay z-40">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      </footer>
    </div>
  )
}

export function WizardTitle({ title, subtitle, info }: { title: string; subtitle: string; info?: boolean }) {
  return (
    <div className="pt-8 pb-8 text-center">
      <h1 className="inline-flex items-center gap-3 text-[32px] sm:text-[36px] font-bold tracking-tight text-ink leading-tight">
        {title}
        {info && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[13px] font-normal text-ink-2 shadow-subtle">
            i
          </span>
        )}
      </h1>
      <p className="pt-2 text-[15px] text-ink-2 max-w-[600px] mx-auto leading-relaxed">{subtitle}</p>
    </div>
  )
}

/** Labeled input / textarea / select shells for wizard + property forms */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pb-5">
      <p className="pb-1.5 text-xs font-semibold text-ink">{label}</p>
      {children}
    </div>
  )
}

export function TextInput({ value, placeholder, onChange }: { value?: string; placeholder?: string; onChange?: (val: string) => void }) {
  return (
    <Input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export function TextArea({ value, placeholder, rows = 5, onChange }: { value?: string; placeholder?: string; rows?: number; onChange?: (val: string) => void }) {
  return (
    <Textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  )
}

export function SelectInput({ value, icon, options, onChange }: { value: string; icon?: ReactNode; options?: string[]; onChange?: (val: string) => void }) {
  if (options) {
    return (
      <Select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        options={options}
        leadingIcon={icon}
      />
    )
  }
  
  return (
    <button className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:border-line-strong shadow-subtle">
      <span className="flex items-center gap-3">{icon}{value}</span>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-ink-3">
        <path d="M4.5 7.5L10 13l5.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

