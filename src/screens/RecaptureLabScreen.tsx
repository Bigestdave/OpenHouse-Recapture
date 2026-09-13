import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, CheckCircle2, CircleAlert, Clock3, FolderOpen, LoaderCircle, Mail, MapPin, MessageCircle, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { useStore } from '../data/store'
import { listProductionProperties } from '../lib/productionWorkflow'
import { approveRecaptureMission, listRecaptureMissions, startRecaptureMission, type RecaptureEvent, type RecaptureMission } from '../lib/recapture'

type Property = { id: string; title: string; address: string; status: string }
type GapType = RecaptureMission['gap_type']

const gapLabels: Record<GapType, string> = {
  missing_connection: 'Missing room-to-room connection',
  missing_room: 'Missing advertised room',
  low_light: 'Footage is too dark',
  poor_coverage: 'Coverage is incomplete',
  blurred_media: 'Footage is blurred',
}

function statusView(status: RecaptureMission['status']) {
  if (status === 'scheduled') return { label: 'Capture scheduled', tone: 'bg-primary/10 text-primary border-primary/20' }
  if (status === 'awaiting_realtor_approval') return { label: 'Approval needed', tone: 'bg-accent/10 text-accent border-accent/30' }
  if (status === 'resolved') return { label: 'Resolved', tone: 'bg-success/10 text-success border-success/25' }
  if (status === 'needs_follow_up') return { label: 'Needs follow-up', tone: 'bg-danger/10 text-danger border-danger/25' }
  if (status === 'failed') return { label: 'Connector issue', tone: 'bg-danger/10 text-danger border-danger/25' }
  return { label: status.replaceAll('_', ' '), tone: 'bg-raised-2 text-text-secondary border-border' }
}

