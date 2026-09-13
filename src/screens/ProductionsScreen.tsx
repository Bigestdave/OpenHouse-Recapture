import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { SearchIcon, PlusIcon, LockIcon, GlobeIcon } from '../components/icons2'
import { Ellipsis } from '../components/icons'
import { isDemoMode } from '../lib/runtime'
import { ProductionExperiencesScreen } from './ProductionExperiencesScreen'

import propAdmiralty from '../assets/prop-admiralty.jpg'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'
import propHeroWaterfront from '../assets/prop-hero-waterfront.jpg'

interface ExperienceItem {
  id: string
  propertyTitle: string
  propertyPremise: string
  propertyImg: string
  stateTitle: string
  stateSub: string
  stateKind: 'ready' | 'preparing' | 'live' | 'changes' | 'failed'
  visibility: 'Unlisted' | 'Public' | 'Not published'
  updated: string
  actionLabel: string
  actionKind: 'primary' | 'outline'
  showId: string
}

const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'exp-1',
    propertyTitle: '8 Admiralty Way',
    propertyPremise: '3-bedroom apartment · Lekki, Lagos',
    propertyImg: propAdmiralty,
    stateTitle: 'Ready for review',
    stateSub: '6 of 6 advertised rooms represented · 2 issues resolved',
    stateKind: 'ready',
    visibility: 'Unlisted',
    updated: '8 minutes ago',
    actionLabel: 'Review',
    actionKind: 'primary',
    showId: '8-admiralty-way',
  },
  {
    id: 'exp-2',
    propertyTitle: 'Orchid Apartments, Unit 4',
    propertyPremise: '2-bedroom apartment · Lekki, Lagos',
    propertyImg: propOrchid,
    stateTitle: 'Preparing experience',
    stateSub: 'Building connected room views',
    stateKind: 'preparing',
    visibility: 'Not published',
    updated: '4 minutes ago',
    actionLabel: 'Open',
    actionKind: 'outline',
    showId: 'orchid-1',
  },
  {
    id: 'exp-3',
    propertyTitle: 'Lekki Gardens, Unit 12',
    propertyPremise: '3-bedroom terrace · Lekki, Lagos',
    propertyImg: propLekkiGardens,
    stateTitle: 'Running final checks',
    stateSub: 'Checking room coverage and visual quality',
    stateKind: 'preparing',
    visibility: 'Not published',
    updated: '18 minutes ago',
    actionLabel: 'Open',
    actionKind: 'outline',
    showId: 'lekki-1',
  },
  {
    id: 'exp-4',
    propertyTitle: 'Bourdillon Court, Unit 8',
    propertyPremise: '4-bedroom apartment · Ikoyi, Lagos',
    propertyImg: propBourdillon,
    stateTitle: 'Live',
    stateSub: 'Published yesterday',
    stateKind: 'live',
    visibility: 'Public',
    updated: 'Yesterday',
    actionLabel: 'Open experience',
    actionKind: 'outline',
    showId: 'bourdillon-1',
  },
  {
    id: 'exp-5',
    propertyTitle: 'Palm View Residence, Unit 5',
    propertyPremise: '2-bedroom apartment · Victoria Island, Lagos',
    propertyImg: propHeroWaterfront,
    stateTitle: 'Changes requested',
    stateSub: 'Bedroom 2 connection needs review',
    stateKind: 'changes',
    visibility: 'Unlisted',
    updated: 'Yesterday',
    actionLabel: 'View changes',
    actionKind: 'outline',
    showId: 'palm-view-5',
  },
]

const filterTabs = ['All', 'Preparing', 'Ready for review', 'Live', 'Failed'] as const
type FilterTab = (typeof filterTabs)[number]

