import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { SearchIcon } from '../components/icons2'
import propBourdillonImg from '../assets/prop-bourdillon.jpg'
import propLekkiImg from '../assets/prop-lekkigardens.jpg'
import propOrchidImg from '../assets/prop-orchid.jpg'
import demoLiving from '../assets/demo-living-room.jpg'
import { DEMO_PROPERTY_ID, useDemoContext } from '../context/DemoContext'
import { isDemoMode } from '../lib/runtime'
import { ProductionApprovalsScreen } from './ProductionApprovalsScreen'

// SVGs matching the reference UI
function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  )
}

function AlertCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  )
}

interface ApprovalItem {
  id: string
  title: string
  subtitle: string
  image: string
  representation: string
  hasWarning?: boolean
  status: string
  checklist?: string[]
}

export function ApprovalsScreen() {
  if (!isDemoMode) return <ProductionApprovalsScreen />
  const navigate = useNavigate()
  const { stage, setStage } = useDemoContext()
  const [filter, setFilter] = useState<'Ready' | 'Changes requested' | 'Published'>('Ready')
  const [query, setQuery] = useState('')

  // Featured Property (matches reference hero card)
  const featuredProperty: ApprovalItem = {
    id: DEMO_PROPERTY_ID,
    title: '72691 Homestead Road, Palm Desert',
    subtitle: '4-bedroom estate with guest house · Palm Desert, CA 92260',
    image: demoLiving,
    representation: '7 of 7 advertised spaces represented',
    status: 'READY TO PUBLISH',
    checklist: [
      '7 of 7 advertised spaces represented',
      'Pool-to-guest house recapture verified & integrated',
      'Gemini spatial continuity validated',
    ],
  }

  // List of other properties (matches reference bottom list)
  const readyQueue: ApprovalItem[] = [
    {
      id: 'lekki-1',
      title: 'Lekki Gardens, Unit 12',
      subtitle: '3-bedroom terrace',
      image: propLekkiImg,
      representation: '8 of 8 rooms represented',
      status: 'Ready for review',
    },
    {
      id: 'orchid-1',
      title: 'Orchid Apartments, Unit 4',
      subtitle: '2-bedroom apartment',
      image: propOrchidImg,
      representation: '5 of 5 rooms represented',
      status: 'Ready for review',
    },
    {
      id: 'bourdillon-1',
      title: 'Bourdillon Court, Unit 8',
      subtitle: '4-bedroom apartment',
      image: propBourdillonImg,
      representation: 'One unavailable measurement',
      hasWarning: true,
      status: 'Ready for review',
    },
  ]

  const changesRequestedQueue: ApprovalItem[] = [
    {
      id: 'prop-04',
      title: 'Ocean View Residence, Block B',
      subtitle: '4-bedroom penthouse · Victoria Island, Lagos',
      image: propBourdillonImg,
      representation: 'Missing kitchen pantry connection',
      hasWarning: true,
      status: 'Recapture requested',
    },
  ]

  const publishedQueue: ApprovalItem[] = [
    {
      id: 'bourdillon-court',
      title: 'Bourdillon Court, Penthouse A',
      subtitle: '4-bedroom apartment · Ikoyi, Lagos',
      image: propBourdillonImg,
      representation: 'All 7 spaces verified',
      status: 'Live 24/7',
    },
    {
      id: 'lekki-gardens-2',
      title: 'Lekki Gardens, Block 4',
      subtitle: '3-bedroom terrace · Lekki, Lagos',
      image: propLekkiImg,
      representation: 'All 8 spaces verified',
      status: 'Live 24/7',
    },
  ]

  const currentList = !isDemoMode
    ? []
    :
    filter === 'Ready'
      ? readyQueue
      : filter === 'Changes requested'
      ? changesRequestedQueue
      : publishedQueue

  const filteredList = query
    ? currentList.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : currentList

  const isFeaturedMatch =
    isDemoMode &&
    filter === 'Ready' &&
    (!query ||
      featuredProperty.title.toLowerCase().includes(query.toLowerCase()) ||
      featuredProperty.subtitle.toLowerCase().includes(query.toLowerCase()))

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 font-sans text-ink space-y-6">

        {/* ── Top Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Approvals
            </h1>
            <p className="text-[14px] text-text-secondary mt-1 font-normal">
              Review completed experiences before they go live.
            </p>
          </div>

          <div className="flex w-full sm:w-[280px] lg:w-[300px] items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-ink shadow-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all shrink-0">
            <SearchIcon size={15} className="text-ink-3 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full bg-transparent text-ink placeholder:text-ink-3 outline-none text-[13.5px] font-normal"
            />
          </div>
        </div>

        {/* ── Subheader & Filter Pills ────────────────────────────── */}
        <div className="space-y-3 pt-1">
          <p className="text-[13px] text-ink-2 font-normal">
            {filter === 'Ready' ? '4 ready for review' : `${filteredList.length} items`}
          </p>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('Ready')}
              className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all whitespace-nowrap ${
                filter === 'Ready'
                  ? 'bg-[#0B1713] text-white shadow-subtle'
                  : 'border border-border bg-surface text-ink hover:bg-stone-50'
              }`}
            >
              Ready
            </button>

            <button
              onClick={() => setFilter('Changes requested')}
              className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all whitespace-nowrap ${
                filter === 'Changes requested'
                  ? 'bg-[#0B1713] text-white shadow-subtle'
                  : 'border border-border bg-surface text-ink hover:bg-stone-50'
              }`}
            >
              Changes requested
            </button>

            <button
              onClick={() => setFilter('Published')}
              className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all whitespace-nowrap ${
                filter === 'Published'
                  ? 'bg-[#0B1713] text-white shadow-subtle'
                  : 'border border-border bg-surface text-ink hover:bg-stone-50'
              }`}
            >
              Published
            </button>
          </div>
        </div>

        {/* ── Featured Hero Card (Matches Reference Top Card) ──────── */}
        {isFeaturedMatch && (
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle">
            {/* Left 7 Cols: Image */}
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[300px] lg:min-h-[360px] overflow-hidden bg-sidebar">
              <img
                src={featuredProperty.image}
                alt={featuredProperty.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Right 5 Cols: Information & Actions */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-surface">
              <div className="space-y-4">
                {/* Status tag */}
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage >= 6 ? 'bg-success' : 'bg-[#194534]'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${stage >= 6 ? 'text-success' : 'text-[#194534]'}`}>
                    {stage >= 6 ? '● LIVE · PUBLISHED' : 'READY TO PUBLISH'}
                  </span>
                </div>

                {/* Title and location */}
                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-ink leading-tight">
                    {featuredProperty.title}
                  </h2>
                  <p className="text-[13.5px] text-ink-2 mt-1">
                    {featuredProperty.subtitle}
                  </p>
                </div>

                {/* Verification checklist bullets */}
                <div className="space-y-2.5 pt-2">
                  {featuredProperty.checklist?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-[13px] text-ink">
                      <span className="h-4 w-4 rounded-full bg-[#194534] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        ✓
                      </span>
                      <span className="font-medium text-stone-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-6 border-t border-border/50">
                {stage >= 6 ? (
                  <>
                    <Link
                      to={`/public/${featuredProperty.id}`}
                      className="w-full rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-all shadow-subtle text-center whitespace-nowrap"
                    >
                      View live experience →
                    </Link>
                    <Link
                      to={`/property/${featuredProperty.id}`}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-stone-50 transition-all text-center whitespace-nowrap"
                    >
                      Property overview
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setStage(6)
                        setTimeout(() => navigate(`/public/${featuredProperty.id}`), 500)
                      }}
                      className="w-full rounded-xl bg-[#0B1713] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-black transition-all shadow-subtle text-center whitespace-nowrap"
                    >
                      Approve &amp; Publish ✓
                    </button>

                    <Link
                      to={`/property/${featuredProperty.id}`}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-stone-50 transition-all text-center whitespace-nowrap"
                    >
                      Review experience
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── List of Other Properties (Matches Reference Bottom Card) ── */}
        {filteredList.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle divide-y divide-border/60">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-stone-50/50 transition-colors"
              >
                {/* Col 1: Photo + Title + Subtitle */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-14 w-24 sm:h-16 sm:w-28 rounded-xl object-cover border border-border/80 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] sm:text-[15px] font-bold text-ink truncate">
                      {item.title}
                    </h3>
                    <p className="text-[12.5px] text-ink-2 mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Col 2: Room Representation Badge */}
                <div className="flex items-center gap-2 text-[12.5px] sm:px-4 shrink-0">
                  {item.hasWarning ? (
                    <>
                      <AlertCircleIcon className="h-4 w-4 text-amber-600 shrink-0" />
                      <span className="font-medium text-stone-700">{item.representation}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-[#194534] shrink-0" />
                      <span className="font-medium text-stone-700">{item.representation}</span>
                    </>
                  )}
                </div>

                {/* Col 3: Status Dot & Label */}
                <div className="flex items-center gap-2 text-[12.5px] text-ink-2 shrink-0">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.status.toLowerCase().includes('live')
                        ? 'bg-[#194534]'
                        : item.hasWarning
                        ? 'bg-amber-500'
                        : 'bg-[#194534]'
                    }`}
                  />
                  <span className="font-medium">{item.status}</span>
                </div>

                {/* Col 4: Action Button */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/show/${item.id}`)}
                    className="rounded-xl border border-border bg-surface px-5 py-2 text-[12.5px] font-semibold text-ink hover:bg-stone-50 transition-all shadow-2xs whitespace-nowrap"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isFeaturedMatch && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-sm font-semibold text-ink">No items in this filter</p>
              <p className="text-xs text-ink-2 mt-1">Properties will appear here when ready.</p>
            </div>
          )
        )}

      </div>
    </WorkspaceShell>
  )
}

