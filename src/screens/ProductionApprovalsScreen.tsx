import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Search, ShieldCheck } from 'lucide-react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { useStore } from '../data/store'
import { getProductionWorkspaceDashboard, type ProductionDashboard } from '../lib/productionWorkflow'

const tabs = ['Ready', 'Needs review', 'Published'] as const
type Tab = (typeof tabs)[number]
type Property = ProductionDashboard['properties'][number]

function propertyState(property: Property) {
  if (property.status === 'live') return { label: 'Live', description: 'This experience has been published.', tone: 'text-success', dot: 'bg-success' }
  if (property.status === 'needs_human_review') return { label: 'Evidence review required', description: 'Some evidence was uncertain, so OpenHouse did not make an unsupported decision.', tone: 'text-accent', dot: 'bg-accent' }
  return { label: 'Ready for review', description: 'Every advertised space has accepted evidence and is ready for your decision.', tone: 'text-primary', dot: 'bg-primary' }
}

export function ProductionApprovalsScreen() {
  const { workspace } = useStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Ready')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!workspace?.id) { setLoading(false); return }
    let active = true
    getProductionWorkspaceDashboard(workspace.id)
      .then((dashboard) => { if (active) setProperties(dashboard.properties) })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load approvals.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [workspace?.id])

  const visible = useMemo(() => properties.filter((property) => {
    if (tab === 'Ready' && property.status !== 'ready_for_review') return false
    if (tab === 'Needs review' && property.status !== 'needs_human_review') return false
    if (tab === 'Published' && property.status !== 'live') return false
    const normalized = query.trim().toLowerCase()
    return !normalized || `${property.title} ${property.address}`.toLowerCase().includes(normalized)
  }), [properties, query, tab])

  return <WorkspaceShell><main className="min-h-full bg-canvas pb-12 text-ink"><div className="mx-auto max-w-[1360px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 xl:px-12 lg:py-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">Approvals</h1><p className="mt-1 text-[14px] text-ink-2">Review completed evidence before an experience goes live.</p></div><label className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 shadow-subtle focus-within:border-primary sm:w-[300px]"><Search size={15} className="text-ink-3" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search properties..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-3" /></label></header>
    <div className="flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-4 py-2 text-[13px] font-semibold ${tab === item ? 'bg-sidebar text-white' : 'border border-border bg-surface hover:bg-raised'}`}>{item}</button>)}</div>
    {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[12px] text-danger">{error}</p>}
    {loading ? <section className="space-y-3 animate-pulse">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 rounded-2xl border border-border bg-surface" />)}</section> : visible.length === 0 ? <section className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center shadow-subtle"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldCheck size={22} /></span><h2 className="mt-4 text-[17px] font-bold">Nothing awaiting this decision</h2><p className="mx-auto mt-1 max-w-[430px] text-[12px] leading-relaxed text-ink-2">Properties appear here only after their evidence has been assessed. A human-review item stays here until you resolve its uncertain evidence.</p></section> : <section className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle">{visible.map((property) => { const state = propertyState(property); return <article key={property.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3.5"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${state.dot}`} /><div className="min-w-0"><Link to={`/properties/${property.id}`} className="text-[15px] font-bold hover:underline">{property.title}</Link><p className="mt-0.5 text-[12px] text-ink-2">{property.address} · {property.bedrooms || '—'} bed · {property.bathrooms || '—'} bath</p><p className={`mt-2 flex items-center gap-1.5 text-[12px] font-semibold ${state.tone}`}>{property.status === 'needs_human_review' ? <CircleAlert size={14} /> : <CheckCircle2 size={14} />}{state.label}</p><p className="mt-1 text-[11px] leading-relaxed text-ink-2">{state.description}</p></div></div><Link to={`/properties/${property.id}`} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-subtle hover:bg-primary-hover">{property.status === 'live' ? 'Open property' : 'Review property'} →</Link></article> })}</section>}
  </div></main></WorkspaceShell>
}