export function ProductionsScreen() {
  if (!isDemoMode) return <ProductionExperiencesScreen />
  const [filter, setFilter] = useState<FilterTab>('All')
  const [query, setQuery] = useState('')

  const visibleExperiences = (isDemoMode ? EXPERIENCES_DATA : []).filter((e) => {
    if (query && !e.propertyTitle.toLowerCase().includes(query.toLowerCase()) && !e.propertyPremise.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    if (filter === 'All') return true
    if (filter === 'Preparing') return e.stateKind === 'preparing'
    if (filter === 'Ready for review') return e.stateKind === 'ready'
    if (filter === 'Live') return e.stateKind === 'live'
    if (filter === 'Failed') return e.stateKind === 'changes'
    return true
  })

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Experiences
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              Manage the interactive experiences visitors can open.
            </p>
          </div>

          <Link
            to="/create-show"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors shrink-0 whitespace-nowrap"
          >
            <PlusIcon size={14} strokeWidth={2} />
            <span>Create from property</span>
          </Link>
        </div>

        {/* Toolbar: Filters, Search, Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2.5">
            <div className="flex w-full sm:w-[220px] md:w-[260px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13.5px] text-text-primary shadow-subtle focus-within:border-primary">
              <SearchIcon size={15} className="text-text-secondary shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary/70 min-w-0 font-normal"
              />
            </div>
            <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary outline-none shadow-subtle whitespace-nowrap shrink-0">
              <option>Recently updated ⌵</option>
              <option>Alphabetical</option>
              <option>Status</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.8fr_2.4fr_1.1fr_1fr_140px] items-center gap-4 px-5 py-3 border-b border-border bg-surface-elevated/50 text-[11px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              <div>Property</div>
              <div>State</div>
              <div>Visibility</div>
              <div>Updated</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y divide-border/60">
              {visibleExperiences.length === 0 ? (
                <div className="px-5 py-12 text-center text-[13px] text-text-secondary">
                  No published experiences yet. Approved properties will appear here.
                </div>
              ) : visibleExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="grid grid-cols-[1.8fr_2.4fr_1.1fr_1fr_140px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors"
                >
                  {/* Property */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={exp.propertyImg}
                      alt={exp.propertyTitle}
                      className="h-10 w-14 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary text-[13.5px] truncate">{exp.propertyTitle}</p>
                      <p className="text-[12px] text-text-secondary truncate mt-0.5">{exp.propertyPremise}</p>
                    </div>
                  </div>

                  {/* State */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          exp.stateKind === 'live'
                            ? 'bg-success'
                            : exp.stateKind === 'ready'
                            ? 'bg-success'
                            : exp.stateKind === 'preparing'
                            ? 'bg-accent animate-pulse'
                            : 'bg-danger'
                        }`}
                      />
                      <span className="font-semibold text-text-primary text-[13px] truncate">{exp.stateTitle}</span>
                    </div>
                    <p className="text-[12px] text-text-secondary mt-0.5 truncate">{exp.stateSub}</p>
                  </div>

                  {/* Visibility */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary rounded-full bg-surface-elevated border border-border px-2.5 py-0.5 whitespace-nowrap">
                      {exp.visibility === 'Public' ? <GlobeIcon size={12} className="text-text-secondary" /> : <LockIcon size={12} className="text-text-secondary" />}
                      <span>{exp.visibility}</span>
                    </span>
                  </div>

                  {/* Updated */}
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">
                    {exp.updated}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={exp.actionLabel === 'Open experience' ? `/view/${exp.showId}` : `/show/${exp.showId}`}
                      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                        exp.actionKind === 'primary'
                          ? 'bg-primary text-text-inverse shadow-subtle hover:bg-primary-hover'
                          : 'border border-border bg-surface text-text-primary hover:bg-surface-elevated'
                      }`}
                    >
                      {exp.actionLabel}
                    </Link>
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors">
                      <Ellipsis size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between text-[13.5px] text-text-secondary pt-2">
          <span>{isDemoMode ? `Showing 1 to ${visibleExperiences.length} of 25 experiences.` : 'No production experiences to show yet.'}</span>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-elevated">
              &lt;
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-text-inverse font-bold">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-elevated">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-elevated">
              3
            </button>
            <span className="px-1">…</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-elevated">
              5
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-elevated">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}

