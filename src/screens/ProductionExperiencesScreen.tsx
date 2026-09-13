import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Globe2, LockKeyhole, Search, Sparkles } from 'lucide-react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { useStore } from '../data/store'
import { getProductionWorkspaceDashboard, type ProductionDashboard } from '../lib/productionWorkflow'

const tabs = ['All', 'Preparing', 'Ready for review', 'Live'] as const
type Tab = (typeof tabs)[number]
type Dashboard = ProductionDashboard

function groupForStatus(status: string) {
  if (status === 'live') return 'Live'
  if (status === 'ready_for_review') return 'Ready for review'
  return 'Preparing'
}

export function ProductionExperiencesScreen() {
  const { workspace } = useStore()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('All')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!workspace?.id) { setLoading(false); return }
    let active = true
    getProductionWorkspaceDashboard(workspace.id)
      .then((result) => { if (active) setDashboard(result) })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load experiences.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [workspace?.id])

  const latestExperienceByProperty = useMemo(() => new Map((dashboard?.experiences ?? []).map((experience) => [experience.property_id, experience])), [dashboard])
  const visible = useMemo(() => (dashboard?.properties ?? []).filter((property) => {
    const group = groupForStatus(property.status)
    if (tab !== 'All' && group !== tab) return false
    const normalized = query.trim().toLowerCase()
    return !normalized || `${property.title} ${property.address}`.toLowerCase().includes(normalized)
  }), [dashboard, query, tab])

  return <WorkspaceShell><main className="min-h-full bg-canvas pb-12 text-ink"><div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 xl:px-12 lg:py-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">Experiences</h1><p className="mt-0.5 text-[14px] text-ink-2">Manage the property experiences visitors can open.</p></div><Link to="/add-property" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-subtle hover:bg-primary-hover"><Sparkles size={15} /> Create from property</Link></header>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-2 overflow-x-auto">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-full px-3.5 py-1 text-[13px] font-semibold ${tab === item ? 'bg-primary text-white' : 'border border-border bg-surface hover:bg-raised'}`}>{item}</button>)}</div><label className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-subtle focus-within:border-primary sm:w-[260px]"><Search size={15} className="text-ink-3" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-3" /></label></div>
    {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[12px] text-danger">{error}</p>}
    <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-subtle"><div className="min-w-[780px]"><div className="grid grid-cols-[1.6fr_1.8fr_1fr_130px] gap-4 border-b border-border bg-surface-elevated/50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-2"><div>Property</div><div>State</div><div>Visibility</div><div className="text-right">Action</div></div>{loading ? <div className="space-y-3 p-5 animate-pulse">{Array.from({ length: 3 }, (_, index) => <div key={index} className="grid grid-cols-[1.6fr_1.8fr_1fr_130px] gap-4"><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /></div>)}</div> : visible.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Sparkles size={20} /></span><h2 className="mt-3 text-[16px] font-bold">No experiences yet</h2><p className="mt-1 text-[12px] text-ink-2">Create a property, then verify its evidence to begin an experience.</p></div> : <div className="divide-y divide-border/60">{visible.map((property) => { const experience = latestExperienceByProperty.get(property.id); const isLive = property.status === 'live' && Boolean(experience?.public_token); const group = groupForStatus(property.status); return <article key={property.id} className="grid grid-cols-[1.6fr_1.8fr_1fr_130px] items-center gap-4 px-5 py-4"><div><Link to={`/properties/${property.id}`} className="text-[13.5px] font-bold hover:underline">{property.title}</Link><p className="mt-0.5 text-[11px] text-ink-2">{property.address}</p></div><div><p className="text-[13px] font-semibold">{isLive ? 'Live experience' : group === 'Ready for review' ? 'Ready for your review' : 'Preparing experience'}</p><p className="mt-0.5 text-[11px] text-ink-2">{isLive ? `Published version ${experience?.version}` : 'Evidence-driven workflow in progress'}</p></div><div><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-raised-2 px-2.5 py-1 text-[11px] font-medium text-ink-2">{isLive ? <Globe2 size={12} /> : <LockKeyhole size={12} />}{isLive ? 'Public' : 'Not published'}</span></div><div className="flex justify-end">{isLive ? <Link to={`/public/${experience?.public_token}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold hover:bg-raised">Open <ExternalLink size={13} /></Link> : <Link to={`/properties/${property.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white hover:bg-primary-hover">Open</Link>}</div></article> })}</div>}</div></section>
  </div></main></WorkspaceShell>
}

