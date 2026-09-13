import { useState, type ReactNode } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  GridIcon,
  CaptureRequestsIcon,
  CubeIcon,
  ApprovalsIcon,
  UsageIcon,
  TeamIcon,
  GearIcon,
  BellIcon,
  PlusIcon,
} from './icons2'
import { ArrowLeft, ChevronDown } from './icons'
import { useDemoContext, type DemoNotification } from '../context/DemoContext'
import { useAuth } from '../lib/auth'
import { isDemoMode } from '../lib/runtime'

import logoMarkUrl from '../assets/logo-mark.png'

export function OpenHouseLogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <img
      src={logoMarkUrl}
      alt="OpenHouse"
      className={`${className} object-contain`}
    />
  )
}

/** Reusable Header Notification Button & Popover */
export function NotificationButton() {
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAllRead } = useDemoContext()

  return (
    <div className="relative">
      <button
        onClick={() => {
          const next = !showNotifications
          setShowNotifications(next)
          if (next) markAllRead()
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-[12px] border border-border bg-surface text-text-secondary transition-all hover:border-line-strong hover:bg-surface-elevated hover:text-text-primary shadow-subtle"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
        )}
        {unreadCount === 0 && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-accent opacity-40" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-3 w-[380px] rounded-2xl border border-border bg-surface shadow-overlay z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4 bg-surface-elevated">
            <span className="font-bold text-text-primary text-[15px]">Notifications</span>
            {notifications.length > 0 && (
              <span className="text-[11px] text-text-secondary font-medium">{notifications.length} update{notifications.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 && (
              <div className="p-6 text-center text-[13.5px] text-text-secondary">
                No notifications yet — property events will appear here.
              </div>
            )}
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onClose={() => setShowNotifications(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({ notification: n, onClose }: { notification: DemoNotification; onClose: () => void }) {
  const navigate = useNavigate()
  const dotColor =
    n.kind === 'warning' ? 'bg-amber-400' :
    n.kind === 'success' ? 'bg-success' :
    n.kind === 'error' ? 'bg-danger' : 'bg-accent'
  const timeParts = n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      onClick={() => { if (n.route) { navigate(n.route); onClose() } }}
      className={`p-4 flex items-start gap-3 transition-colors ${n.route ? 'cursor-pointer hover:bg-surface-elevated' : ''}`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor} ${!n.read ? 'opacity-100' : 'opacity-40'}`} />
      <div className="flex-1 min-w-0">
        <h3 className="text-[13.5px] font-semibold text-text-primary">{n.title}</h3>
        <p className="text-[12.5px] text-text-secondary mt-0.5 leading-snug">{n.body}</p>
        <span className="text-[11px] text-text-secondary/70 block mt-1.5">{timeParts}</span>
      </div>
      {n.route && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-secondary shrink-0 mt-1">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

const workspaceNav = [
  { label: 'Properties', icon: GridIcon, to: '/properties' },
  { label: 'Imported listings', icon: GridIcon, to: '/imported-listings' },
  { label: 'Capture requests', icon: CaptureRequestsIcon, to: '/capture-requests' },
  { label: 'Recapture agent', icon: CaptureRequestsIcon, to: '/recapture' },
  { label: 'Experiences', icon: CubeIcon, to: '/productions' },
  { label: 'Approvals', icon: ApprovalsIcon, to: '/approvals' },
]

const accountNav = [
  { label: 'Usage', icon: UsageIcon, to: '/usage' },
  { label: 'Team', icon: TeamIcon, to: '/team' },
  { label: 'Settings', icon: GearIcon, to: '/settings' },
]

interface WorkspaceShellProps {
  children: ReactNode
  breadcrumb?: ReactNode
  backTo?: string
}

export function WorkspaceShell({ children, breadcrumb, backTo = '/properties' }: WorkspaceShellProps) {
  const { profile } = useAuth()
  const userName = profile?.fullName || (isDemoMode ? 'David Olabowale' : 'Realtor')
  const userEmail = profile?.email || (isDemoMode ? 'david@openhouse.com' : '')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas font-sans text-text-primary">
      {/* Sleek Deep Green-Black Sidebar */}
      <aside className="flex w-[248px] xl:w-[260px] shrink-0 flex-col bg-sidebar border-r border-border-dark select-none h-full z-20 transition-all">
        {/* Brand Header */}
        <div className="px-4 pt-5 pb-3">
          <Link to="/properties" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar-active border border-border-dark shadow-subtle group-hover:border-accent/50 transition-colors">
              <OpenHouseLogoMark className="h-4.5 w-4.5" />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight text-text-inverse leading-none">
              OpenHouse
            </span>
          </Link>
        </div>

        {/* Top + Add Property Button CTA */}
        <div className="px-3.5 pb-3">
          <Link
            to="/add-property"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface px-3.5 py-2 text-[13.5px] font-semibold text-text-primary shadow-subtle transition-all duration-200 hover:bg-surface-elevated hover:shadow-card active:translate-y-0 whitespace-nowrap"
          >
            <PlusIcon size={14} strokeWidth={2} />
            <span>Add property</span>
          </Link>
        </div>

        {/* WORKSPACE Navigation Section */}
        <div className="pt-1">
          <p className="px-4 pb-1.5 text-[10.5px] font-bold tracking-[0.12em] text-text-inverse-muted/60 uppercase">
            WORKSPACE
          </p>
          <nav className="flex flex-col gap-0.5 px-2.5">
            {workspaceNav.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-sidebar-active text-text-inverse border border-border-dark shadow-sm'
                      : 'text-text-inverse-muted hover:bg-sidebar-active/50 hover:text-text-inverse'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-1 h-3 w-[2.5px] rounded-full bg-accent" />
                    )}
                    <Icon
                      size={16}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-accent' : 'text-text-inverse-muted group-hover:text-text-inverse'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ACCOUNT Navigation Section */}
        <div className="pt-4">
          <p className="px-4 pb-1.5 text-[10.5px] font-bold tracking-[0.12em] text-text-inverse-muted/60 uppercase">
            ACCOUNT
          </p>
          <nav className="flex flex-col gap-0.5 px-2.5">
            {accountNav.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-sidebar-active text-text-inverse border border-border-dark shadow-sm'
                      : 'text-text-inverse-muted hover:bg-sidebar-active/50 hover:text-text-inverse'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-1 h-3 w-[2.5px] rounded-full bg-accent" />
                    )}
                    <Icon
                      size={16}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-accent' : 'text-text-inverse-muted group-hover:text-text-inverse'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="mt-auto border-t border-border-dark px-2.5 py-2.5">
          <button
            type="button"
            title="Account settings will be available here."
            className="flex w-full items-center gap-2 rounded-lg border border-transparent p-1.5 text-[13px] text-text-inverse transition-colors hover:bg-sidebar-active/70 hover:border-border-dark text-left"
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-text-inverse shadow-subtle"
              style={{ background: 'linear-gradient(135deg, #194534 0%, #0B1713 100%)', border: '1px solid #293A32' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-text-inverse leading-tight">{userName}</p>
              <p className="truncate text-[10.5px] text-text-inverse-muted">{userEmail}</p>
            </div>
            <ChevronDown size={13} className="text-text-inverse-muted shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Workspace (Warm Limestone) - Dedicated Clean Scroll Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto h-full bg-canvas">
        {/* Render Slim Breadcrumb Bar ONLY on Subpages with backTo/breadcrumb */}
        {breadcrumb && (
          <div className="flex h-13 shrink-0 items-center justify-between px-6 lg:px-10 border-b border-border/60 bg-canvas sticky top-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                to={backTo}
                className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary shadow-subtle shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="text-[14px] font-semibold text-text-primary truncate">{breadcrumb}</div>
            </div>
            <NotificationButton />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
