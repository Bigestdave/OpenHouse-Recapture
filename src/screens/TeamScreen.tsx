import { useState } from 'react'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { SearchIcon, PlusIcon, ShieldIcon, SuitcaseIcon, ApprovalsIcon, CameraIcon } from '../components/icons2'
import { Ellipsis } from '../components/icons'

const TEAM_MEMBERS = [
  {
    name: 'David Olabowale',
    email: 'david@openhouse.com',
    role: 'Owner',
    access: 'All properties',
    lastActive: 'Now',
    status: 'Active',
    initial: 'D',
  },
  {
    name: 'Tola Adeyemi',
    email: 'tola@openhouse.com',
    role: 'Property manager',
    access: '12 properties',
    lastActive: '14 minutes ago',
    status: 'Active',
    initial: 'T',
  },
  {
    name: 'Maya Okafor',
    email: 'maya@openhouse.com',
    role: 'Reviewer',
    access: 'All properties',
    lastActive: 'Yesterday',
    status: 'Active',
    initial: 'M',
  },
  {
    name: 'Chidi Eze',
    email: 'chidi@openhouse.com',
    role: 'Capture contributor',
    access: 'Assigned properties only',
    lastActive: 'Monday',
    status: 'Active',
    initial: 'C',
  },
  {
    name: 'Amara Bello',
    email: 'amara@example.com',
    role: 'Property manager',
    access: '6 properties',
    lastActive: '—',
    status: 'Invitation pending',
    initial: 'AB',
  },
]

export function TeamScreen() {
  const [query, setQuery] = useState('')

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Team
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              Manage who can prepare, review and publish property experiences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex w-full sm:w-[240px] md:w-[280px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13.5px] text-text-primary shadow-subtle focus-within:border-primary">
              <SearchIcon size={15} className="text-text-secondary shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members..."
                className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary/70 min-w-0 font-normal"
              />
            </div>

            <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors shrink-0 whitespace-nowrap">
              <PlusIcon size={14} strokeWidth={2} />
              <span>Invite member</span>
            </button>
          </div>
        </div>

        {/* Counter Subheading */}
        <p className="text-[13px] text-text-secondary font-medium whitespace-nowrap">
          <strong className="text-text-primary">4</strong> active members · <strong className="text-text-primary">1</strong> pending invitation
        </p>

        {/* Members Table */}
        <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-x-auto">
          <div className="min-w-[840px]">
            <div className="grid grid-cols-[2.2fr_1.6fr_1.6fr_1.2fr_1.2fr_40px] items-center gap-4 px-5 py-3 border-b border-border bg-surface-elevated/50 text-[11px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
              <div>Member</div>
              <div>Role</div>
              <div>Property access</div>
              <div>Last active</div>
              <div>Status</div>
              <div />
            </div>

            <div className="divide-y divide-border/60">
              {TEAM_MEMBERS.map((m) => (
                <div
                  key={m.email}
                  className="grid grid-cols-[2.2fr_1.6fr_1.6fr_1.2fr_1.2fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors"
                >
                  {/* Member Name + Avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-text-inverse shadow-subtle"
                      style={{ background: 'linear-gradient(135deg, #194534 0%, #0B1713 100%)' }}
                    >
                      {m.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary text-[13.5px] truncate">{m.name}</p>
                      <p className="text-[12px] text-text-secondary truncate mt-0.5">{m.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="text-[13px] font-medium text-text-primary truncate">
                    {m.role}
                  </div>

                  {/* Property Access */}
                  <div className="text-[13px] text-text-secondary truncate">
                    {m.access}
                  </div>

                  {/* Last Active */}
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">
                    {m.lastActive}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 whitespace-nowrap ${
                        m.status === 'Active'
                          ? 'bg-success/10 text-success'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${m.status === 'Active' ? 'bg-success' : 'bg-accent'}`} />
                      {m.status}
                    </span>
                  </div>

                  {/* Menu */}
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors">
                      <Ellipsis size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roles and Permissions Guide */}
        <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-3.5">
          <h3 className="text-[14.5px] font-bold text-text-primary">Roles and permissions</h3>
          <div className="divide-y divide-border/60 text-[13px]">
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldIcon size={16} className="text-primary shrink-0" />
                <span className="font-bold text-text-primary">Owner</span>
              </div>
              <span className="text-text-secondary text-[12.5px]">Full workspace access</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <SuitcaseIcon size={16} className="text-primary shrink-0" />
                <span className="font-bold text-text-primary">Property manager</span>
              </div>
              <span className="text-text-secondary text-[12.5px]">Manage assigned properties and capture requests</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ApprovalsIcon size={16} className="text-primary shrink-0" />
                <span className="font-bold text-text-primary">Reviewer</span>
              </div>
              <span className="text-text-secondary text-[12.5px]">Review experiences and request changes</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CameraIcon size={16} className="text-primary shrink-0" />
                <span className="font-bold text-text-primary">Capture contributor</span>
              </div>
              <span className="text-text-secondary text-[12.5px]">Respond to assigned capture requests</span>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
