import { useState } from 'react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { WarnTriangle } from '../components/icons'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'success' | 'warning' | 'info'
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Spatial Reconstruction Complete',
    description: "Property experience '8 Admiralty Way' 3D walkthrough generated successfully.",
    time: '5m ago',
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Coverage Verification Required',
    description: "Property 'Orchid Apartments, Unit 4' requires attention: Additional capture needed for Balcony space.",
    time: '18m ago',
    read: false,
    type: 'warning'
  },
  {
    id: '3',
    title: 'Spatial Units Notice',
    description: "Lagos Real Estate Studio workspace has consumed 80% of current monthly spatial processing units.",
    time: '1h ago',
    read: true,
    type: 'warning'
  },
  {
    id: '4',
    title: 'Experience Ready for Review',
    description: "Spatial tour completed for 'Bourdillon Court, Ikoyi'. Ready for final verification and publish.",
    time: '3h ago',
    read: true,
    type: 'success'
  }
]

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications)

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[28px] font-semibold text-ink leading-tight">Notifications</h1>
            <p className="text-[15px] text-ink-2 mt-1.5">Stay updated on your property captures and experience preparation activities.</p>
          </div>
          <button
            onClick={markAllRead}
            className="text-[13px] font-medium text-accent hover:underline focus:outline-none"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications list */}
        <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden shadow-subtle">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-5 flex items-start gap-4 transition-colors hover:bg-selected relative ${
                  !item.read ? 'bg-accent-soft/30' : ''
                }`}
              >
                {/* Unread dot */}
                {!item.read && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent" />
                )}

                {/* Left icon */}
                <div className="mt-0.5">
                  {item.type === 'warning' ? (
                    <span className="text-warn"><WarnTriangle size={18} /></span>
                  ) : (
                    <span className="text-accent font-semibold">✓</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`text-[15px] ${!item.read ? 'text-ink font-semibold' : 'text-ink-2 font-medium'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[12.5px] text-ink-3 whitespace-nowrap shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[14px] text-ink-2 mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => deleteNotification(item.id)}
                  className="text-ink-3 hover:text-ink transition-colors text-[13px] ml-2"
                >
                  Dismiss
                </button>
              </div>
            ))
          ) : (
            <div className="h-[200px] flex items-center justify-center text-ink-3 text-[14.5px]">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  )
}
