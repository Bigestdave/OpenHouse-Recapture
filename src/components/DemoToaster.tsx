/**
 * DemoToaster.tsx
 * Renders toast notifications in the top-right corner.
 * Reads from DemoContext. Each toast can have an action button that navigates.
 */
import { useNavigate } from 'react-router-dom'
import { useDemoContext, type Toast, type ToastKind } from '../context/DemoContext'

function kindStyles(kind: ToastKind) {
  switch (kind) {
    case 'warning': return { bar: 'bg-amber-400', icon: '!', iconBg: 'bg-amber-50 text-amber-700' }
    case 'success': return { bar: 'bg-[#194534]', icon: String.fromCharCode(10003), iconBg: 'bg-[#EBF4EF] text-[#194534]' }
    case 'error':   return { bar: 'bg-red-500', icon: String.fromCharCode(215), iconBg: 'bg-red-50 text-red-700' }
    default:        return { bar: 'bg-[#194534]', icon: 'i', iconBg: 'bg-[#EBF4EF] text-[#194534]' }
  }
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useDemoContext()
  const navigate = useNavigate()
  const s = kindStyles(toast.kind)

  return (
    <div
      className="relative flex w-[380px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-stone-200 animate-slideInRight"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Left colour bar */}
      <div className={`w-1 shrink-0 ${s.bar}`} />

      {/* Icon */}
      <div className={`flex items-start pt-4 pl-3`}>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${s.iconBg}`}>
          {s.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-3.5">
        <p className="text-[14px] font-semibold text-[#0E1C15] leading-snug">{toast.title}</p>
        {toast.body && (
          <p className="text-[12.5px] text-[#5A6B62] mt-0.5 leading-relaxed">{toast.body}</p>
        )}
        {toast.action && (
          <button
            onClick={() => { dismissToast(toast.id); navigate(toast.action!.route) }}
            className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#194534] hover:underline"
          >
            {toast.action.label}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismissToast(toast.id)}
        className="absolute top-2.5 right-2.5 h-5 w-5 flex items-center justify-center rounded-full text-[#A0ADA6] hover:bg-stone-100 hover:text-[#0E1C15] text-[14px] font-bold transition-colors"
        aria-label="Dismiss"
      >
        {String.fromCharCode(215)}
      </button>
    </div>
  )
}

export function DemoToaster() {
  const { toasts } = useDemoContext()
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
