/**
 * DemoContext.tsx
 * Global demo state + toast system for OpenHouse demo video.
 *
 * Stages:
 *  0 = idle (no demo running)
 *  1 = listing imported from Zillow/AirBNB → build started
 *  2 = building in progress (overview animated)
 *  3 = capture issue detected by Gemini AI
 *  4 = recapture received → processing
 *  5 = ready for approval
 *  6 = approved and live
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type DemoStage = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ToastKind = 'info' | 'warning' | 'success' | 'error'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  body?: string
  action?: { label: string; route: string }
  duration?: number
}

export interface DemoNotification {
  id: string
  kind: ToastKind
  title: string
  body: string
  route?: string
  timestamp: Date
  read: boolean
}

export const DEMO_PROPERTY_ID = 'homestead-pd'
export const DEMO_PROPERTY_LABEL = '72691 Homestead Road, Palm Desert'

export const DEMO_SCRIPT: Record<DemoStage, {
  toast?: Omit<Toast, 'id'>
  notification?: Omit<DemoNotification, 'id' | 'timestamp' | 'read'>
}> = {
  0: {},
  1: {
    toast: {
      kind: 'info',
      title: 'Listing received from Zillow',
      body: `${DEMO_PROPERTY_LABEL} — OpenHouse is starting your 3D inspection build.`,
      action: { label: 'View property', route: `/property/${DEMO_PROPERTY_ID}` },
      duration: 8000,
    },
    notification: {
      kind: 'info',
      title: 'New listing imported',
      body: `${DEMO_PROPERTY_LABEL} received from Zillow. Building started.`,
      route: `/property/${DEMO_PROPERTY_ID}`,
    },
  },
  2: {
    toast: {
      kind: 'info',
      title: 'Building 3D inspection',
      body: `Collecting and processing spaces for ${DEMO_PROPERTY_LABEL}…`,
      action: { label: 'Watch progress', route: `/property/${DEMO_PROPERTY_ID}` },
      duration: 6000,
    },
    notification: {
      kind: 'info',
      title: 'Build in progress',
      body: `${DEMO_PROPERTY_LABEL} — synthesising room data.`,
      route: `/property/${DEMO_PROPERTY_ID}`,
    },
  },
  3: {
    toast: {
      kind: 'warning',
      title: 'Recapture needed — Pool-to-guest house transition',
      body: `Gemini detected a missing angle on ${DEMO_PROPERTY_LABEL}. A guide has been prepared.`,
      action: { label: 'View capture request', route: `/capture-requests/homestead-pool` },
      duration: 10000,
    },
    notification: {
      kind: 'warning',
      title: 'Missing capture detected',
      body: `Pool-to-guest house transition missing on ${DEMO_PROPERTY_LABEL}. Recapture guide ready.`,
      route: `/capture-requests/homestead-pool`,
    },
  },
  4: {
    toast: {
      kind: 'success',
      title: 'Recapture received',
      body: `Pool transition footage uploaded for ${DEMO_PROPERTY_LABEL}. OpenHouse is resuming build.`,
      action: { label: 'View experience', route: `/property/${DEMO_PROPERTY_ID}` },
      duration: 8000,
    },
    notification: {
      kind: 'success',
      title: 'Recapture received',
      body: `${DEMO_PROPERTY_LABEL} — pool footage approved. Resuming synthesis.`,
      route: `/property/${DEMO_PROPERTY_ID}`,
    },
  },
  5: {
    toast: {
      kind: 'success',
      title: 'Ready for approval',
      body: `${DEMO_PROPERTY_LABEL} has completed processing and is awaiting your review.`,
      action: { label: 'Go to Approvals', route: `/approvals` },
      duration: 10000,
    },
    notification: {
      kind: 'success',
      title: 'Experience ready for approval',
      body: `${DEMO_PROPERTY_LABEL} is complete. Review and publish.`,
      route: `/approvals`,
    },
  },
  6: {
    toast: {
      kind: 'success',
      title: 'Experience approved and live',
      body: `${DEMO_PROPERTY_LABEL} is now published and accessible to clients.`,
      action: { label: 'View live experience', route: `/view/${DEMO_PROPERTY_ID}` },
      duration: 8000,
    },
    notification: {
      kind: 'success',
      title: 'Published',
      body: `${DEMO_PROPERTY_LABEL} is live. Share the link with clients.`,
      route: `/view/${DEMO_PROPERTY_ID}`,
    },
  },
}

interface DemoContextValue {
  stage: DemoStage
  toasts: Toast[]
  notifications: DemoNotification[]
  unreadCount: number
  advance: () => void
  setStage: (s: DemoStage) => void
  dismissToast: (id: string) => void
  markAllRead: () => void
  resetDemo: () => void
  isDemoActive: boolean
}

const DemoContext = createContext<DemoContextValue | null>(null)

let _seq = 0
function uid() { return `d-${Date.now()}-${++_seq}` }

export function DemoProvider({ children }: { children: ReactNode }) {
  const [stage, setStageRaw] = useState<DemoStage>(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [notifications, setNotifications] = useState<DemoNotification[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id] }
  }, [])

  const addToast = useCallback((def: Omit<Toast, 'id'>) => {
    const id = uid()
    setToasts((prev) => [...prev, { ...def, id }])
    timers.current[id] = setTimeout(() => dismissToast(id), def.duration ?? 7000)
  }, [dismissToast])

  const setStage = useCallback((s: DemoStage) => {
    setStageRaw(s)
    const script = DEMO_SCRIPT[s]
    if (script.toast) addToast(script.toast)
    if (script.notification) {
      setNotifications((prev) => [{
        ...script.notification!,
        id: uid(),
        timestamp: new Date(),
        read: false,
      }, ...prev])
    }
  }, [addToast])

  const advance = useCallback(() => {
    setStage(((stage < 6 ? stage + 1 : 6) as DemoStage))
  }, [stage, setStage])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const resetDemo = useCallback(() => {
    setStageRaw(0)
    setToasts([])
    setNotifications([])
    Object.values(timers.current).forEach(clearTimeout)
    timers.current = {}
  }, [])

  useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout) }, [])

  return (
    <DemoContext.Provider value={{
      stage, toasts, notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      advance, setStage, dismissToast, markAllRead, resetDemo,
      isDemoActive: stage > 0,
    }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemoContext must be inside <DemoProvider>')
  return ctx
}

export function useDemoStage() { return useDemoContext().stage }
