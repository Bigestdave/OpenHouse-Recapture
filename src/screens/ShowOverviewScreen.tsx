import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import {
  getShow,
  listCharacters,
  type Show,
  type CharacterSummary,
} from '../data/api'
import { pushRecentShow } from '../data/recents'
import { showBanner } from '../data/artwork'
import { SkeletonShowHeader } from '../components/Skeleton'
import { CopyIcon } from '../components/icons2'
import { Ellipsis, CheckCircle } from '../components/icons'
import { useDemoStage, DEMO_PROPERTY_ID } from '../context/DemoContext'
import { isDemoMode } from '../lib/runtime'
import { getAnalysisStatus, getProductionProperty, publishProductionProperty, retryProductionAnalysis, type AnalysisJobStatus } from '../lib/productionWorkflow'

import demoLiving   from '../assets/demo-living-room.jpg'
import demoKitchen  from '../assets/demo-kitchen.jpg'
import demoBed      from '../assets/demo-master-bedroom.jpg'
import demoBalcony  from '../assets/demo-balcony.jpg'
import demoBath     from '../assets/demo-bathroom.jpg'
import demoExterior from '../assets/demo-exterior.jpg'

import propAdmiralty from '../assets/prop-admiralty.jpg'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'
import propHeroWaterfront from '../assets/prop-hero-waterfront.jpg'
import propKitchen from '../assets/prop-kitchen.png'

const tabs = ['Overview', 'Evidence', 'Experience', 'Activity'] as const
type TabType = (typeof tabs)[number]

// Demo property rooms (Palm Desert estate with real Matterport images)
const DEMO_ROOMS = [
  { id: 'entrance',  name: 'Entry & Patio',       img: demoExterior },
  { id: 'living',    name: 'Living Room',          img: demoLiving   },
  { id: 'kitchen',   name: 'Dining & Kitchen',     img: demoKitchen  },
  { id: 'main-bed',  name: 'Primary Suite',        img: demoBed      },
  { id: 'bathroom',  name: 'Primary Bathroom',     img: demoBath     },
  { id: 'bed-2',     name: 'Guest Suite',          img: demoBed      },
  { id: 'balcony',   name: 'Pool & Outdoor',       img: demoBalcony  },
]

// Fallback rooms for non-demo properties
const ROOM_LIST = [
  { id: 'entrance', name: 'Entrance', img: propHeroWaterfront },
  { id: 'living', name: 'Living room', img: propAdmiralty },
  { id: 'kitchen', name: 'Kitchen', img: propKitchen },
  { id: 'main-bed', name: 'Main bedroom', img: propBourdillon },
  { id: 'bed-2', name: 'Bedroom 2', img: propLekkiGardens },
  { id: 'bed-3', name: 'Bedroom 3', img: propOrchid },
  { id: 'balcony', name: 'Balcony', img: propHeroWaterfront },
]

