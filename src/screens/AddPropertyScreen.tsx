import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Circle, FileText, ImagePlus, Link2, LoaderCircle, LockKeyhole, MapPin, PencilLine, Plus, Sparkles, UploadCloud, Video } from 'lucide-react'
import { OpenHouseLogoMark } from '../components/WorkspaceShell'
import { addProperty, useStore } from '../data/store'
import { startPropertyWorkflow } from '../data/workflow'
import type { Space } from '../data/types'
import { isDemoMode } from '../lib/runtime'
import { createImportedListings, createProductionProperty, getImportedListing, markImportedListingAdded, previewListingUrl } from '../lib/productionWorkflow'
import { parseListingCsv } from '../lib/listingImport'

const PROPERTY_TYPES = ['For sale', 'For rent', 'Short-let', 'Commercial', 'Land']
type SourceMode = 'manual' | 'import' | 'connected'
type DraftSpace = { name: string; captured: boolean }

function fieldClass(extra = '') {
  return `w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-3 hover:border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/10 ${extra}`
}

function SectionTitle({ number, title, detail, action }: { number: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-text-inverse">{number}</span><h2 className="text-[16px] font-bold tracking-tight text-ink">{title}</h2>{detail && <p className="text-[12px] text-ink-2">{detail}</p>}</div>{action}</div>
}

function SourceCard({ active, icon, title, detail, onClick }: { active: boolean; icon: ReactNode; title: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`relative flex min-w-0 flex-1 items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-all ${active ? 'border-primary bg-surface shadow-subtle ring-1 ring-primary/20' : 'border-border bg-surface/60 hover:border-line-strong hover:bg-surface'}`} aria-pressed={active}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? 'bg-primary/10 text-primary' : 'bg-raised-2 text-ink-2'}`}>{icon}</span><span className="min-w-0"><span className="block text-[13px] font-bold text-ink">{title}</span><span className="mt-0.5 block truncate text-[12px] text-ink-2">{detail}</span></span><span className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary text-white' : 'border-border bg-surface'}`}>{active && <Check size={12} strokeWidth={3} />}</span></button>
}

function CompletionRow({ icon, title, detail, complete }: { icon: ReactNode; title: string; detail: string; complete: boolean }) {
  return <div className="flex items-center gap-2.5 py-2.5"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-primary/10 text-primary' : 'bg-raised-2 text-ink-2'}`}>{icon}</span><span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-ink">{title}</span><span className="block text-[11px] text-ink-2">{detail}</span></span>{complete ? <CheckCircle2 size={16} className="shrink-0 text-primary" /> : <Circle size={16} className="shrink-0 text-ink-3" />}</div>
}

