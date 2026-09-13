import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, ClipboardCopy, ExternalLink, Search } from 'lucide-react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { useStore } from '../data/store'
import { getProductionWorkspaceDashboard, type ProductionDashboard } from '../lib/productionWorkflow'

const tabs = ['Open', 'Awaiting capture', 'Received', 'Checking', 'Resolved'] as const
type Tab = (typeof tabs)[number]
type Capture = ProductionDashboard['captures'][number]

function displayStatus(status: string) {
  if (status === 'awaiting_capture') return { label: 'Awaiting capture', tone: 'bg-accent/10 text-accent', dot: 'bg-accent' }
  if (status === 'uploaded_pending_verification' || status === 'received') return { label: 'Footage received', tone: 'bg-info/10 text-info', dot: 'bg-info' }
  if (status === 'checking') return { label: 'Checking evidence', tone: 'bg-primary/10 text-primary', dot: 'bg-primary' }
  if (status === 'resolved') return { label: 'Resolved', tone: 'bg-success/10 text-success', dot: 'bg-success' }
  if (status === 'failed') return { label: 'Needs review', tone: 'bg-danger/10 text-danger', dot: 'bg-danger' }
  return { label: 'Open', tone: 'bg-raised-2 text-ink-2', dot: 'bg-ink-3' }
}

function updatedAt(timestamp: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return `${Math.floor(minutes / 1440)}d ago`
}

export function ProductionCaptureRequestsScreen() {
  const { workspace } = useStore()
  const [captures, setCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('Open')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!workspace?.id) { setLoading(false); return }
    let active = true
    setLoading(true)
    getProductionWorkspaceDashboard(workspace.id)
      .then((dashboard) => { if (active) setCaptures(dashboard.captures) })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load capture requests.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [workspace?.id])

  const visible = useMemo(() => captures.filter((capture) => {
    const normalized = query.trim().toLowerCase()
    if (normalized && !`${capture.property_title} ${capture.room} ${capture.reason}`.toLowerCase().includes(normalized)) return false
    if (tab === 'Open') return capture.status !== 'resolved'
    if (tab === 'Awaiting capture') return capture.status === 'awaiting_capture'
    if (tab === 'Received') return capture.status === 'uploaded_pending_verification' || capture.status === 'received'
    if (tab === 'Checking') return capture.status === 'checking'
    return capture.status === 'resolved'
  }), [captures, query, tab])

  const copyCaptureLink = async (capture: Capture) => {
    const url = new URL(`/#${capture.capture_url}`, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(capture.id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch {
      setError('Could not copy the capture link. You can open it instead.')
    }
  }

  const awaiting = captures.filter((capture) => capture.status === 'awaiting_capture').length
  const received = captures.filter((capture) => capture.status === 'uploaded_pending_verification' || capture.status === 'received').length

  return <WorkspaceShell><main className="min-h-full bg-canvas pb-12 text-ink"><div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 xl:px-12 lg:py-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-[28px] font-extrabold tracking-tight text-text-primary sm:text-[32px]">Capture requests</h1><p className="mt-0.5 text-[14px] text-text-secondary">Track missing property evidence and submitted footage.</p></div><label className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] shadow-subtle focus-within:border-primary sm:w-[300px]"><Search size={15} className="shrink-0 text-text-secondary" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search properties..." className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary/70" /></label></header>
    <p className="text-[13px] text-text-secondary"><strong className="text-text-primary">{awaiting}</strong> awaiting capture · <strong className="text-text-primary">{received}</strong> footage received</p>
    <div className="flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-full px-3.5 py-1 text-[13px] font-semibold ${tab === item ? 'bg-primary text-text-inverse shadow-subtle' : 'border border-border bg-surface text-text-primary hover:bg-surface-elevated'}`}>{item}</button>)}</div>
    {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[12px] text-danger">{error}</p>}
    <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-subtle"><div className="min-w-[830px]"><div className="grid grid-cols-[1.65fr_1.7fr_1.15fr_1.2fr_112px] gap-4 border-b border-border bg-surface-elevated/50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-text-secondary"><div>Property</div><div>Capture needed</div><div>Recipient</div><div>Status</div><div className="text-right">Action</div></div>{loading ? <div className="space-y-3 p-5 animate-pulse">{Array.from({ length: 3 }, (_, index) => <div key={index} className="grid grid-cols-[1.65fr_1.7fr_1.15fr_1.2fr_112px] gap-4"><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /><span className="h-9 rounded bg-raised-2" /></div>)}</div> : visible.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Camera size={20} /></span><h2 className="mt-3 text-[15px] font-bold">No capture requests here</h2><p className="mt-1 text-[12px] text-ink-2">OpenHouse only creates a request when the evidence audit finds a specific missing space.</p></div> : <div className="divide-y divide-border/60">{visible.map((capture) => { const status = displayStatus(capture.status); return <div key={capture.id} className="grid grid-cols-[1.65fr_1.7fr_1.15fr_1.2fr_112px] items-center gap-4 px-5 py-3.5"><div><Link to={`/properties/${capture.property_id}`} className="text-[13.5px] font-bold text-ink hover:underline">{capture.property_title}</Link><p className="mt-0.5 text-[11px] text-ink-2">Updated {updatedAt(capture.updated_at)}</p></div><div><p className="truncate text-[13px] font-medium">{capture.room}</p><p className="mt-0.5 truncate text-[11px] text-ink-2">{capture.reason}</p></div><div className="truncate text-[13px] text-ink-2">{capture.recipient_name || 'Property contact'}</div><div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span></div><div className="flex justify-end gap-1.5">{capture.status === 'awaiting_capture' && <button type="button" onClick={() => void copyCaptureLink(capture)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold hover:bg-raised" title="Copy capture link">{copiedId === capture.id ? 'Copied' : <ClipboardCopy size={13} />}</button>}<Link to={`/properties/${capture.property_id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold hover:bg-raised">View <ExternalLink size={13} /></Link></div></div> })}</div>}</div></section>
  </div></main></WorkspaceShell>
}
