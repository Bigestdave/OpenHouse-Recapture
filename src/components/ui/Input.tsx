import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leadingIcon, trailingIcon, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3.5 text-ink-3 pointer-events-none flex items-center">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-xl border bg-surface py-2.5 text-sm text-ink placeholder:text-ink-3 outline-none transition-all duration-150 shadow-subtle disabled:opacity-50 disabled:bg-raised-2 ${
              leadingIcon ? 'pl-10' : 'px-4'
            } ${trailingIcon ? 'pr-10' : 'px-4'} ${
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/15'
                : 'border-border hover:border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/15'
            } ${className}`}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3.5 text-ink-3 flex items-center">
              {trailingIcon}
            </span>
          )}
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

Input.displayName = 'Input'