function readableTime(value: string | null) {
  if (!value) return 'Time not selected'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function connectorIcon(app: RecaptureEvent['external_app']) {
  if (app === 'google_calendar') return CalendarDays
  if (app === 'google_drive') return FolderOpen
  if (app === 'gmail') return Mail
  if (app === 'telegram') return MessageCircle
  return Sparkles
}

export function RecaptureLabScreen() {
  const { workspace } = useStore()
  const [missions, setMissions] = useState<RecaptureMission[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({ propertyId: '', gapType: 'missing_connection' as GapType, severity: 'blocking' as const, fromSpace: 'Living room', toSpace: 'Pool terrace', reason: 'No continuous footage proves how a visitor moves from the living room to the pool terrace.', scheduledFor: '', approvalRequired: true })

  const load = async () => {
    if (!workspace?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const [nextMissions, nextProperties] = await Promise.all([listRecaptureMissions(workspace.id), listProductionProperties(workspace.id)])
      setMissions(nextMissions)
      setProperties(nextProperties)
      setForm((previous) => previous.propertyId ? previous : { ...previous, propertyId: nextProperties[0]?.id ?? '' })
      setError(null)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load the recapture workspace.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [workspace?.id])

  const activeMission = useMemo(() => missions.find((mission) => mission.id === selectedId) ?? missions[0] ?? null, [missions, selectedId])
  const activeCount = missions.filter((mission) => !['resolved', 'cancelled', 'failed'].includes(mission.status)).length

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.propertyId) { setError('Add a property before starting a recapture mission.'); return }
    setSubmitting(true)
    try {
      const scheduledFor = form.scheduledFor ? new Date(form.scheduledFor).toISOString() : undefined
      const result = await startRecaptureMission({ ...form, scheduledFor })
      setCreating(false)
      setSelectedId(result.mission.id)
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not start the mission.') }
    finally { setSubmitting(false) }
  }

  const approve = async (mission: RecaptureMission) => {
    const scheduledFor = mission.scheduled_for || new Date(Date.now() + 60 * 60 * 1000).toISOString()
    setSubmitting(true)
    try { await approveRecaptureMission(mission.id, scheduledFor); await load() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not approve the mission.') }
    finally { setSubmitting(false) }
  }

  return <WorkspaceShell>
    <main className="min-h-full bg-canvas pb-12 text-text-primary">
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 xl:px-12">
        <header className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary"><Sparkles size={14} /> OpenHouse Recapture</p>
            <h1 className="text-[31px] font-extrabold tracking-tight sm:text-[38px]">Turn a missing proof into a finished listing.</h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">The agent makes one precise capture mission, applies your booking policy, and records every handoff needed to get a property ready for marketplace publishing.</p>
          </div>
          <button type="button" onClick={() => setCreating(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-text-inverse shadow-subtle transition hover:bg-primary-hover"><Plus size={16} /> Start a recapture mission</button>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Active missions" value={String(activeCount)} detail="A shared source of truth" icon={ShieldCheck} />
          <Metric label="Duplicate protection" value="On" detail="One active mission per evidence gap" icon={CheckCircle2} />
          <Metric label="External handoffs" value="4" detail="Calendar, Drive, Telegram, Gmail" icon={ArrowRight} />
        </div>

        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger"><CircleAlert className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}

        {loading ? <Skeleton /> : <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(370px,.9fr)]">
          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold">Mission queue</h2><span className="text-[12px] text-text-secondary">{missions.length} total</span></div>
            {missions.length === 0 ? <EmptyState onCreate={() => setCreating(true)} hasProperties={properties.length > 0} /> : <div className="space-y-3">{missions.map((mission) => {
              const view = statusView(mission.status); const selected = mission.id === activeMission?.id
              return <button key={mission.id} type="button" onClick={() => setSelectedId(mission.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-primary bg-surface shadow-card' : 'border-border bg-surface hover:border-line-strong hover:bg-surface-elevated'}`}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[14px] font-bold">{mission.property?.title || 'Property'}</p><p className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-text-secondary"><MapPin size={13} />{mission.property?.address || 'Property address'}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${view.tone}`}>{view.label}</span></div>
                <p className="mt-4 text-[12.5px] font-semibold text-text-primary">{gapLabels[mission.gap_type]}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-text-secondary">{mission.reason}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-text-secondary"><Clock3 size={13} />{readableTime(mission.scheduled_for)}</div>
              </button>
            })}</div>}
          </div>
          <MissionDetail mission={activeMission} onApprove={approve} approving={submitting} />
        </section>}
      </div>

      {creating && <CreateMissionDialog form={form} setForm={setForm} properties={properties} submitting={submitting} onClose={() => setCreating(false)} onSubmit={submit} />}
    </main>
  </WorkspaceShell>
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof ShieldCheck }) {
  return <div className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-subtle"><div className="flex items-center justify-between"><p className="text-[12px] font-semibold text-text-secondary">{label}</p><Icon size={17} className="text-primary" /></div><p className="mt-2 text-[23px] font-extrabold tracking-tight">{value}</p><p className="mt-0.5 text-[11px] text-text-secondary">{detail}</p></div>
}

function Skeleton() {
  return <div className="mt-7 grid animate-pulse gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(370px,.9fr)]"><div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-36 rounded-2xl border border-border bg-surface" />)}</div><div className="h-[480px] rounded-2xl border border-border bg-surface" /></div>
}

function EmptyState({ onCreate, hasProperties }: { onCreate: () => void; hasProperties: boolean }) {
  return <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Sparkles size={21} /></div><h3 className="mt-4 text-[16px] font-bold">No missions yet</h3><p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-text-secondary">{hasProperties ? 'When a property has a precise missing proof, create one mission. The agent will keep its schedule, communications, and audit trail together.' : 'Add a property first, then turn a specific evidence gap into a focused recapture mission.'}</p>{hasProperties ? <button type="button" onClick={onCreate} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-bold text-text-inverse"><Plus size={15} /> Start mission</button> : <Link to="/add-property" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-bold text-text-inverse">Add property <ArrowRight size={15} /></Link>}</div>
}

function MissionDetail({ mission, onApprove, approving }: { mission: RecaptureMission | null; onApprove: (mission: RecaptureMission) => void; approving: boolean }) {
  if (!mission) return <aside className="rounded-2xl border border-border bg-surface p-6 shadow-subtle"><p className="text-[12px] font-semibold text-text-secondary">MISSION TRACE</p><h2 className="mt-3 text-[18px] font-bold">Select a mission to inspect its decisions.</h2><p className="mt-2 text-[13px] leading-6 text-text-secondary">The trace will show the policy result and each connector receipt, so a realtor can see what actually happened.</p></aside>
  const status = statusView(mission.status)
  return <aside className="rounded-2xl border border-border bg-surface p-5 shadow-subtle xl:sticky xl:top-5 xl:h-fit"><div className="flex items-start justify-between gap-3"><div><p className="text-[10.5px] font-bold tracking-[0.13em] text-text-secondary">MISSION TRACE</p><h2 className="mt-1 text-[18px] font-bold">{mission.from_space ? `${mission.from_space} → ${mission.to_space}` : gapLabels[mission.gap_type]}</h2></div><span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${status.tone}`}>{status.label}</span></div>
    <div className="mt-5 rounded-xl bg-raised-2/65 p-3.5"><p className="text-[10px] font-bold tracking-[0.1em] text-text-secondary">FIELD INSTRUCTION</p><p className="mt-2 text-[13px] leading-5 text-text-primary">{mission.capture_instruction}</p></div>
    <div className="mt-5 border-t border-border pt-4"><p className="text-[10px] font-bold tracking-[0.1em] text-text-secondary">AUDIT LOG</p><div className="mt-3 space-y-3">{(mission.events || []).length === 0 ? <p className="text-[12px] text-text-secondary">The mission was created. Dispatch events will appear here.</p> : mission.events?.map((event) => { const Icon = connectorIcon(event.external_app); return <div key={event.id} className="flex gap-2.5"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon size={13} /></span><div className="min-w-0"><p className="text-[12px] font-semibold text-text-primary">{event.action.replaceAll('_', ' ')}</p><p className="mt-0.5 text-[10.5px] text-text-secondary">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.created_at))}{event.external_ref ? ` · ${event.external_app || 'connector'} receipt` : ''}</p></div></div> })}</div></div>
    {mission.status === 'awaiting_realtor_approval' && <button type="button" disabled={approving} onClick={() => onApprove(mission)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-[12.5px] font-bold text-text-inverse disabled:opacity-60">{approving ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Approve & dispatch</button>}
  </aside>
}

function CreateMissionDialog({ form, setForm, properties, submitting, onClose, onSubmit }: { form: { propertyId: string; gapType: GapType; severity: 'blocking'; fromSpace: string; toSpace: string; reason: string; scheduledFor: string; approvalRequired: boolean }; setForm: React.Dispatch<React.SetStateAction<typeof form>>; properties: Property[]; submitting: boolean; onClose: () => void; onSubmit: (event: React.FormEvent) => void }) {
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm((previous) => ({ ...previous, [key]: value }))
  return <div className="fixed inset-0 z-50 flex items-end bg-sidebar/35 p-0 backdrop-blur-[1px] sm:items-center sm:justify-center sm:p-6"><form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-[660px] overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-overlay sm:rounded-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10.5px] font-bold tracking-[0.14em] text-primary">NEW RECAPTURE MISSION</p><h2 className="mt-1 text-[22px] font-extrabold tracking-tight">Give the agent one exact gap.</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold hover:bg-raised-2">Cancel</button></div>
    <p className="mt-2 text-[13px] leading-5 text-text-secondary">A mission is deduplicated by property and evidence gap. It will not create a second photographer task for the same problem.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Property"><select value={form.propertyId} onChange={(event) => update('propertyId', event.target.value)} required>{properties.length === 0 && <option value="">No properties available</option>}{properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</select></Field><Field label="Evidence gap"><select value={form.gapType} onChange={(event) => update('gapType', event.target.value as GapType)}>{Object.entries(gapLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      {form.gapType === 'missing_connection' && <><Field label="Starts in"><input value={form.fromSpace} onChange={(event) => update('fromSpace', event.target.value)} required /></Field><Field label="Ends in"><input value={form.toSpace} onChange={(event) => update('toSpace', event.target.value)} required /></Field></>}
      <div className="sm:col-span-2"><Field label="Why is it blocking publication?"><textarea rows={3} value={form.reason} onChange={(event) => update('reason', event.target.value)} required /></Field></div>
      <Field label="Proposed capture time (optional)"><input type="datetime-local" value={form.scheduledFor} onChange={(event) => update('scheduledFor', event.target.value)} /></Field><label className="mt-6 flex items-center gap-2 text-[12px] font-medium"><input type="checkbox" checked={form.approvalRequired} onChange={(event) => update('approvalRequired', event.target.checked)} className="h-4 w-4 accent-primary" /> Require realtor approval before dispatch</label>
    </div><div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4"><button type="button" onClick={onClose} className="px-3 py-2 text-[12.5px] font-semibold text-text-secondary">Cancel</button><button disabled={submitting || !form.propertyId} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-bold text-text-inverse disabled:opacity-60">{submitting && <LoaderCircle className="animate-spin" size={15} />} Create mission <ArrowRight size={15} /></button></div>
  </form></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-text-secondary">{label}</span><span className="block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-border [&_input]:bg-surface-elevated [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[13px] [&_input]:outline-none [&_input:focus]:border-primary [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-border [&_select]:bg-surface-elevated [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-[13px] [&_select]:outline-none [&_select:focus]:border-primary [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-border [&_textarea]:bg-surface-elevated [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:text-[13px] [&_textarea]:outline-none [&_textarea:focus]:border-primary">{children}</span></label>
}
