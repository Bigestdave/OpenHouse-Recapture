import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', checked, disabled, id, onChange, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 select-none cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`h-4.5 w-4.5 rounded-md border transition-all duration-150 flex items-center justify-center ${
              checked
                ? 'bg-primary border-primary text-text-inverse shadow-xs'
                : 'bg-surface border-border hover:border-line-strong peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20'
            }`}
          >
            {checked && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L4.8 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-xs font-semibold text-ink group-hover:text-primary transition-colors">
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

Checkbox.displayName = 'Checkbox'
