import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', checked, disabled, id, onChange, ...props }, ref) => {
    const radioId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <label
        htmlFor={radioId}
        className={`flex items-start gap-3 select-none cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`h-4.5 w-4.5 rounded-full border transition-all duration-150 flex items-center justify-center ${
              checked
                ? 'border-primary bg-surface shadow-xs'
                : 'border-border bg-surface hover:border-line-strong peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20'
            }`}
          >
            {checked && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-xs font-bold text-ink group-hover:text-primary transition-colors">
                {label}
              </span>
            )}
            {description && <p className="text-[11.5px] text-ink-2 leading-relaxed">{description}</p>}
          </div>
        )}
      </label>
    )
  }
)

Radio.displayName = 'Radio'
