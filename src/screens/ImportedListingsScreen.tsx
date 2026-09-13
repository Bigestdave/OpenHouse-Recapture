import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, ClipboardCheck, Link2, Search } from 'lucide-react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { useStore } from '../data/store'
import { listImportedListings, type ImportedListingRecord, updateImportedListingStatus } from '../lib/productionWorkflow'
import { isDemoMode } from '../lib/runtime'

const tabs = ['Inbox', 'In review', 'Added', 'Ignored'] as const
type Tab = (typeof tabs)[number]

function matchesTab(listing: ImportedListingRecord, tab: Tab) {
  if (tab === 'Inbox') return listing.status === 'new' || listing.status === 'incomplete' || listing.status === 'failed'
  if (tab === 'In review') return listing.status === 'in_review'
  if (tab === 'Added') return listing.status === 'added'
  return listing.status === 'ignored'
}

function statusStyle(status: ImportedListingRecord['status']) {
  if (status === 'new') return 'bg-primary/10 text-primary'
  if (status === 'in_review') return 'bg-info/10 text-info'
  if (status === 'incomplete' || status === 'failed') return 'bg-accent-soft text-accent'
  if (status === 'added') return 'bg-success/10 text-success'
  return 'bg-raised-2 text-ink-2'
}

export function ImportedListingsScreen() {
  const { workspace } = useStore()
  const [items, setItems] = useState<ImportedListingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Inbox')
  const [query, setQuery] = useState('')

  const load = () => {
    if (isDemoMode || !workspace?.id) { setLoading(false); return }
    setLoading(true)
    listImportedListings(workspace.id).then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load imported listings.')).finally(() => setLoading(false))
  }

  useEffect(load, [workspace?.id])

  const counts = useMemo(() => ({
    New: items.filter((item) => item.status === 'new').length,
    'In review': items.filter((item) => item.status === 'in_review').length,
    Incomplete: items.filter((item) => item.status === 'incomplete' || item.status === 'failed').length,
    Ignored: items.filter((item) => item.status === 'ignored').length,
  }), [items])
  const visible = useMemo(() => items.filter((item) => matchesTab(item, tab) && (!query.trim() || `${item.title ?? ''} ${item.address ?? ''} ${item.source_reference ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))), [items, query, tab])

  const updateStatus = async (listing: ImportedListingRecord, status: 'in_review' | 'ignored' | 'new') => {
    try {
      await updateImportedListingStatus(listing.id, status)
      load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update the listing.') }
  }

  return <WorkspaceShell><main className="min-h-full bg-canvas pb-12 text-ink"><div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10">
    <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold text-ink-2">Properties <span className="mx-1.5 text-ink-3">›</span> Imported Listings</p><h1 className="mt-4 flex items-center gap-2 text-[32px] font-extrabold tracking-[-0.04em]">Imported Listings <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-accent">BETA</span></h1><p className="mt-1.5 text-[12px] text-ink-2">Review imported details before you add a property to OpenHouse.</p></div><Link to="/settings/listing-sources" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-[11px] font-bold shadow-subtle hover:bg-raised"><Link2 size={14} /> Listing Sources</Link></header>
    <section className="mt-7 grid overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle sm:grid-cols-4">{Object.entries(counts).map(([label, count], index) => <div key={label} className={`flex items-center gap-3 px-5 py-4 ${index ? 'border-t border-border sm:border-l sm:border-t-0' : ''}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${label === 'Incomplete' ? 'bg-accent-soft text-accent' : label === 'Ignored' ? 'bg-raised-2 text-ink-2' : 'bg-primary/10 text-primary'}`}>{count}</span><span><span className="block text-[11px] font-bold">{label}</span><span className="block text-[10px] text-ink-2">listings</span></span></div>)}</section>
    <section className="mt-7 flex flex-wrap items-center gap-3 border-b border-border pb-3">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`px-2 pb-3 text-[11px] font-semibold ${tab === item ? 'border-b-2 border-primary text-primary' : 'text-ink-2'}`}>{item}</button>)}<label className="relative ml-auto w-full sm:w-[290px]"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search imported listings" className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-ink-3 focus:border-primary" /></label></section>
    {error && <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[12px] text-danger">{error}</p>}
    {loading ? <section className="mt-5 space-y-3 animate-pulse">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 rounded-2xl border border-border bg-surface" />)}</section> : visible.length === 0 ? <section className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center shadow-subtle"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><ClipboardCheck size={20} /></span><h2 className="mt-4 text-[17px] font-bold">No imported listings yet</h2><p className="mx-auto mt-1 max-w-[430px] text-[12px] leading-relaxed text-ink-2">Import a listing URL or CSV from Add Property, or connect an approved source. Nothing becomes a property automatically.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link to="/add-property?source=import" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold text-text-inverse hover:bg-primary-hover">Import listing <ArrowRight size={14} /></Link><Link to="/add-property" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-[11px] font-bold hover:bg-raised">Add manually</Link></div></section> : <section className="mt-5 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle">{visible.map((listing) => <article key={listing.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-bold">{listing.title || 'Untitled listing'}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle(listing.status)}`}>{listing.status.replace('_', ' ')}</span></div><p className="mt-1 text-[12px] text-ink-2">{listing.address || 'Address is missing'}{listing.price ? ` · ${listing.price}` : ''}{listing.bedrooms != null ? ` · ${listing.bedrooms} bed` : ''}{listing.bathrooms != null ? ` · ${listing.bathrooms} bath` : ''}</p><p className="mt-2 text-[10.5px] text-ink-3">{listing.import_kind === 'csv' ? 'CSV import' : listing.import_kind === 'url' ? 'Listing URL import' : 'Connected source'}{listing.source_reference ? ` · ${listing.source_reference}` : ''}</p></div><div className="flex flex-wrap gap-2">{(listing.status === 'new' || listing.status === 'in_review' || listing.status === 'incomplete') && <Link to={`/add-property?importId=${listing.id}`} onClick={() => { if (listing.status === 'new') void updateStatus(listing, 'in_review') }} className="rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold text-white hover:bg-primary-hover">Review & add →</Link>}{listing.status !== 'added' && listing.status !== 'ignored' && <button type="button" onClick={() => void updateStatus(listing, 'ignored')} className="rounded-lg border border-border px-4 py-2.5 text-[11px] font-bold hover:bg-raised">Ignore</button>}{listing.status === 'ignored' && <button type="button" onClick={() => void updateStatus(listing, 'new')} className="rounded-lg border border-border px-4 py-2.5 text-[11px] font-bold hover:bg-raised">Return to inbox</button>}{listing.status === 'added' && <span className="rounded-lg bg-success/10 px-4 py-2.5 text-[11px] font-bold text-success">Added to property</span>}</div></article>)}</section>}
    <aside className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-[11px] leading-relaxed text-ink-2"><CircleAlert size={16} className="mt-0.5 shrink-0 text-primary" /><p><span className="font-bold text-ink">Review first.</span> Choose Review & add to prefill the same Add Property form. Attach private listing media, correct any imported fields, then explicitly create and analyze the property.</p></aside>
  </div></main></WorkspaceShell>
}

