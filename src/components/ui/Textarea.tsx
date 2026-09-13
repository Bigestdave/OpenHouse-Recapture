import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', id, rows = 4, disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={`w-full resize-y rounded-xl border bg-surface p-4 text-sm text-ink placeholder:text-ink-3 outline-none transition-all duration-150 shadow-subtle disabled:opacity-50 disabled:bg-raised-2 leading-relaxed ${
            error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/15'
              : 'border-border hover:border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/15'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-2">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