export function ShowOverviewScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const demoStage = useDemoStage()
  const isDemoProperty = id === DEMO_PROPERTY_ID || id === 'homestead-pd' || id === 'laurel-12a' || id?.includes('homestead') || id?.includes('laurel') || !id || id === 'prop-01'
  const roomList = isDemoProperty ? DEMO_ROOMS : ROOM_LIST

  const [tab, setTab] = useState<TabType>('Overview')
  const [show, setShow] = useState<Show | null>(null)
  const [, setCharacters] = useState<CharacterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [activeRoom, setActiveRoom] = useState('living')
  const [issuesOpen, setIssuesOpen] = useState(true)
  const [visibility, setVisibility] = useState('Unlisted link')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [analysisJob, setAnalysisJob] = useState<AnalysisJobStatus['job']>(null)
  const [retryingAnalysis, setRetryingAnalysis] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    if (!isDemoMode) {
      getProductionProperty(id)
        .then((detail) => {
          if (cancelled) return
          setShow({
            id: detail.property.id,
            title: detail.property.title,
            premise: `${detail.property.bedrooms}-bed · ${detail.property.bathrooms}-bath · ${detail.property.address}`,
            status: detail.property.status.replace(/_/g, ' '),
            default_duration_seconds: 0,
            default_aspect_ratio: '16:9',
            current_continuity_version: 1,
          })
          const latestJob = detail.jobs.find((job) => job.kind === 'analysis')
          if (latestJob) setAnalysisJob({
            id: latestJob.id, status: latestJob.status as 'queued' | 'running' | 'completed' | 'failed',
            attempt_count: latestJob.attempt_count ?? 0, max_attempts: latestJob.max_attempts ?? 3, next_attempt_at: null,
            progress_phase: latestJob.progress_phase ?? 'complete', progress_message: latestJob.progress_message ?? null,
            error_message: latestJob.error_message ?? null, created_at: '', started_at: null, completed_at: null,
          })
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          if (!cancelled) setLoading(false)
        })
      return () => { cancelled = true }
    }
    Promise.all([getShow(id), listCharacters(id).catch(() => [])])
      .then(([showData, charData]) => {
        if (cancelled) return
        setShow(showData)
        setCharacters(charData)
        setLoading(false)
        pushRecentShow({ id: showData.id, title: showData.title })
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) {
          setShow({
            id: id,
            title: isDemoProperty
              ? '72691 Homestead Road, Palm Desert'
              : id.includes('admiralty') ? '8 Admiralty Way' : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            premise: isDemoProperty
              ? '4-bed · 4-bath estate · Palm Desert, CA 92260'
              : '3-bedroom apartment · Lekki, Lagos',
            status: 'Preparing experience',
            created_at: '2026-08-25T10:00:00Z',
          } as any)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, isDemoProperty])

  useEffect(() => {
    if (isDemoMode || !id) return
    let active = true
    const refresh = () => getAnalysisStatus(id).then((result) => { if (active) setAnalysisJob(result.job) }).catch(() => undefined)
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [id])

  const retryAnalysis = () => {
    if (!id) return
    setRetryingAnalysis(true)
    void retryProductionAnalysis(id).then(() => getAnalysisStatus(id)).then((result) => setAnalysisJob(result.job)).catch((reason) => setPublishError(reason instanceof Error ? reason.message : 'Could not retry analysis.')).finally(() => setRetryingAnalysis(false))
  }

  const handlePublish = () => {
    if (isDemoMode) {
      navigate(`/view/${show?.id || '8-admiralty-way'}`)
      return
    }
    if (!show?.id) return
    setPublishError(null)
    setPublishing(true)
    void publishProductionProperty(show.id)
      .then((experience) => navigate(`/public/${experience.publicToken}`))
      .catch((error) => setPublishError(error instanceof Error ? error.message : 'Could not publish this experience.'))
      .finally(() => setPublishing(false))
  }

  if (loading) {
    return (
      <WorkspaceShell breadcrumb="Properties" backTo="/shows">
        <div className="mx-auto max-w-[1360px] px-8 py-10">
          <SkeletonShowHeader />
        </div>
      </WorkspaceShell>
    )
  }

  if (error || !show) {
    return (
      <WorkspaceShell breadcrumb="Properties" backTo="/shows">
        <div className="flex h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-[15px] text-text-secondary">{error || 'Property not found.'}</p>
          <Link to="/shows" className="text-[14px] font-semibold text-primary underline">
            Back to properties
          </Link>
        </div>
      </WorkspaceShell>
    )
  }

  const currentHeroImg = isDemoProperty ? demoLiving : (showBanner(show.title) || propHeroWaterfront)

  // Stage-aware text helpers for demo property
  const demoStatusLabel =
    demoStage <= 1 ? 'Collecting listing data' :
    demoStage === 2 ? 'Building experience' :
    demoStage === 3 ? 'Capture required' :
    demoStage === 4 ? 'Resuming build' :
    demoStage >= 5 ? 'Ready for review' : 'Preparing experience'

  const statusLabel = isDemoProperty ? demoStatusLabel : (tab === 'Experience' ? 'Ready for review' : 'Preparing experience')
  const statusDot = isDemoProperty && demoStage === 3 ? 'bg-amber-400' : 'bg-success'

  return (
    <WorkspaceShell
      breadcrumb={
        <div className="flex items-center gap-2 text-[14px] text-text-secondary">
          <Link to="/shows" className="hover:text-text-primary">Properties</Link>
          <span>&gt;</span>
          <span className="font-semibold text-text-primary">{show.title}</span>
          {tab !== 'Overview' && (
            <>
              <span>&gt;</span>
              <span className="font-semibold text-text-primary">{tab}</span>
            </>
          )}
        </div>
      }
      backTo="/shows"
    >
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-12 py-8 lg:py-10">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[32px] lg:text-[36px] font-extrabold tracking-tight text-text-primary leading-none">
                {show.title}
              </h1>
              <button
                onClick={() => navigator.clipboard?.writeText?.(show.id)}
                className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
                title="Copy Property ID"
              >
                <CopyIcon size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 pt-2 text-[14px] text-text-secondary">
              <span>{show.premise || '3-bedroom apartment · Lekki, Lagos'}</span>
              <span>·</span>
              <span className="font-mono text-[13px]">OH-00241</span>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                <span className="text-text-primary font-medium">{statusLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/experience/${show.id}/published`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-[14px] font-semibold text-text-primary shadow-subtle hover:bg-surface-elevated transition-colors"
            >
              <span>{tab === 'Experience' ? 'Preview as visitor ↗' : 'Preview media ↗'}</span>
            </Link>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary shadow-subtle">
              <Ellipsis size={18} />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-border mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-[14.5px] font-semibold transition-colors ${
                tab === t ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {!isDemoMode && analysisJob && analysisJob.status !== 'completed' && <section className={`mb-6 rounded-xl border p-4 ${analysisJob.status === 'failed' ? 'border-accent/30 bg-accent-soft/40' : 'border-primary/20 bg-primary/5'}`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[12px] font-bold text-ink">Evidence analysis · {analysisJob.progress_phase.replace(/_/g, ' ')}</p><p className="mt-1 text-[11px] leading-relaxed text-ink-2">{analysisJob.progress_message || (analysisJob.status === 'failed' ? analysisJob.error_message : 'OpenHouse is processing the property evidence.')}</p></div>{analysisJob.status === 'failed' && analysisJob.attempt_count < analysisJob.max_attempts && <button type="button" disabled={retryingAnalysis} onClick={retryAnalysis} className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-bold text-white disabled:opacity-60">{retryingAnalysis ? 'Retrying…' : `Retry analysis (${analysisJob.attempt_count}/${analysisJob.max_attempts})`}</button>}</div></section>}

        {/* TAB 1: OVERVIEW */}
        {tab === 'Overview' && (
          <div className="space-y-10">
            {/* Top 3-Part Hero Card */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.1fr] overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle">
              {/* Photo Left */}
              <div className="relative aspect-[16/10] lg:aspect-auto lg:h-[320px] overflow-hidden bg-sidebar">
                <img src={currentHeroImg} alt={show.title} className="h-full w-full object-cover" />
              </div>

              {/* Center Status Card — stage-aware for demo */}
              <div className="flex flex-col justify-between p-6 border-b lg:border-b-0 lg:border-r border-border bg-surface">
                <div>
                  {/* Stage 3: capture warning */}
                  {isDemoProperty && demoStage === 3 ? (
                    <>
                      <div className="flex items-center gap-1.5 pb-2">
                        <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-amber-500">
                          ACTION REQUIRED
                        </span>
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>
                      <h2 className="text-[20px] font-bold text-text-primary leading-snug">
                        Balcony capture missing
                      </h2>
                      <p className="pt-2 text-[13.5px] text-text-secondary leading-relaxed">
                        Gemini detected a missing connection angle on the Balcony Terrace. A recapture guide has been sent to your agent.
                      </p>
                    </>
                  ) : isDemoProperty && demoStage === 4 ? (
                    <>
                      <div className="flex items-center gap-1.5 pb-2">
                        <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-success">
                          RECAPTURE RECEIVED
                        </span>
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      </div>
                      <h2 className="text-[20px] font-bold text-text-primary leading-snug">
                        Resuming build
                      </h2>
                      <p className="pt-2 text-[13.5px] text-text-secondary leading-relaxed">
                        Balcony footage received and verified. OpenHouse is now connecting the spaces and completing the experience.
                      </p>
                    </>
                  ) : isDemoProperty && demoStage >= 5 ? (
                    <>
                      <div className="flex items-center gap-1.5 pb-2">
                        <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-success">
                          BUILD COMPLETE
                        </span>
                        <span className="h-2 w-2 rounded-full bg-success" />
                      </div>
                      <h2 className="text-[20px] font-bold text-text-primary leading-snug">
                        Ready for your approval
                      </h2>
                      <p className="pt-2 text-[13.5px] text-text-secondary leading-relaxed">
                        All 7 spaces captured and verified. The 3D experience is complete and awaiting your review before publishing.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 pb-2">
                        <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-success">
                          OPENHOUSE IS WORKING
                        </span>
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      </div>
                      <h2 className="text-[20px] font-bold text-text-primary leading-snug">
                        Building the property experience
                      </h2>
                      <p className="pt-2 text-[13.5px] text-text-secondary leading-relaxed">
                        {isDemoProperty
                          ? 'Collecting and processing all spaces for 72691 Homestead Road. Estimated 18–25 minutes.'
                          : 'The additional balcony capture passed its quality check. OpenHouse is now preparing the connected experience.'}
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  {isDemoProperty && demoStage >= 5 ? (
                    <a
                      href="/#/approvals"
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse hover:bg-primary-hover transition-colors"
                    >
                      Go to Approvals
                    </a>
                  ) : (
                    <>
                      <p className="text-[13px] text-text-secondary">
                        <span className="font-semibold text-text-primary">18–25 minutes</span> Estimated completion
                      </p>
                      <button
                        onClick={() => setTab('Activity')}
                        className="mt-3 inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-[13.5px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
                      >
                        View activity
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Milestone Stepper — stage-aware */}
              <div className="p-6 flex flex-col justify-center bg-surface-elevated/40 text-[13.5px]">
                <div className="space-y-3.5">
                  {[
                    { label: 'Listing collected', done: true },
                    { label: 'Spaces identified', done: demoStage >= 2 || !isDemoProperty },
                    { label: 'Balcony capture requested', done: demoStage >= 3 || !isDemoProperty },
                    { label: 'New footage received', done: demoStage >= 4 || !isDemoProperty },
                    { label: 'Building interactive experience', done: demoStage >= 5 || !isDemoProperty, active: isDemoProperty && (demoStage === 2 || demoStage === 4) },
                    { label: 'Checking the finished experience', done: demoStage >= 5 || !isDemoProperty },
                    { label: 'Ready for your approval', done: demoStage >= 5 || !isDemoProperty },
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-2.5 ${step.done ? 'text-text-secondary' : step.active ? 'font-bold text-text-primary' : 'text-text-secondary/50'}`}>
                      {step.done ? (
                        <CheckCircle size={16} className="text-success shrink-0" />
                      ) : step.active ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-text-inverse text-[10px] shrink-0">→</span>
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-border shrink-0" />
                      )}
                      <span>{step.label}</span>
                      {step.active && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Col 1: Reconstruction Status */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-text-primary mb-4">Reconstruction status</h3>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-sidebar relative border border-border">
                    <img
                      src={isDemoProperty ? demoKitchen : propKitchen}
                      alt="Reconstruction wireframe"
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[12px] font-semibold text-white">
                          Connecting living room to balcony
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[12.5px] text-text-secondary mt-3">Reconstruction underway</p>
              </div>

              {/* Col 2: Property Evidence */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-[15px] font-bold text-text-primary whitespace-nowrap">Property evidence</h3>
                  <div className="flex items-center gap-2.5 text-[11.5px] font-mono text-text-secondary whitespace-nowrap">
                    <span><strong className="text-text-primary font-sans">7</strong> Exp</span>
                    <span><strong className="text-text-primary font-sans">7</strong> Cap</span>
                    <span><strong className="text-text-primary font-sans">1</strong> Res</span>
                  </div>
                </div>

                <div className="divide-y divide-border/60 text-[13px]">
                  {roomList.slice(0, 5).map((room) => (
                    <div key={room.id} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="font-medium text-text-primary truncate">{room.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded px-2 py-0.5 text-[11.5px] font-semibold bg-success/15 text-success whitespace-nowrap">
                          ✓ Captured
                        </span>
                        <span className="text-[11.5px] text-text-secondary whitespace-nowrap">Phone capture</span>
                      </div>
                    </div>
                  ))}
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-medium text-text-primary truncate">Balcony</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded px-2 py-0.5 text-[11.5px] font-semibold bg-success/15 text-success whitespace-nowrap">
                        ✓ Recaptured
                      </span>
                      <span className="text-[11.5px] text-text-secondary whitespace-nowrap">Recapture verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Recent Activity */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-text-primary mb-4">Recent activity</h3>
                  <div className="space-y-4 text-[13px]">
                    <div className="flex gap-3">
                      <span className="text-text-secondary font-mono text-[12px] shrink-0">14:02</span>
                      <div>
                        <p className="font-medium text-text-primary">Additional balcony footage received</p>
                        <p className="text-[12px] text-text-secondary">New media uploaded</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-text-secondary font-mono text-[12px] shrink-0">14:03</span>
                      <div>
                        <p className="font-medium text-text-primary">Capture quality passed</p>
                        <p className="text-[12px] text-text-secondary">All footage verified</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-text-secondary font-mono text-[12px] shrink-0">14:04</span>
                      <div>
                        <p className="font-medium text-text-primary">Reconstruction resumed</p>
                        <p className="text-[12px] text-text-secondary">Building connected experience</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-text-secondary font-mono text-[12px] shrink-0">14:08</span>
                      <div>
                        <p className="font-medium text-text-primary">Living room and balcony connected</p>
                        <p className="text-[12px] text-text-secondary">Spatial connection established</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setTab('Activity')}
                  className="mt-4 w-full rounded-lg border border-border bg-surface py-2 text-[13px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  View all activity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCE (3D Review Mode) */}
        {tab === 'Experience' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
              {/* Left Column: Interactive 3D Viewer */}
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-sidebar border border-border shadow-card">
                  <img
                    src={roomList.find(r => r.id === activeRoom)?.img || currentHeroImg}
                    alt={activeRoom}
                    className="h-full w-full object-cover"
                  />
                  {/* Top-Left HUD Badge */}
                  <div className="absolute top-4 left-4 rounded-md bg-black/65 backdrop-blur-md px-3 py-1.5 text-white border border-white/10 text-[11px] font-bold tracking-wider uppercase">
                    {roomList.find(r => r.id === activeRoom)?.name} / 01
                  </div>

                  {/* Bottom-Left Room HUD Overlay */}
                  <div className="absolute bottom-4 left-4 right-20 sm:right-auto rounded-xl bg-black/65 backdrop-blur-md p-4 text-white border border-white/10 max-w-sm">
                    <p className="text-[16px] font-bold leading-tight">{roomList.find(r => r.id === activeRoom)?.name}</p>
                    <p className="text-[12.5px] text-white/80 mt-1 leading-snug">
                      Connected to the entrance hall, kitchen and balcony.
                    </p>
                  </div>

                  {/* Bottom-Right 3D Controls */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button className="rounded-lg bg-black/65 backdrop-blur-md px-3 py-1.5 text-[12px] font-semibold text-white border border-white/10 hover:bg-black/80">
                      ⊞ Rooms
                    </button>
                    <button className="rounded-lg bg-black/65 backdrop-blur-md px-3 py-1.5 text-[12px] font-semibold text-white border border-white/10 hover:bg-black/80">
                      📍 Map
                    </button>
                    <button className="rounded-lg bg-black/65 backdrop-blur-md px-3 py-1.5 text-[12px] font-semibold text-white border border-white/10 hover:bg-black/80">
                      ⛶ Full screen
                    </button>
                  </div>
                </div>

                {/* Room Selector Strip Carousel */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {roomList.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-1.5 shrink-0 transition-all ${
                        activeRoom === room.id
                          ? 'border-primary bg-primary/5 shadow-subtle'
                          : 'border-border bg-surface hover:bg-surface-elevated'
                      }`}
                    >
                      <img src={room.img} alt={room.name} className="h-16 w-24 rounded-lg object-cover" />
                      <span className="text-[12px] font-semibold text-text-primary">{room.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: QA & Evidence Panel */}
              <div className="space-y-6">
                {/* Ready to Publish Checklist */}
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                  <h3 className="text-[16px] font-bold text-text-primary mb-3">Ready to publish</h3>
                  <div className="space-y-2.5 text-[13.5px] text-text-secondary">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-success" />
                      <span>6 of 6 advertised rooms represented</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-success" />
                      <span>2 capture issues identified and resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-success" />
                      <span>No blocking inconsistencies detected</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Confidence Bars */}
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                  <h3 className="text-[16px] font-bold text-text-primary mb-4">Evidence</h3>
                  <div className="space-y-4 text-[13.5px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">Room coverage</p>
                        <p className="text-[12px] text-text-secondary">7 captured spaces</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-success">Verified</span>
                        <span className="text-success font-mono font-bold text-[14px]">|||</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">Balcony connection</p>
                        <p className="text-[12px] text-text-secondary">Original video + requested recapture</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-success">Verified</span>
                        <span className="text-success font-mono font-bold text-[14px]">|||</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">Living-room dimensions</p>
                        <p className="text-[12px] text-text-secondary">Supplied floor plan</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-success">Verified</span>
                        <span className="text-success font-mono font-bold text-[14px]">|||</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between opacity-70">
                      <div>
                        <p className="font-semibold text-text-primary">Bedroom 3 dimensions</p>
                        <p className="text-[12px] text-text-secondary">No scale evidence supplied</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-text-secondary">Unavailable</span>
                        <span className="text-text-secondary font-mono font-bold text-[14px]">|</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolved Issues Accordion */}
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle">
                  <button
                    onClick={() => setIssuesOpen(!issuesOpen)}
                    className="flex w-full items-center justify-between text-[14px] font-bold text-text-primary"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span>2 issues resolved</span>
                    </div>
                    <span>{issuesOpen ? '▲' : '▼'}</span>
                  </button>
                  {issuesOpen && (
                    <div className="mt-3 space-y-2 text-[13px] text-text-secondary border-t border-border/60 pt-3">
                      <p>✓ Balcony doorway recaptured</p>
                      <p>✓ Floating visual artefact removed during quality review</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-card">
              <button className="rounded-lg border border-border bg-surface px-5 py-2.5 text-[14px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors">
                Request changes
              </button>

              <div className="flex items-center gap-4">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3.5 py-2 text-[13.5px] font-medium text-text-primary outline-none"
                >
                  <option>Visibility: Unlisted link</option>
                  <option>Visibility: Public</option>
                  <option>Visibility: Password protected</option>
                </select>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="rounded-lg bg-primary px-6 py-2.5 text-[14px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors"
                >
                  {publishing ? 'Publishing…' : 'Approve and publish'}
                </button>
              </div>
            </div>
            {publishError && <p className="text-sm text-accent" role="alert">{publishError}</p>}
          </div>
        )}

        {/* TAB 3: EVIDENCE */}
        {tab === 'Evidence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roomList.map((room) => (
              <div key={room.id} className="rounded-2xl border border-border bg-surface overflow-hidden shadow-subtle">
                <img src={room.img} alt={room.name} className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-[16px] font-bold text-text-primary">{room.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-[12.5px]">
                    <span className="rounded px-2 py-0.5 font-semibold bg-success/15 text-success">Verified LiDAR</span>
                    <span className="text-text-secondary">4 capture files</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ACTIVITY */}
        {tab === 'Activity' && (
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-subtle">
            <h3 className="text-[18px] font-bold text-text-primary mb-6">OpenHouse Activity Log</h3>
            <div className="space-y-6 border-l-2 border-border pl-6 text-[14px]">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-success" />
                <p className="font-bold text-text-primary">Living room and balcony connected</p>
                <p className="text-[12.5px] text-text-secondary">Spatial synthesis complete · Today, 14:08</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-success" />
                <p className="font-bold text-text-primary">Capture quality passed</p>
                <p className="text-[12.5px] text-text-secondary">Balcony doorway verification · Today, 14:03</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-accent" />
                <p className="font-bold text-text-primary">Additional balcony footage received</p>
                <p className="text-[12.5px] text-text-secondary">Uploaded via secure mobile link · Today, 14:02</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-border" />
                <p className="font-bold text-text-primary">Capture request generated</p>
                <p className="text-[12.5px] text-text-secondary">Missing balcony connection flagged · Yesterday, 18:31</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  )
}

