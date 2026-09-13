export interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleSwitchProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-start gap-3.5 select-none cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-line-strong'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <span className="block text-xs font-bold text-ink group-hover:text-primary transition-colors">
              {label}
            </span>
          )}
          {description && <p className="text-xs text-ink-2 leading-relaxed">{description}</p>}
        </div>
      )}
    </div>
  )
}
