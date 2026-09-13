import { forwardRef } from 'react'
import type { SelectHTMLAttributes, ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  helperText?: string
  error?: string
  options: (string | SelectOption)[]
  leadingIcon?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, leadingIcon, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3.5 text-ink-3 pointer-events-none flex items-center">
              {leadingIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full appearance-none rounded-xl border bg-surface py-2.5 pr-10 text-sm text-ink outline-none transition-all duration-150 shadow-subtle disabled:opacity-50 disabled:bg-raised-2 cursor-pointer ${
              leadingIcon ? 'pl-10' : 'px-4'
            } ${
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/15'
                : 'border-border hover:border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/15'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value
              const text = typeof opt === 'string' ? opt : opt.label
              return (
                <option key={val} value={val} className="bg-surface text-ink py-1">
                  {text}
                </option>
              )
            })}
          </select>
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute right-3.5 text-ink-3"
          >
            <path
              d="M4.5 7.5L10 13l5.5-5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-2">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'
