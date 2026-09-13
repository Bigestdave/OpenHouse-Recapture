import { Link } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { isSupabaseConfigured } from '../lib/supabase'
import { isDemoMode, runtimeModeLabel } from '../lib/runtime'

function Check({ ready, label, detail }: { ready: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ready ? 'bg-success text-white' : 'bg-amber-100 text-amber-800'}`}>{ready ? '✓' : '!'}</span>
      <div>
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{detail}</p>
      </div>
    </li>
  )
}

export function DiagnosticsScreen() {
  const modeReady = !isDemoMode
  const productionReady = modeReady && isSupabaseConfigured

  return (
    <WorkspaceShell breadcrumb="Diagnostics" backTo="/settings">
      <main className="mx-auto max-w-[760px] px-6 py-8 text-ink">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">OpenHouse diagnostics</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Environment readiness</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">This page reports configuration only. It never displays credential values.</p>

        <div className={`mt-6 rounded-2xl border p-5 ${productionReady ? 'border-success/30 bg-success/5' : 'border-amber-300 bg-amber-50'}`}>
          <p className="text-sm font-bold">Current mode: {runtimeModeLabel}</p>
          <p className="mt-1 text-sm text-ink-2">{productionReady ? 'The browser has the required public Supabase configuration.' : 'The app is safe to explore locally, but real accounts and persisted workflows remain unavailable until setup is complete.'}</p>
        </div>

        <ul className="mt-6 space-y-3">
          <Check ready={isSupabaseConfigured} label="Supabase browser configuration" detail={isSupabaseConfigured ? 'Public project URL and anonymous key are configured.' : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY when you are ready.'} />
          <Check ready={modeReady} label="Production runtime mode" detail={modeReady ? 'Production auth and persisted workflow routes are active.' : 'Set VITE_OPENHOUSE_MODE=production after deploying the database migrations and Edge Functions.'} />
          <Check ready={false} label="Server-side secrets and deployment" detail="Cannot be checked from the browser. Deploy the OpenHouse Edge Functions and add service-role and Gemini secrets in Supabase; never put them in Vite environment variables." />
          <Check ready={false} label="Real external delivery" detail="Email, SMS, WhatsApp, calendars, and an MLS/CRM provider are intentionally not connected yet." />
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/properties" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Open properties</Link>
          <Link to="/settings" className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink">Workspace settings</Link>
        </div>
      </main>
    </WorkspaceShell>
  )
}

