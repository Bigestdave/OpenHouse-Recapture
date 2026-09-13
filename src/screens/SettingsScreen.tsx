import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { CopyIcon } from '../components/icons2'

const settingsTabs = ['Workspace', 'Connections', 'Security'] as const
type SettingsTab = (typeof settingsTabs)[number]

export function SettingsScreen() {
  const [tab, setTab] = useState<SettingsTab>('Workspace')
  const [saved, setSaved] = useState(false)

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8 lg:px-10 py-6 lg:py-8 space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Settings
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              Manage workspace defaults, connections, and security.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/setup"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-[13.5px] font-semibold text-text-primary shadow-subtle hover:bg-raised-2 transition-colors shrink-0 whitespace-nowrap"
            >
              Open Setup Wizard ↗
            </Link>
            <button
              onClick={() => {
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors shrink-0 whitespace-nowrap"
            >
              {saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-border">
          {settingsTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-2.5 text-[14px] font-semibold transition-colors whitespace-nowrap ${
                tab === t ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Section 1: Workspace Details */}
          <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-3.5">
            <h3 className="text-[15px] font-bold text-text-primary">Workspace details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Workspace name</label>
                <input
                  defaultValue="OpenHouse Workspace"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Workspace URL</label>
                <div className="flex items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary">
                  <span className="flex-1 font-mono text-[13px]">openhouse.app/workspaces/david</span>
                  <CopyIcon size={16} className="text-text-secondary cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Workspace type</label>
                <select className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none">
                  <option>Property agency</option>
                  <option>Independent broker</option>
                  <option>Developer / Builder</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Region */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle space-y-4">
            <h3 className="text-[16px] font-bold text-text-primary">Region</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Time zone</label>
                <select className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none">
                  <option>Africa/Lagos</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Language</label>
                <select className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none">
                  <option>English</option>
                  <option>French</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Currency</label>
                <select className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none">
                  <option>Nigerian Naira — NGN</option>
                  <option>US Dollar — USD</option>
                  <option>British Pound — GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Date format</label>
                <select className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Default Contact */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle space-y-4">
            <h3 className="text-[16px] font-bold text-text-primary">Default contact</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Name</label>
                <input
                  defaultValue="David Olabowale"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Email</label>
                <input
                  defaultValue="david@openhouse.com"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Phone</label>
                <input
                  defaultValue="+234 800 000 0000"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Danger Zone */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-bold text-danger">Delete workspace</h3>
              <p className="text-[13px] text-text-secondary mt-0.5">
                Permanently removes workspace settings. Published experiences must be handled separately.
              </p>
            </div>

            <button
              onClick={() => alert('This action is protected in demo mode.')}
              className="rounded-lg border border-danger/40 bg-surface px-4 py-2 text-[13.5px] font-semibold text-danger hover:bg-danger/10 transition-colors shrink-0"
            >
              Delete workspace
            </button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
