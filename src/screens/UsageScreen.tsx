import { WorkspaceShell } from '../components/WorkspaceShell'
import { Ellipsis } from '../components/icons'
import { CreditCardIcon, StarIcon } from '../components/icons2'
import propAdmiralty from '../assets/prop-admiralty.jpg'
import propKitchen from '../assets/prop-kitchen.png'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'

export function UsageScreen() {
  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight text-text-primary leading-tight">
              Usage
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              Track spatial processing, active storage and published experiences.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-[13.5px] font-semibold text-text-primary shadow-subtle hover:bg-surface-elevated transition-colors whitespace-nowrap">
            <CreditCardIcon size={15} className="text-text-secondary" />
            <span>Plan and billing</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Properties Processed */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <p className="text-[12.5px] text-text-secondary font-medium">Properties processed</p>
              <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap">
                <span className="text-[28px] font-extrabold text-text-primary">18</span>
                <span className="text-[14.5px] text-text-secondary font-medium">/ 25 this month</span>
              </div>
              <div className="h-2 rounded-full bg-border/60 overflow-hidden mt-3.5">
                <div className="h-full rounded-full bg-primary" style={{ width: '72%' }} />
              </div>
            </div>
            <p className="text-[11.5px] text-text-secondary mt-3.5 whitespace-nowrap">Resets September 1</p>
          </div>

          {/* Card 2: Reconstruction Time */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <p className="text-[12.5px] text-text-secondary font-medium">Reconstruction time</p>
              <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap">
                <span className="text-[28px] font-extrabold text-text-primary">7.4h</span>
                <span className="text-[14.5px] text-text-secondary font-medium">/ 20h included</span>
              </div>
              <div className="h-2 rounded-full bg-border/60 overflow-hidden mt-3.5">
                <div className="h-full rounded-full bg-primary" style={{ width: '37%' }} />
              </div>
            </div>
            <p className="text-[11.5px] text-text-secondary mt-3.5 whitespace-nowrap">Used for spatial processing</p>
          </div>

          {/* Card 3: Active Storage */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <p className="text-[12.5px] text-text-secondary font-medium">Active storage</p>
              <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap">
                <span className="text-[28px] font-extrabold text-text-primary">14.2 GB</span>
                <span className="text-[14.5px] text-text-secondary font-medium">/ 50 GB</span>
              </div>
              <div className="h-2 rounded-full bg-border/60 overflow-hidden mt-3.5">
                <div className="h-full rounded-full bg-primary" style={{ width: '28.4%' }} />
              </div>
            </div>
            <p className="text-[11.5px] text-text-secondary mt-3.5 whitespace-nowrap">Captures and published experiences</p>
          </div>
        </div>

        {/* Section: Usage by Property */}
        <div className="space-y-3.5">
          <h2 className="text-[17px] font-bold text-text-primary">Usage by property</h2>

          <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3 border-b border-border bg-surface-elevated/50 text-[11px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                <div>Property</div>
                <div>Processing</div>
                <div>Storage</div>
                <div>Experience</div>
                <div>Updated</div>
                <div />
              </div>

              <div className="divide-y divide-border/60">
                <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={propAdmiralty} alt="" className="h-10 w-14 rounded-lg object-cover border border-border shrink-0" />
                    <span className="font-bold text-text-primary text-[13.5px] truncate">8 Admiralty Way</span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">42 minutes</div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">1.3 GB</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 bg-success/10 text-success whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">Today</div>
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors"><Ellipsis size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={propKitchen} alt="" className="h-10 w-14 rounded-lg object-cover border border-border shrink-0" />
                    <span className="font-bold text-text-primary text-[13.5px] truncate">14 Cooper Road</span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">31 minutes</div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">980 MB</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 bg-accent/10 text-accent whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Preparing
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">Today</div>
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors"><Ellipsis size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={propOrchid} alt="" className="h-10 w-14 rounded-lg object-cover border border-border shrink-0" />
                    <span className="font-bold text-text-primary text-[13.5px] truncate">Orchid Apartments, Unit 4</span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">36 minutes</div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">1.1 GB</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 bg-accent/10 text-accent whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Preparing
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">Today</div>
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors"><Ellipsis size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={propLekkiGardens} alt="" className="h-10 w-14 rounded-lg object-cover border border-border shrink-0" />
                    <span className="font-bold text-text-primary text-[13.5px] truncate">Lekki Gardens, Unit 12</span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">49 minutes</div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">1.5 GB</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 bg-info/10 text-info whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-info" />
                      Ready for review
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">Yesterday</div>
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors"><Ellipsis size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-[2.4fr_1.4fr_1.4fr_1.5fr_1fr_40px] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={propBourdillon} alt="" className="h-10 w-14 rounded-lg object-cover border border-border shrink-0" />
                    <span className="font-bold text-text-primary text-[13.5px] truncate">Bourdillon Court, Unit 8</span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">55 minutes</div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">1.8 GB</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-full px-2.5 py-0.5 bg-success/10 text-success whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary whitespace-nowrap">Yesterday</div>
                  <div className="flex justify-end">
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-elevated transition-colors"><Ellipsis size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-primary/10 text-primary">
              <StarIcon size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-[12px] text-text-secondary font-medium">Current plan</p>
              <p className="text-[18px] font-extrabold text-text-primary">Professional</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 text-[13.5px]">
            <div>
              <p className="font-bold text-text-primary">25</p>
              <p className="text-[12px] text-text-secondary">properties per month</p>
            </div>
            <div>
              <p className="font-bold text-text-primary">20</p>
              <p className="text-[12px] text-text-secondary">reconstruction hours</p>
            </div>
            <div>
              <p className="font-bold text-text-primary">50 GB</p>
              <p className="text-[12px] text-text-secondary">active storage</p>
            </div>
          </div>

          <button className="rounded-lg border border-border bg-surface px-4 py-2 text-[13.5px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors">
            View plan details
          </button>
        </div>
      </div>
    </WorkspaceShell>
  )
}
