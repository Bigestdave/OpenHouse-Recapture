import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { SearchIcon, PlusIcon, LightBulbIcon } from '../components/icons2'
import { isDemoMode } from '../lib/runtime'
import { ProductionCaptureRequestsScreen } from './ProductionCaptureRequestsScreen'

import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propAdmiralty from '../assets/prop-admiralty.jpg'
import demoBalcony from '../assets/demo-balcony.jpg'

interface CaptureRequestItem {
  id: string
  propertyTitle: string
  propertyLocation: string
  propertyImg: string
  captureNeeded: string
  recipient: string
  status: 'Awaiting capture' | 'Footage received' | 'Checking' | 'Resolved'
  updated: string
  actionLabel: string
}

const REQUESTS_DATA: CaptureRequestItem[] = [
  {
    id: 'homestead-pool',
    propertyTitle: '72691 Homestead Road, Palm Desert',
    propertyLocation: 'Palm Desert, CA 92260',
    propertyImg: demoBalcony,
    captureNeeded: 'Pool-to-guest house connection',
    recipient: 'Sarah Jenkins',
    status: 'Awaiting capture',
    updated: '12 minutes ago',
    actionLabel: 'View request',
  },
  {
    id: '2',
    propertyTitle: 'Orchid Apartments, Unit 4',
    propertyLocation: 'Lekki, Lagos',
    propertyImg: propOrchid,
    captureNeeded: 'Bedroom 2 doorway',
    recipient: 'Tola Adeyemi',
    status: 'Footage received',
    updated: '4 minutes ago',
    actionLabel: 'Check footage',
  },
  {
    id: '3',
    propertyTitle: 'Lekki Gardens, Unit 12',
    propertyLocation: 'Lekki, Lagos',
    propertyImg: propLekkiGardens,
    captureNeeded: 'Front entrance approach',
    recipient: 'Kiki Casa',
    status: 'Checking',
    updated: '18 minutes ago',
    actionLabel: 'View',
  },
  {
    id: '4',
    propertyTitle: '8 Admiralty Way',
    propertyLocation: 'Lekki, Lagos',
    propertyImg: propAdmiralty,
    captureNeeded: 'Living-room-to-balcony connection',
    recipient: 'Kiki Casa',
    status: 'Resolved',
    updated: 'Today, 14:03',
    actionLabel: 'View history',
  },
]

const filterTabs = ['Open', 'Awaiting capture', 'Received', 'Checking', 'Resolved'] as const
type FilterTab = (typeof filterTabs)[number]

export function CaptureRequestsScreen() {
  if (!isDemoMode) return <ProductionCaptureRequestsScreen />
  const [filter, setFilter] = useState<FilterTab>('Open')
  const [query, setQuery] = useState('')

  const visibleRequests = (isDemoMode ? REQUESTS_DATA : []).filter((r) => {
    if (query && !r.propertyTitle.toLowerCase().includes(query.toLowerCase()) && !r.captureNeeded.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    if (filter === 'Open') return r.status !== 'Resolved'
    if (filter === 'Awaiting capture') return r.status === 'Awaiting capture'
    if (filter === 'Received') return r.status === 'Footage received'
    if (filter === 'Checking') return r.status === 'Checking'
    if (filter === 'Resolved') return r.status === 'Resolved'
    return true
  })

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Capture requests
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              Track missing property evidence and submitted footage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex w-full sm:w-[260px] md:w-[300px] lg:w-[320px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13.5px] text-text-primary shadow-subtle focus-within:border-primary">
              <SearchIcon size={15} className="text-text-secondary shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties..."
                className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary/70 min-w-0 font-normal"
              />
            </div>

            {isDemoMode && (
              <Link
                to="/capture-requests/1"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors shrink-0 whitespace-nowrap"
              >
                <PlusIcon size={14} strokeWidth={2} />
                <span>New request</span>
              </Link>
            )}
          </div>
        </div>

        {/* Counter Subheading */}
        <p className="text-[13px] text-text-secondary font-medium whitespace-nowrap">
          {isDemoMode ? <><strong className="text-text-primary">2</strong> awaiting capture · <strong className="text-text-primary">1</strong> received · <strong className="text-text-primary">6</strong> resolved this month</> : 'Capture requests created by an analysis will appear here.'}
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1 text-[13px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                filter === f
                  ? 'bg-primary text-text-inverse shadow-subtle'
                  : 'border border-border bg-surface text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Requests Data Table */}
        <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[2fr_2fr_1.3fr_1.3fr_1fr_120px] items-center gap-4 px-5 py-3 border-b border-border bg-surface-elevated/50 text-[11px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              <div>Property</div>
              <div>Capture needed</div>
              <div>Recipient</div>
              <div>Status</div>
              <div>Updated</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y divide-border/60">
              {visibleRequests.length === 0 ? (
                <div className="px-5 py-12 text-center text-[13px] text-text-secondary">
                  No capture requests yet. OpenHouse will create one only when analysis finds missing evidence.
                </div>
              ) : visibleRequests.map((req) => (
                <div
                  key={req.id}
                  className="grid grid-cols-[2fr_2fr_1.3fr_1.3fr_1fr_120px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors"
                >
                  {/* Property Column */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={req.propertyImg}
                      alt={req.propertyTitle}
                      className="h-10 w-14 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary text-[13.5px] truncate">{req.propertyTitle}</p>
                      <p className="text-[12px] text-text-secondary truncate mt-0.5">{req.propertyLocation}</p>
                    </div>
                  </div>

                  {/* Capture Needed */}
                  <div className="text-[13px] font-medium text-text-primary truncate">
                    {req.captureNeeded}
                  </div>

                  {/* Recipient */}
                  <div className="text-[13px] text-text-secondary truncate whitespace-nowrap">
                    {req.recipient}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 whitespace-nowrap ${
                        req.status === 'Awaiting capture'
                          ? 'bg-accent/10 text-accent'
                          : req.status === 'Footage received'
                          ? 'bg-info/10 text-info'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          req.status === 'Awaiting capture'
                            ? 'bg-accent'
                            : req.status === 'Footage received'
                            ? 'bg-info'
                            : 'bg-success'
                        }`}
                      />
                      {req.status}
                    </span>
                  </div>

                  {/* Updated */}
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">
                    {req.updated}
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <Link
                      to={`/capture-requests/${req.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-text-primary hover:bg-surface-elevated shadow-subtle transition-colors whitespace-nowrap"
                    >
                      {req.actionLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Guidance Box */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 rounded-2xl border border-border bg-surface-elevated/40 p-5 shadow-subtle">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <LightBulbIcon size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-text-primary">A good request is specific</h3>
              <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">
                Clear guidance helps your contributor capture the exact perspective needed on the first attempt.
              </p>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
              Example request instruction
            </p>
            <p className="text-[13px] italic text-text-primary leading-relaxed">
              “Start in the living room and walk slowly through the balcony doorway.”
            </p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
