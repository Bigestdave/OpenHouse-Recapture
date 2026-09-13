export interface StepItem {
  number: number
  label: string
}

export interface StepperProps {
  steps: readonly string[] | StepItem[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export function Stepper({ steps, currentStep, onStepClick, className = '' }: StepperProps) {
  const stepList = steps.map((s, i) => (typeof s === 'string' ? { number: i + 1, label: s } : s))

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center">
        {stepList.map((s, i) => {
          const isCompleted = currentStep > s.number
          const isCurrent = currentStep === s.number

          return (
            <div key={s.label} className="flex items-center">
              {/* Step Node */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!onStepClick}
                  onClick={() => onStepClick?.(s.number)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 select-none ${
                    onStepClick ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isCompleted || isCurrent
                      ? 'bg-primary text-text-inverse shadow-subtle'
                      : 'border border-border bg-surface text-ink-3 shadow-subtle'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3.2 7.3l2.6 2.6 5-5.4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    s.number
                  )}
                </button>
                <span
                  className={`text-xs mt-1.5 transition-colors whitespace-nowrap ${
                    isCurrent ? 'font-bold text-ink' : isCompleted ? 'font-semibold text-ink-2' : 'font-medium text-ink-3'
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connecting Line */}
              {i < stepList.length - 1 && (
                <div
                  className={`h-px w-16 sm:w-24 mb-5 mx-2 transition-colors ${
                    currentStep > s.number ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
