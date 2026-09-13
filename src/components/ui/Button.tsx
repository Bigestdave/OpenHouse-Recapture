import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles: typography, transitions, focus, active scale
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

    // Size variants
    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-xl gap-2 shadow-subtle',
      lg: 'px-7 py-3.5 text-[15px] font-bold rounded-xl gap-2.5 shadow-subtle',
    }[size]

    // Color variants based on OpenHouse design tokens
    const variantStyles = {
      primary:
        'bg-primary text-text-inverse hover:bg-primary-hover focus-visible:ring-primary/40 border border-transparent shadow-subtle',
      secondary:
        'bg-surface border border-border text-text-primary hover:bg-raised-2 hover:border-line-strong focus-visible:ring-primary/20 shadow-subtle',
      dark:
        'bg-sidebar text-text-inverse hover:bg-black focus-visible:ring-sidebar/40 border border-transparent shadow-subtle',
      outline:
        'bg-transparent border border-border text-text-primary hover:bg-surface hover:border-line-strong focus-visible:ring-primary/20',
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-raised-2 focus-visible:ring-primary/20',
      danger:
        'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/40 border border-transparent shadow-subtle',
    }[variant]

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leadingIcon && <span className="shrink-0">{leadingIcon}</span>
        )}
        <span>{children}</span>
        {!loading && trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
