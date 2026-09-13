import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { OpenHouseLogoMark } from '../components/WorkspaceShell'
import {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  ToggleSwitch,
  SelectableCard,
  Badge,
  Callout,
  Stepper,
} from '../components/ui'
import { setWorkspace } from '../data/store'

// Custom SVGs matching the reference UI
function BuildingIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

function UserProfileIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BriefcaseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

function WebhookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M12 8v4" />
      <path d="M10.5 13.5L7.5 16" />
      <path d="M13.5 13.5L16.5 16" />
    </svg>
  )
}

function CsvDocumentIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v6" />
      <path d="M13 18l2-6" />
    </svg>
  )
}

function ShieldCheckBadgeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function LinkChainIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function BellNotificationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function HomeHeartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

const STEPS = ['Workspace', 'Listings', 'Preferences'] as const

export function InitialSetupScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 Form Data
  const [workspaceName, setWorkspaceName] = useState("David's Property Workspace")
  const [workType, setWorkType] = useState<'agency' | 'independent' | 'manager'>('agency')
  const [portfolioSize, setPortfolioSize] = useState('11–50 active properties')
  const [primaryMarket, setPrimaryMarket] = useState('Lagos, Nigeria')
  const [teamSize, setTeamSize] = useState('2–5 people')
  const [userName, setUserName] = useState('David Olabowale')
  const [workEmail, setWorkEmail] = useState('david@openhouse.com')

  // Step 2 Form Data
  const [listingSource, setListingSource] = useState<'demo' | 'webhook' | 'csv' | 'manual'>('demo')

  // Step 3 Form Data
  const [requireApproval, setRequireApproval] = useState(true)
  const [visibility, setVisibility] = useState<'unlisted' | 'public' | 'password'>('unlisted')
  const [sendWhatsapp, setSendWhatsapp] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)
  const [primaryRecipient, setPrimaryRecipient] = useState('David Olabowale')

  // Notification checkboxes
  const [notifyCaptureRequired, setNotifyCaptureRequired] = useState(true)
  const [notifyReviewReady, setNotifyReviewReady] = useState(true)
  const [notifyPublished, setNotifyPublished] = useState(true)
  const [notifyProcessingFailed, setNotifyProcessingFailed] = useState(true)
  const [notifyEveryUpdate, setNotifyEveryUpdate] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleFinish = async () => {
    setSetupError(null)
    setIsSaving(true)
    try {
      await setWorkspace({
      id: crypto.randomUUID(),
      name: workspaceName.trim() || 'Untitled workspace',
      ownerName: userName.trim() || 'Realtor',
      ownerEmail: workEmail.trim().toLowerCase(),
      workType,
      portfolioSize,
      primaryMarket,
      teamSize,
      listingSource,
      requireApproval,
      defaultVisibility: visibility,
      notificationPreferences: {
        captureRequired: notifyCaptureRequired,
        reviewReady: notifyReviewReady,
        published: notifyPublished,
        processingFailed: notifyProcessingFailed,
        everyUpdate: notifyEveryUpdate,
        channels: [
          ...(sendEmail ? ['email' as const] : []),
          ...(sendWhatsapp ? ['whatsapp' as const] : []),
          'in_app' as const,
        ],
      },
      branding: { agencyName: workspaceName.trim(), contactDestination: workEmail.trim().toLowerCase() },
      createdAt: Date.now(),
      })
      navigate('/properties')
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Could not create your workspace.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased flex flex-col justify-between selection:bg-selected">
      {/* TOP BAR */}
      <header className="px-8 py-4.5 flex items-center justify-between border-b border-border bg-surface">
        <Link to="/" className="flex items-center gap-2.5">
          <OpenHouseLogoMark className="h-6 w-6 object-contain" />
          <span className="text-[18px] font-extrabold tracking-tight text-ink">
            OpenHouse
          </span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-ink-2">
          Step {step} of 3
        </span>
      </header>

      {/* MAIN WIZARD BODY */}
      <main className="flex-1 px-6 sm:px-8 max-w-[1120px] w-full mx-auto pt-8 pb-16">
        {/* STEPPER BAR */}
        <div className="mb-8">
          <Stepper
            steps={STEPS}
            currentStep={step}
            onStepClick={(s) => setStep(s as 1 | 2 | 3)}
          />
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SET UP YOUR WORKSPACE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="max-w-[760px] mx-auto space-y-6 animate-fadeIn">
            {/* Title & Subtitle */}
            <div className="text-center space-y-1.5 mb-8">
              <h1 className="text-[32px] sm:text-[36px] font-bold text-ink tracking-tight leading-tight">
                Set up your workspace
              </h1>
              <p className="text-sm text-ink-2 max-w-lg mx-auto leading-relaxed">
                Tell us how you manage properties so OpenHouse can prepare the right workflow.
              </p>
            </div>

            {/* Workspace Name Input */}
            <div>
              <Input
                label="Workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. David's Property Workspace"
              />
            </div>

            {/* How do you work? Selectable Cards */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-ink block">
                How do you work?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <SelectableCard
                  selected={workType === 'agency'}
                  onClick={() => setWorkType('agency')}
                  icon={<BuildingIcon className="h-5 w-5" />}
                  title="Property agency"
                  description="I represent clients and manage property listings."
                />

                <SelectableCard
                  selected={workType === 'independent'}
                  onClick={() => setWorkType('independent')}
                  icon={<UserProfileIcon className="h-5 w-5" />}
                  title="Independent property professional"
                  description="I work independently with clients on property projects."
                />

                <SelectableCard
                  selected={workType === 'manager'}
                  onClick={() => setWorkType('manager')}
                  icon={<BriefcaseIcon className="h-5 w-5" />}
                  title="Property manager or operator"
                  description="I manage and operate properties on behalf of owners."
                />
              </div>
            </div>

            {/* 3-Column Meta Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <Select
                label="Portfolio size"
                value={portfolioSize}
                onChange={(e) => setPortfolioSize(e.target.value)}
                options={[
                  '1–10 active properties',
                  '11–50 active properties',
                  '51–200 active properties',
                  '200+ active properties',
                ]}
              />

              <Input
                label="Primary market"
                value={primaryMarket}
                onChange={(e) => setPrimaryMarket(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
              />

              <Select
                label="Team size"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                options={['Just me', '2–5 people', '6–20 people', '20+ people']}
              />
            </div>

            {/* Contact Section */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-ink block">
                Contact
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Full name"
                />
                <Input
                  label="Work email"
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="email@company.com"
                />
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-center gap-3.5 pt-6">
              <Button
                variant="dark"
                size="lg"
                onClick={() => setStep(2)}
                className="px-14 py-3.5 text-sm"
              >
                Continue
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/properties')}
                className="px-8 py-3.5 text-sm"
              >
                I'll finish this later
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: HOW SHOULD PROPERTIES ENTER OPENHOUSE? */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="max-w-[1060px] mx-auto space-y-6 animate-fadeIn">
            {/* Title & Subtitle */}
            <div className="text-center space-y-1.5 mb-8">
              <h1 className="text-[32px] sm:text-[36px] font-bold text-ink tracking-tight leading-tight">
                How should properties enter OpenHouse?
              </h1>
              <p className="text-sm text-ink-2 max-w-lg mx-auto leading-relaxed">
                Connect a listing source now, or begin by adding properties manually.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: OpenHouse Demo Listings */}
              <SelectableCard
                selected={listingSource === 'demo'}
                onClick={() => setListingSource('demo')}
                icon={<HomeHeartIcon className="h-5 w-5" />}
                title="OpenHouse Demo Listings"
                badge={<Badge variant="success">Recommended for demo</Badge>}
                description="Detect new properties and listing updates automatically from the OpenHouse demo portal."
                checklist={['New listing events', 'Updated media', 'Property status changes']}
                footerAction={
                  <Button
                    variant="dark"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation()
                      setListingSource('demo')
                      setStep(3)
                    }}
                  >
                    Connect demo source
                  </Button>
                }
              />

              {/* Card 2: Custom Webhook */}
              <SelectableCard
                selected={listingSource === 'webhook'}
                onClick={() => setListingSource('webhook')}
                icon={<WebhookIcon className="h-5 w-5" />}
                title="Custom webhook"
                description="Send listing.created and listing.updated events from an existing system."
                footerAction={
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation()
                      setListingSource('webhook')
                      setStep(3)
                    }}
                  >
                    Configure webhook
                  </Button>
                }
              />

              {/* Card 3: CSV Import */}
              <SelectableCard
                selected={listingSource === 'csv'}
                onClick={() => setListingSource('csv')}
                icon={<CsvDocumentIcon className="h-5 w-5" />}
                title="CSV import"
                description="Import multiple property records from a structured CSV file."
                footerAction={
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation()
                      setListingSource('csv')
                      setStep(3)
                    }}
                  >
                    Import file
                  </Button>
                }
              />

              {/* Card 4: Add Manually */}
              <SelectableCard
                selected={listingSource === 'manual'}
                onClick={() => setListingSource('manual')}
                icon={<span className="text-lg font-light">+</span>}
                title="Add manually"
                description="Create each property through the OpenHouse add-property workflow."
                footerAction={
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation()
                      setListingSource('manual')
                      setStep(3)
                    }}
                  >
                    Continue manually
                  </Button>
                }
              />
            </div>

            {/* Bottom Info Banner */}
            <Callout>
              OpenHouse imports only the property information and media needed to prepare the experience.
            </Callout>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>

              <Button
                variant="dark"
                size="md"
                trailingIcon={<span>→</span>}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CHOOSE WHEN OPENHOUSE SHOULD INVOLVE YOU */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="max-w-[1080px] mx-auto space-y-6 animate-fadeIn">
            {/* Title & Subtitle */}
            <div className="text-center space-y-1.5 mb-8">
              <h1 className="text-[32px] sm:text-[36px] font-bold text-ink tracking-tight leading-tight">
                Choose when OpenHouse should involve you
              </h1>
              <p className="text-sm text-ink-2 max-w-lg mx-auto leading-relaxed">
                Set the default decisions that require your approval.
              </p>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Settings Cards */}
              <div className="lg:col-span-8 space-y-4">
                {/* Section 1: Publication Card */}
                <div className="border border-border bg-surface rounded-2xl p-5 shadow-card space-y-3">
                  <span className="text-[10px] font-bold text-ink-3 tracking-wider uppercase block">
                    PUBLICATION
                  </span>

                  <ToggleSwitch
                    checked={requireApproval}
                    onChange={setRequireApproval}
                    label="Require approval before publishing"
                    description="OpenHouse will prepare and verify each experience, then ask you to review it."
                  />
                </div>

                {/* Section 2: Visibility Card */}
                <div className="border border-border bg-surface rounded-2xl p-5 shadow-card space-y-3">
                  <span className="text-[10px] font-bold text-ink-3 tracking-wider uppercase block">
                    VISIBILITY
                  </span>

                  <div className="space-y-3">
                    <span className="text-xs text-ink-2 font-medium block">
                      Default visibility
                    </span>

                    <div className="space-y-2.5">
                      <Radio
                        name="visibility"
                        checked={visibility === 'unlisted'}
                        onChange={() => setVisibility('unlisted')}
                        label="Unlisted link"
                        description="Anyone with the link can view, but it won't appear in search."
                      />

                      <Radio
                        name="visibility"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                        label="Public"
                        description="Anyone can find and view the experience."
                      />

                      <Radio
                        name="visibility"
                        checked={visibility === 'password'}
                        onChange={() => setVisibility('password')}
                        label="Password protected"
                        description="Viewers must enter a password to access the experience."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Capture Requests Card */}
                <div className="border border-border bg-surface rounded-2xl p-5 shadow-card space-y-3">
                  <span className="text-[10px] font-bold text-ink-3 tracking-wider uppercase block">
                    CAPTURE REQUESTS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div className="space-y-2.5">
                      <Checkbox
                        checked={sendWhatsapp}
                        onChange={(e) => setSendWhatsapp(e.target.checked)}
                        label="Send capture requests by WhatsApp"
                      />

                      <Checkbox
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        label="Send capture requests by email"
                      />
                    </div>

                    <div>
                      <Select
                        label="Primary recipient"
                        value={primaryRecipient}
                        onChange={(e) => setPrimaryRecipient(e.target.value)}
                        options={[userName, 'Team Admin']}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Notifications Card */}
                <div className="border border-border bg-surface rounded-2xl p-5 shadow-card space-y-3.5">
                  <span className="text-[10px] font-bold text-ink-3 tracking-wider uppercase block">
                    NOTIFICATIONS
                  </span>

                  <p className="text-xs text-ink-2">
                    We'll notify you only about the decisions and exceptions that matter.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <Checkbox
                      checked={notifyCaptureRequired}
                      onChange={(e) => setNotifyCaptureRequired(e.target.checked)}
                      label="Capture required"
                      description="We need new photos or a video for a property."
                    />

                    <Checkbox
                      checked={notifyProcessingFailed}
                      onChange={(e) => setNotifyProcessingFailed(e.target.checked)}
                      label="Processing failed"
                      description="Something stopped OpenHouse from completing a task."
                    />

                    <Checkbox
                      checked={notifyReviewReady}
                      onChange={(e) => setNotifyReviewReady(e.target.checked)}
                      label="Experience ready for review"
                      description="An experience is prepared and ready for your review."
                    />

                    <Checkbox
                      checked={notifyEveryUpdate}
                      onChange={(e) => setNotifyEveryUpdate(e.target.checked)}
                      label="Every processing update"
                      description="Get notified about every step in the background."
                    />

                    <Checkbox
                      checked={notifyPublished}
                      onChange={(e) => setNotifyPublished(e.target.checked)}
                      label="Publication completed"
                      description="An experience has been published."
                    />
                  </div>

                  {/* Info Callout */}
                  <Callout>
                    OpenHouse will avoid notifying you about routine background work.
                  </Callout>
                </div>
              </div>

              {/* Right Column: Setup Summary Card */}
              <div className="lg:col-span-4">
                <div className="border border-border bg-surface rounded-2xl p-5 shadow-card space-y-4 sticky top-6">
                  <h3 className="text-sm font-bold text-ink">Your setup summary</h3>

                  <div className="space-y-4 pt-1">
                    {/* Item 1: Workspace */}
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <BuildingIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-ink-3 block">Workspace</span>
                        <span className="text-xs font-bold text-ink block">{workspaceName}</span>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Item 2: Listing Source */}
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <HomeHeartIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-ink-3 block">Listing source</span>
                        <span className="text-xs font-bold text-ink block">
                          {listingSource === 'demo'
                            ? 'OpenHouse Demo Listings'
                            : listingSource === 'webhook'
                            ? 'Custom webhook'
                            : listingSource === 'csv'
                            ? 'CSV Import'
                            : 'Manual Entry'}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Item 3: Publication */}
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ShieldCheckBadgeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-ink-3 block">Publication</span>
                        <span className="text-xs font-bold text-ink block">
                          {requireApproval ? 'Approval required' : 'Automatic publishing'}
                        </span>
                        <span className="text-[11px] text-ink-2 block leading-tight mt-0.5">
                          {requireApproval
                            ? "You'll review before anything is published."
                            : 'Experiences go live immediately when verified.'}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Item 4: Visibility */}
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <LinkChainIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-ink-3 block">Visibility</span>
                        <span className="text-xs font-bold text-ink block capitalize">
                          {visibility === 'unlisted'
                            ? 'Unlisted link'
                            : visibility === 'public'
                            ? 'Public'
                            : 'Password protected'}
                        </span>
                        <span className="text-[11px] text-ink-2 block leading-tight mt-0.5">
                          {visibility === 'unlisted'
                            ? 'Anyone with the link can view.'
                            : visibility === 'public'
                            ? 'Anyone can find and view.'
                            : 'Password required for access.'}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Item 5: Notifications */}
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <BellNotificationIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-ink-3 block">Notifications</span>
                        <span className="text-xs font-bold text-ink block">Decisions and exceptions only</span>
                        <span className="text-[11px] text-ink-2 block leading-tight mt-0.5">
                          You'll be notified about important events that need your attention.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(2)}
              >
                ← Back
              </Button>

              <Button
                variant="dark"
                size="md"
                onClick={handleFinish}
                loading={isSaving}
                disabled={isSaving}
                className="px-8"
              >
                Finish setup
              </Button>
            </div>
            {setupError && <p className="pt-3 text-sm font-medium text-danger" role="alert">{setupError}</p>}
          </div>
        )}
      </main>
    </div>
  )
}