export function AddPropertyScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { workspace } = useStore()
  const [sourceMode, setSourceMode] = useState<SourceMode>(() => searchParams.get('source') === 'import' ? 'import' : searchParams.get('source') === 'connected' ? 'connected' : 'manual')
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState(PROPERTY_TYPES[0])
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [listingReference, setListingReference] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [spaces, setSpaces] = useState<DraftSpace[]>([])
  const [newSpace, setNewSpace] = useState('')
  const [sourceFiles, setSourceFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [draftNote, setDraftNote] = useState<string | null>(null)
  const [importUrl, setImportUrl] = useState('')
  const [importListingId, setImportListingId] = useState<string | null>(() => searchParams.get('importId'))
  const [isImporting, setIsImporting] = useState(false)

  const mediaSummary = useMemo(() => ({
    photos: sourceFiles.filter((file) => file.type.startsWith('image/')).length,
    videos: sourceFiles.filter((file) => file.type.startsWith('video/')).length,
    floorPlans: sourceFiles.filter((file) => file.type === 'application/pdf').length,
  }), [sourceFiles])

  useEffect(() => {
    if (!draftNote) return
    const timeout = window.setTimeout(() => setDraftNote(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [draftNote])

  const applyImportedListing = (listing: Record<string, unknown>) => {
    setTitle(String(listing.title ?? ''))
    setAddress(String(listing.address ?? ''))
    setPrice(String(listing.price ?? ''))
    setType(String(listing.property_type ?? listing.propertyType ?? PROPERTY_TYPES[0]))
    setBedrooms(listing.bedrooms == null ? '' : String(listing.bedrooms))
    setBathrooms(listing.bathrooms == null ? '' : String(listing.bathrooms))
    setDescription(String(listing.description ?? ''))
    setListingReference(String(listing.source_reference ?? listing.sourceReference ?? ''))
    const importedSpaces = Array.isArray(listing.spaces) ? listing.spaces.filter((space): space is string => typeof space === 'string').map((name) => ({ name, captured: false })) : []
    setSpaces(importedSpaces)
  }

  useEffect(() => {
    if (isDemoMode || !importListingId) return
    let active = true
    setIsImporting(true)
    getImportedListing(importListingId).then((listing) => {
      if (!active) return
      applyImportedListing(listing as unknown as Record<string, unknown>)
      setSourceMode('import')
      setDraftNote('Imported listing loaded. Review it and attach private property media before creating.')
    }).catch((error) => { if (active) setSubmitError(error instanceof Error ? error.message : 'Could not load the imported listing.') }).finally(() => { if (active) setIsImporting(false) })
    return () => { active = false }
  }, [importListingId])

  const canCreate = Boolean(title.trim() && address.trim() && type && (isDemoMode || sourceFiles.length > 0))

  const addFeature = () => {
    const feature = featureInput.trim()
    if (!feature || features.some((item) => item.toLowerCase() === feature.toLowerCase())) return
    setFeatures((current) => [...current, feature])
    setFeatureInput('')
  }
  const addSpace = () => {
    const space = newSpace.trim()
    if (!space || spaces.some((item) => item.name.toLowerCase() === space.toLowerCase())) return
    setSpaces((current) => [...current, { name: space, captured: false }])
    setNewSpace('')
  }
  const handleFiles = (files: File[]) => setSourceFiles((current) => {
    const existing = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`))
    return [...current, ...files.filter((file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`))]
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    if (!title.trim() || !address.trim()) return setSubmitError('Add the property title and address before creating the property.')
    if (!isDemoMode && sourceFiles.length === 0) return setSubmitError('Attach at least one property image, video, or floor plan before creating the property.')
    setIsSubmitting(true)
    const rooms = spaces.length ? spaces : [{ name: 'Property spaces', captured: false }]
    try {
      if (!isDemoMode) {
        if (!workspace?.id) throw new Error('Create a workspace before adding a property.')
        const created = await createProductionProperty({ workspaceId: workspace.id, title: title.trim(), address: address.trim(), price: price.trim() || 'Price on request', type, bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, description: description.trim(), rooms }, sourceFiles)
        if (importListingId) await markImportedListingAdded(importListingId, created.property.id).catch((error) => console.warn('Could not mark import as added:', error))
        navigate(`/properties/${created.property.id}`)
        return
      }
      const formattedSpaces: Space[] = rooms.map((space, index) => ({ id: `space-${Date.now()}-${index}`, name: space.name, captured: space.captured, verified: false, issues: [] }))
      const property = addProperty({ title: title.trim(), address: address.trim(), price: price.trim() || 'Price on request', type, bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, description: description.trim(), status: 'detected', spaces: formattedSpaces, sourceMedia: [], timeline: [], workspaceId: 'default' })
      startPropertyWorkflow(property.id)
      navigate(`/properties/${property.id}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Property intake failed. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  const importUrlListing = async () => {
    if (!importUrl.trim()) { setSubmitError('Paste a public listing URL first.'); return }
    if (isDemoMode) { setDraftNote('URL import is available in the production workspace.'); return }
    if (!workspace?.id) { setSubmitError('Create a workspace before importing a listing.'); return }
    setSubmitError(null); setIsImporting(true)
    try {
      const preview = await previewListingUrl(importUrl.trim())
      const result = await createImportedListings(workspace.id, 'url', [preview.listing])
      const listing = result.listings[0]
      if (!listing) throw new Error('The imported listing could not be saved.')
      setImportListingId(listing.id)
      applyImportedListing(listing as unknown as Record<string, unknown>)
      setDraftNote('Listing details imported. Review them and attach private property media before creating.')
    } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Could not import that listing.') } finally { setIsImporting(false) }
  }

  const importCsvListing = async (file: File | null) => {
    if (!file) return
    if (isDemoMode) { setDraftNote('CSV import is available in the production workspace.'); return }
    if (!workspace?.id) { setSubmitError('Create a workspace before importing a CSV.'); return }
    setSubmitError(null); setIsImporting(true)
    try {
      const listings = parseListingCsv(await file.text())
      if (!listings.length) throw new Error('No usable listings were found in that CSV.')
      await createImportedListings(workspace.id, 'csv', listings)
      navigate('/imported-listings')
    } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Could not import that CSV.') } finally { setIsImporting(false) }
  }

  return <div className="min-h-screen bg-canvas text-ink"><header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><div className="flex min-w-0 items-center gap-4"><Link to="/properties" className="flex shrink-0 items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar"><OpenHouseLogoMark className="h-4.5 w-4.5" /></span><span className="hidden text-[18px] font-extrabold tracking-tight sm:block">OpenHouse</span></Link><span className="hidden h-5 w-px bg-border sm:block" /><Link to="/properties" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 transition-colors hover:text-primary"><ArrowLeft size={15} /> Back to Properties</Link></div><div className="flex items-center gap-3">{draftNote ? <span className="hidden text-[12px] font-medium text-primary sm:block">{draftNote}</span> : <span className="hidden text-[12px] text-ink-2 sm:block">Draft not saved yet</span>}<button type="button" onClick={() => setDraftNote('Server-saved drafts are the next data-model addition.')} className="rounded-lg border border-border bg-surface px-4 py-2.5 text-[12px] font-bold text-ink shadow-subtle transition-colors hover:bg-raised">Save draft</button></div></div></header><form onSubmit={handleSubmit} className="property-intake min-h-full pb-24"><div className="mx-auto max-w-[1380px] px-5 pb-8 pt-8 sm:px-8 lg:px-10">
    <header className="mb-7"><h1 className="text-[32px] font-extrabold tracking-[-0.04em] text-ink sm:text-[36px]">Add Property</h1><p className="mt-2 max-w-[610px] text-[14px] leading-relaxed text-ink-2">Create a property and let OpenHouse analyze the listing and media to build its spatial experience.</p></header>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_275px]"><div className="min-w-0">
      <section><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-2">Start with</p><div className="grid gap-2.5 md:grid-cols-3"><SourceCard active={sourceMode === 'manual'} icon={<PencilLine size={17} />} title="Manual entry" detail="Enter details and upload media" onClick={() => setSourceMode('manual')} /><SourceCard active={sourceMode === 'import'} icon={<FileText size={17} />} title="Import listing" detail="Paste a URL or upload CSV" onClick={() => setSourceMode('import')} /><SourceCard active={sourceMode === 'connected'} icon={<Link2 size={17} />} title="From connected source" detail="Use a listing from your MLS / CRM" onClick={() => setSourceMode('connected')} /></div></section>
      {sourceMode === 'import' && <section className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-subtle"><div className="flex items-start justify-between gap-4"><div><h2 className="text-[13px] font-bold">Import a listing</h2><p className="mt-1 text-[11px] text-ink-2">URL and CSV import populate this same form for review. Nothing creates or publishes a property automatically.</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${importListingId ? 'bg-primary/10 text-primary' : 'bg-raised-2 text-ink-2'}`}>{importListingId ? 'Imported' : isImporting ? 'Importing' : 'Ready'}</span></div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={importUrl} onChange={(event) => setImportUrl(event.target.value)} placeholder="Paste a public listing URL" className={fieldClass('flex-1')} /><button type="button" disabled={isImporting} onClick={() => void importUrlListing()} className="rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold text-text-inverse transition-colors hover:bg-primary-hover disabled:opacity-60">{isImporting ? 'Importing…' : 'Import listing →'}</button></div><div className="mt-3 flex items-center gap-3 text-[11px] text-ink-2"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div><label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/5"><UploadCloud size={15} /> Upload CSV file<input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void importCsvListing(event.target.files?.[0] ?? null)} /></label><p className="mt-2 text-[10px] leading-relaxed text-ink-3">URL import reads only standard public listing metadata. You still attach the private media OpenHouse should analyze.</p></section>}
      {sourceMode === 'connected' && <section className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-subtle"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-raised-2 text-ink-2"><Link2 size={17} /></span><div className="min-w-0"><h2 className="text-[13px] font-bold">No listing source is connected yet</h2><p className="mt-1 text-[11px] leading-relaxed text-ink-2">Connect an approved MLS, RESO feed, or CRM in Listing Sources. Provider credentials remain server-side and imported listings always enter a review inbox.</p><Link to="/settings" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">Manage listing sources →</Link></div></div></section>}
      <section className="mt-6"><SectionTitle number="1" title="Property details" /><div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Property title <span className="text-accent">*</span></span><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. 8 Admiralty Way" className={fieldClass()} /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Address / Location <span className="text-accent">*</span></span><span className="relative block"><input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="e.g. Lekki Phase 1, Lagos" className={fieldClass('pr-9')} /><MapPin size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" /></span></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Listing type</span><span className="relative block"><select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass('appearance-none pr-9')}>{PROPERTY_TYPES.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" /></span></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Price</span><input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. ₦85,000,000" className={fieldClass()} /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Bedrooms</span><input inputMode="numeric" min="0" type="number" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} placeholder="e.g. 3" className={fieldClass()} /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Bathrooms</span><input inputMode="numeric" min="0" type="number" value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} placeholder="e.g. 4" className={fieldClass()} /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} placeholder="Describe the property highlights, layout, and amenities." className={fieldClass('resize-none leading-relaxed')} /><span className="mt-1 block text-right text-[10px] text-ink-3">{description.length}/500</span></label>
        <div><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Key features</span><div className="min-h-[116px] rounded-lg border border-border bg-surface p-2.5"><div className="flex flex-wrap gap-1.5">{features.map((feature) => <button type="button" key={feature} onClick={() => setFeatures((current) => current.filter((item) => item !== feature))} className="rounded-md bg-raised-2 px-2 py-1 text-[10px] font-medium text-ink-2 transition-colors hover:bg-accent-soft hover:text-accent">{feature} ×</button>)}</div><div className="mt-2 flex gap-2"><input value={featureInput} onChange={(event) => setFeatureInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addFeature() } }} placeholder="Pool, balcony, waterfront..." className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[11px] outline-none placeholder:text-ink-3" /><button type="button" onClick={addFeature} className="rounded-md border border-dashed border-line-strong px-2 py-1 text-[10px] font-bold text-ink-2 hover:border-primary hover:text-primary">Add</button></div></div></div>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Listing reference <span className="font-normal text-ink-3">(optional)</span></span><input value={listingReference} onChange={(event) => setListingReference(event.target.value)} placeholder="MLS#, reference, or internal ID" className={fieldClass()} /></label>
        <div className="grid grid-cols-2 gap-2.5"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Agent <span className="font-normal text-ink-3">(optional)</span></span><input value={agentName} onChange={(event) => setAgentName(event.target.value)} placeholder="Name" className={fieldClass()} /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-ink-2">Contact</span><input value={agentEmail} onChange={(event) => setAgentEmail(event.target.value)} placeholder="Email" className={fieldClass()} /></label></div>
      </div></section>
      <section className="mt-7"><SectionTitle number="2" title="Listing media" detail="Upload photos, walkthrough videos, and floor plans. Files are stored privately." /><div className="rounded-xl border border-border bg-surface p-3 shadow-subtle"><div className="flex flex-col gap-3 lg:flex-row"><label className="flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-canvas/40 px-5 text-center transition-colors hover:border-primary hover:bg-primary/5 lg:w-[230px]"><UploadCloud size={24} className="text-ink" /><span className="mt-2 text-[11px] font-bold text-ink">Drop files here or <span className="text-primary underline">browse</span></span><span className="mt-1 text-[9.5px] leading-relaxed text-ink-2">Photos · Videos · Floor plans<br />JPG, PNG, MP4, PDF up to 500MB</span><input className="sr-only" type="file" accept="image/*,video/*,application/pdf" multiple onChange={(event) => handleFiles(Array.from(event.target.files ?? []))} /></label><div className="min-w-0 flex-1">{sourceFiles.length === 0 ? <div className="flex h-[132px] items-center justify-center rounded-lg bg-canvas/50 px-6 text-center text-[11px] text-ink-2">Your uploaded listing media will appear here. Analysis begins only after you create the property.</div> : <div className="grid h-[132px] grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{sourceFiles.slice(0, 4).map((file) => <div key={`${file.name}-${file.lastModified}`} className="group relative min-w-0 overflow-hidden rounded-lg bg-sidebar p-3 text-text-inverse"><div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-sidebar" /><div className="relative flex h-full flex-col justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">{file.type.startsWith('video/') ? <Video size={15} /> : file.type === 'application/pdf' ? <FileText size={15} /> : <ImagePlus size={15} />}</span><div><p className="truncate text-[10px] font-bold">{file.name}</p><p className="mt-0.5 text-[9px] text-text-inverse-muted">{file.type.startsWith('video/') ? 'Walkthrough video' : file.type === 'application/pdf' ? 'Floor plan' : 'Listing photo'}</p></div></div><button type="button" onClick={() => setSourceFiles((current) => current.filter((item) => item !== file))} className="absolute right-2 top-2 rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100" aria-label={`Remove ${file.name}`}>×</button></div>)}</div>}{sourceFiles.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-ink-2"><span className="font-bold text-ink">{sourceFiles.length} files</span>{mediaSummary.photos > 0 && <span>{mediaSummary.photos} photos</span>}{mediaSummary.videos > 0 && <span>{mediaSummary.videos} walkthrough{mediaSummary.videos > 1 ? 's' : ''}</span>}{mediaSummary.floorPlans > 0 && <span>{mediaSummary.floorPlans} floor plan{mediaSummary.floorPlans > 1 ? 's' : ''}</span>}<button type="button" onClick={() => setSourceFiles([])} className="ml-auto font-bold text-primary hover:underline">Clear</button></div>}</div></div></div></section>
      <section className="mt-7"><SectionTitle number="3" title="Spaces & coverage" detail="List the spaces advertised for this property. OpenHouse verifies the evidence after creation." action={<button type="button" onClick={addSpace} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-bold text-ink shadow-subtle hover:bg-raised"><Plus size={13} /> Add space</button>} /><div className="rounded-xl border border-border bg-surface p-3 shadow-subtle"><div className="flex gap-2 border-b border-border pb-3"><input value={newSpace} onChange={(event) => setNewSpace(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSpace() } }} placeholder="e.g. Living room, kitchen, balcony" className={fieldClass('py-2')} /><button type="button" onClick={addSpace} className="shrink-0 rounded-lg border border-border px-3 text-[11px] font-bold text-primary hover:bg-primary/5">Add</button></div>{spaces.length === 0 ? <p className="py-4 text-center text-[11px] text-ink-2">Add the rooms and spaces advertised in this listing. Media coverage is assessed after analysis.</p> : <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{spaces.map((space) => <div key={space.name} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-canvas/45 px-3 py-2.5"><span className="min-w-0"><span className="block truncate text-[11px] font-bold text-ink">{space.name}</span><span className="mt-0.5 block text-[9.5px] text-ink-2">Evidence assessed after creation</span></span><button type="button" onClick={() => setSpaces((current) => current.filter((item) => item.name !== space.name))} className="text-[13px] text-ink-3 hover:text-accent" aria-label={`Remove ${space.name}`}>×</button></div>)}</div>}</div></section>
      {submitError && <div role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[11px] font-medium text-danger">{submitError}</div>}
    </div><aside className="sticky top-5 hidden rounded-2xl border border-border bg-surface p-4 shadow-subtle xl:block"><h2 className="text-[14px] font-bold">Ready to create</h2><p className="mt-1 text-[10.5px] leading-relaxed text-ink-2">Review your property details before we start the analysis.</p><div className="mt-4 divide-y divide-border/70"><CompletionRow icon={<PencilLine size={14} />} title="Property details" detail={title && address ? 'Complete' : 'Title and address required'} complete={Boolean(title && address)} /><CompletionRow icon={<ImagePlus size={14} />} title="Listing media" detail={sourceFiles.length ? `${sourceFiles.length} file${sourceFiles.length === 1 ? '' : 's'} ready` : 'Attach property evidence'} complete={sourceFiles.length > 0} /><CompletionRow icon={<Sparkles size={14} />} title="Advertised spaces" detail={spaces.length ? `${spaces.length} space${spaces.length === 1 ? '' : 's'} identified` : 'Optional — add if known'} complete={spaces.length > 0} /><CompletionRow icon={<LoaderCircle size={14} />} title="Verification" detail="Will begin after creation" complete={false} /></div><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-2">What happens next</p><ul className="mt-2 space-y-2 text-[10.5px] leading-relaxed text-ink-2"><li className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-primary" />Organize listing information</li><li className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-primary" />Analyze media and floor plans</li><li className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-primary" />Map advertised spaces</li><li className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-primary" />Identify missing evidence if needed</li></ul></div><div className="mt-4 flex gap-2 border-t border-border pt-3 text-[10px] leading-relaxed text-ink-2"><LockKeyhole size={14} className="mt-0.5 shrink-0 text-primary" />Your property and media remain private until you approve publication.</div></aside></div>
  </div><footer className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"><div className="mx-auto flex max-w-[1380px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10"><Link to="/properties" className="rounded-lg border border-border bg-surface px-4 py-2.5 text-[11px] font-bold text-ink shadow-subtle hover:bg-raised">Cancel</Link><div className="flex items-center gap-3"><p className="hidden max-w-[260px] text-[10px] leading-snug text-ink-2 md:block">You can create the property even when coverage is incomplete. OpenHouse will assess it after creation.</p><button type="button" onClick={() => setDraftNote('Server-saved drafts are the next data-model addition.')} className="hidden rounded-lg border border-border bg-surface px-4 py-2.5 text-[11px] font-bold text-ink shadow-subtle hover:bg-raised sm:inline-flex">Save draft</button><button type="submit" disabled={isSubmitting || !canCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold text-text-inverse shadow-subtle transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45">{isSubmitting ? <><LoaderCircle size={14} className="animate-spin" /> Creating property…</> : <>Create property & analyze →</>}</button></div></div></footer>
  </form></div>
}
