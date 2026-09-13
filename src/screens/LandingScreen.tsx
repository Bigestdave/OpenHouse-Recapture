import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CircleHelp, Eye, Menu, Network, PanelTop, X } from 'lucide-react'
import heroVisual from '../assets/landing-hero.png'
import listingToOpenhouse from '../assets/landing-flow.png'
import visitorExperience from '../assets/landing-experience.png'
import propertyProcess from '../assets/landing-process.png'
import closingVisual from '../assets/landing-closing.png'
import logoAsset from '../assets/landing-logo.png'

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${light ? 'text-[#efeee9]' : 'text-stone-900'}`} data-testid="display-brand">
      {light ? (
        <span className="relative block h-7 w-7" aria-hidden="true">
          <span className="absolute bottom-0 left-0 h-5 w-2.5 rotate-45 bg-[#efeee9]" />
          <span className="absolute bottom-0 right-0 h-5 w-2.5 -rotate-45 bg-[#efeee9]" />
          <span className="absolute bottom-0 left-[9px] h-3.5 w-2.5 bg-[#11120f]" />
        </span>
      ) : (
        <img src={logoAsset} alt="OpenHouse" className="h-7 w-7 rounded-[8px] object-cover" />
      )}
      <span className="text-[17px] font-semibold tracking-[-.04em]">OpenHouse</span>
    </span>
  )
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const close = () => setMobileOpen(false)
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f8f7f3]/90 backdrop-blur-md" data-testid="site-header">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-12">
        <a href="#top" onClick={close} data-testid="link-brand-home"><Logo /></a>
        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary navigation" data-testid="nav-primary">
          <a className="text-[12px] font-medium text-black/65 transition-colors hover:text-black" href="#system" data-testid="link-product">Product</a>
          <a className="text-[12px] font-medium text-black/65 transition-colors hover:text-black" href="#process" data-testid="link-how-it-works">How it works</a>
          <a className="text-[12px] font-medium text-black/65 transition-colors hover:text-black" href="#professionals" data-testid="link-professionals">For professionals</a>
          <a className="text-[12px] font-medium text-black/65 transition-colors hover:text-black" href="#trust" data-testid="link-trust">Trust</a>
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link to="/portal" className="text-[12px] font-medium text-[#4d7145] transition-colors hover:text-black" data-testid="link-portal">MLS Gateway</Link>
          <Link to="/login" className="text-[12px] font-medium text-black/65 transition-colors hover:text-black" data-testid="link-signin">Sign in</Link>
          <Link to="/login" className="bg-[#11120f] px-5 py-2.5 text-[11px] font-medium text-[#f7f6f1] transition-transform hover:-translate-y-0.5 rounded-lg shadow-xs" data-testid="button-header-signup">Sign up</Link>
        </div>
        <button className="md:hidden p-1 text-stone-800" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} data-testid="button-mobile-menu">
          {mobileOpen ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
        </button>
      </div>
      {mobileOpen && (
        <nav className="border-t border-black/10 px-6 pb-6 pt-4 md:hidden bg-[#f8f7f3]" aria-label="Mobile navigation" data-testid="nav-mobile">
          <div className="flex flex-col gap-1">
            {[
              ['Product', '#system', 'link-mobile-product'],
              ['How it works', '#process', 'link-mobile-process'],
              ['For professionals', '#professionals', 'link-mobile-professionals'],
              ['Trust', '#trust', 'link-mobile-trust'],
            ].map(([label, href, testId]) => (
              <a key={href} href={href} onClick={close} className="flex items-center justify-between border-b border-black/10 py-3 text-sm font-medium text-stone-800" data-testid={testId}>
                {label}<ArrowRight size={14} />
              </a>
            ))}
            <Link to="/portal" onClick={close} className="flex items-center justify-between border-b border-black/10 py-3 text-sm font-bold text-[#194534]">
              MLS Gateway <ArrowRight size={14} />
            </Link>
            <Link to="/public/homestead-pd" onClick={close} className="mt-4 flex items-center justify-center bg-[#11120f] py-3 text-xs font-semibold text-[#f7f6f1] rounded-lg" data-testid="button-mobile-see-home">
              See Live 3D Experience
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

function InterestPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#11120f]/50 p-3 sm:items-center backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="interest-title" data-testid="dialog-interest">
      <div className="relative w-full max-w-[520px] bg-[#f8f7f3] p-7 shadow-2xl sm:p-10 rounded-2xl border border-stone-300">
        <button className="absolute right-5 top-5 text-black/55 hover:text-black cursor-pointer" onClick={onClose} aria-label="Close interest panel" data-testid="button-close-interest"><X size={18} /></button>
        {!sent ? (
          <>
            <p className="mono-label mb-4 text-[#4d7145] font-bold">OpenHouse / early access</p>
            <h2 id="interest-title" className="max-w-[380px] text-3xl tracking-[-.05em] sm:text-4xl font-semibold text-stone-900 leading-tight">Bring the next home to life.</h2>
            <p className="mt-3 max-w-[390px] text-sm leading-6 text-black/60">Tell us where you work and we’ll show you how an autonomous experience agent fits your listings.</p>
            <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }} data-testid="form-interest">
              <label className="block">
                <span className="mono-label mb-2 block text-black/60">Work email</span>
                <input required type="email" placeholder="you@company.com" className="w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm rounded-lg outline-none transition-colors focus:border-[#4d7145]" data-testid="input-interest-email" />
              </label>
              <label className="block">
                <span className="mono-label mb-2 block text-black/60">I am a</span>
                <select className="w-full appearance-none border border-black/20 bg-white px-3.5 py-2.5 text-sm rounded-lg outline-none focus:border-[#4d7145]" data-testid="select-interest-role">
                  <option>Property professional / Broker</option>
                  <option>Realtor / Listing Agent</option>
                  <option>Curious buyer / Tenant</option>
                  <option>Technology partner</option>
                </select>
              </label>
              <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 bg-[#11120f] py-3.5 text-xs font-semibold text-[#f7f6f1] transition-transform hover:-translate-y-0.5 rounded-lg cursor-pointer" data-testid="button-submit-interest">
                Request an introduction <ArrowRight size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe9db] text-[#4d7145]"><Check size={22} /></div>
            <h2 className="text-3xl tracking-[-.05em] font-semibold text-stone-900">You’re on the list.</h2>
            <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-black/60">Ready to explore now? Jump into the live interactive Palm Desert inspection experience.</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button onClick={() => navigate('/public/homestead-pd')} className="w-full bg-[#11120f] py-3 text-xs font-semibold text-[#f7f6f1] rounded-lg cursor-pointer">
                Enter Live 3D Experience →
              </button>
              <button onClick={onClose} className="border border-black/20 py-2.5 text-xs text-stone-700 rounded-lg hover:bg-black/5 cursor-pointer" data-testid="button-dismiss-interest">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Hero() {
  const ref = useReveal<HTMLElement>()
  return (
    <section id="top" ref={ref} className="reveal page-grid relative mx-auto max-w-[1440px] px-6 pb-8 pt-12 lg:px-12 lg:pb-11 lg:pt-20" data-testid="section-hero">
      <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-5">
        <div className="max-w-[580px]">
          <p className="mono-label mb-6 text-black/50" data-testid="text-hero-eyebrow">The property-experience agent</p>
          <h1 className="text-balance text-[clamp(2.9rem,6vw,6.2rem)] leading-[.92] tracking-[-.075em] font-semibold text-stone-900" data-testid="text-hero-title">
            Every listing becomes<br />a 24/7 <span className="serif italic font-normal">open house.</span>
          </h1>
          <p className="mt-6 max-w-[420px] text-[15px] leading-relaxed text-black/65" data-testid="text-hero-description">
            OpenHouse turns listing media and a guided phone capture into a verified, interactive home anyone can enter from the browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/login" className="group flex items-center gap-3 bg-[#11120f] px-6 py-3.5 text-xs font-semibold text-[#f7f6f1] rounded-lg shadow-sm hover:bg-black" data-testid="button-hero-signup">
              Sign up for OpenHouse <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login" className="group flex items-center gap-2 text-xs font-medium text-black/70 hover:text-black px-4 py-3.5 rounded-lg border border-stone-300 hover:bg-stone-100/60" data-testid="link-hero-signin">
              Sign in to Workspace <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-5 font-mono text-[9.5px] text-black/45">No specialist camera&nbsp; · &nbsp;No app required for visitors</p>
        </div>
        <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[480px]" data-testid="display-hero-visual">
          <div className="architectural-door flex w-full items-center justify-center">
            <div className="dot-field absolute inset-x-3 top-[12%] h-[77%] opacity-70" />
            <img src={heroVisual} alt="Open doorway revealing a living room by the water" className="relative z-10 mt-6 h-full max-h-[480px] w-full max-w-[740px] object-contain" data-testid="img-hero-property" />
          </div>
          <span className="absolute bottom-2 left-0 font-mono text-[9px] text-black/45">CAPTURE 01&nbsp;&nbsp; / &nbsp;&nbsp;SPATIAL ENTRY</span>
        </div>
      </div>
      <div className="mt-12 hidden items-center gap-4 border-t border-black/15 pt-4 md:flex" data-testid="display-hero-flow">
        {['Listing', 'Evidence', 'Capture', 'Experience', 'Verification', 'Open house'].map((item, index) => (
          <div key={item} className="flex flex-1 items-center gap-3">
            <span className={`font-mono text-[9.5px] uppercase font-medium ${index === 1 ? 'text-[#4d7145]' : 'text-black/55'}`}>{item}</span>
            {index < 5 && (
              <span className="h-px flex-1 bg-black/20">
                <span className={`block h-1 w-1 -translate-y-1/2 rounded-full ${index === 0 ? 'bg-[#4d7145]' : 'bg-black/30'}`} />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function FlowSection() {
  const ref = useReveal<HTMLElement>()
  return (
    <section id="process" ref={ref} className="reveal border-t border-black/10 px-6 py-20 lg:px-12 lg:py-28" data-testid="section-process">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <h2 className="text-4xl leading-[.98] tracking-[-.06em] font-semibold text-stone-900 sm:text-6xl">
              One listing in.<br />A verified <span className="serif italic font-normal">open house</span> out.
            </h2>
            <p className="max-w-[360px] self-end text-sm leading-relaxed text-black/60 lg:ml-auto">
              OpenHouse organizes the property evidence, handles missing coverage, prepares the spatial experience and asks for approval before it goes live.
            </p>
          </div>
        </div>

        {/* Seamless Diagram Visual */}
        <div className="overflow-hidden bg-transparent my-6" data-testid="display-process-pipeline">
          <img src={listingToOpenhouse} alt="OpenHouse listing, evidence, and publishing workflow" className="block h-auto w-full object-contain" data-testid="img-listing-to-openhouse" />
        </div>

        {/* Pipeline Bar */}
        <div className="hidden sm:flex items-center justify-between font-mono text-[10px] uppercase text-black/50 border-t border-black/15 pt-3 pb-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-black/70">INGEST</span>
            <span className="h-px w-24 bg-black/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4d7145]" />
            <span className="font-bold text-[#4d7145]">VERIFY</span>
            <span className="h-px w-24 bg-black/20" />
            <span className="h-2 w-2 bg-black/80" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-black/70">PUBLISH</span>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid gap-8 border-t border-black/15 pt-8 md:grid-cols-3">
          {[
            ['01', 'Listing detected', 'We automatically detect new listings and ingest media, tours and plans.'],
            ['02', 'Evidence checked', 'We map the spaces, verify coverage and resolve what’s missing.'],
            ['03', 'Human approval preserved', 'You review the experience and approve it before it goes live.'],
          ].map(([num, title, copy], index) => (
            <div key={num} className={`reveal reveal-delay-${index + 1}`}>
              <div className="mb-3 flex items-center gap-2 text-stone-400">
                <span className="text-[13px] font-light text-stone-500">+</span>
                <span className="mono-label text-[#4d7145] font-bold">{num}</span>
              </div>
              <h3 className="text-sm font-bold text-stone-900">{title}</h3>
              <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-black/60">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const ref = useReveal<HTMLElement>()
  return (
    <section id="system" ref={ref} className="reveal dark-panel px-6 py-20 lg:px-12 lg:py-28" data-testid="section-experience">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <h2 className="max-w-[700px] text-4xl leading-[.95] tracking-[-.06em] sm:text-6xl font-semibold">
              Let people enter the home<br />before they <span className="serif italic font-normal">schedule it.</span>
            </h2>
          </div>
          <p className="max-w-[320px] text-sm leading-relaxed text-white/60 lg:ml-auto">
            Visitors can take a guided tour, explore freely, ask about the property and book an inspection—all from the browser.
          </p>
        </div>
        <div className="mt-12 overflow-hidden border border-white/15 rounded-lg" data-testid="display-visitor-experience">
          <img src={visitorExperience} alt="OpenHouse browser-based visitor experience with rooms, guided tour, and inspection controls" className="block h-auto w-full object-contain" data-testid="img-visitor-experience" />
        </div>
        <div className="mt-8 grid divide-y divide-white/15 border-t border-white/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {[
            [Network, 'Guided tour', 'Follow a tour with a structured, story-led flow.'],
            [Eye, 'Free exploration', 'Move freely through every space at your own pace.'],
            [CircleHelp, 'Grounded questions', 'Ask about the home with context from real property data.'],
            [PanelTop, 'Book inspection', 'Choose a time that works and confirm instantly.'],
          ].map(([Icon, title, copy]) => (
            <div key={title as string} className="flex gap-4 py-6 first:pr-5 sm:px-5 lg:px-4">
              <Icon size={24} strokeWidth={1.2} className="shrink-0 text-white/75" />
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-white">{title as string}</p>
                <p className="mt-1.5 max-w-[200px] text-[11.5px] leading-relaxed text-white/50">{copy as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidenceSection() {
  const ref = useReveal<HTMLElement>()
  return (
    <section id="trust" ref={ref} className="reveal px-6 py-20 lg:px-12 lg:py-28" data-testid="section-evidence">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h2 className="max-w-[690px] text-4xl leading-[.96] tracking-[-.06em] font-semibold text-stone-900 sm:text-6xl">
              From property evidence<br />to a <span className="serif italic font-normal">verified</span> place.
            </h2>
            <span className="mt-6 block h-px w-12 bg-black/30" />
            <p className="mt-4 text-sm leading-relaxed text-black/65">
              Code controls the process.<br />The agent handles ambiguity.<br />Spatial software resolves the property.
            </p>
          </div>

          <div className="lg:pt-2 border-l border-black/15 pl-6">
            <p className="mono-label mb-4 text-black/60 font-bold">EVIDENCE STATUS</p>
            <div className="space-y-3.5 text-[12px]">
              <div className="flex items-center gap-2.5 text-black/75">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white"><Check size={10} /></span>
                <span>Listing collected</span>
              </div>
              <div className="flex items-center gap-2.5 text-black/75">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white"><Check size={10} /></span>
                <span>Seven spaces identified</span>
              </div>
              <div className="flex items-center gap-2.5 text-black/75">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white"><Check size={10} /></span>
                <span>Balcony capture requested</span>
              </div>
              <div className="flex items-center gap-2.5 text-black/75">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white"><Check size={10} /></span>
                <span>New footage received</span>
              </div>
              <div className="flex items-start gap-2.5 text-black/90 font-medium">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white mt-0.5"><ArrowRight size={10} /></span>
                <div>
                  <p>Building interactive experience</p>
                  <p className="text-[10px] text-stone-500 font-normal">In progress</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-black/45">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-black/30 mt-0.5" />
                <div>
                  <p>Final review</p>
                  <p className="text-[10px] text-stone-400 font-normal">Pending</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-black/45">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-black/30 mt-0.5" />
                <div>
                  <p>Ready for your approval</p>
                  <p className="text-[10px] text-stone-400 font-normal">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seamless Horizontal Flow Visual */}
        <div className="relative mt-12 overflow-hidden bg-transparent py-4" data-testid="display-evidence-timeline">
          <img src={propertyProcess} alt="OpenHouse property process from listing detected through published experience" className="block h-auto w-full object-contain" data-testid="img-property-process" />
        </div>

        {/* Dotted Headline Banner */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-black/15 pt-6 font-mono text-[10px] uppercase tracking-[.08em] sm:flex-row sm:items-center">
          <span>ONE LISTING WENT IN.</span>
          <span className="hidden h-px flex-1 bg-black/15 sm:block" />
          <span className="h-1.5 w-1.5 bg-[#4d7145]" />
          <span>A VERIFIED MOBILE</span>
          <span className="serif text-3xl normal-case tracking-[-.04em] font-serif font-semibold text-stone-900">OPEN HOUSE</span>
          <span>CAME OUT.</span>
        </div>
      </div>
    </section>
  )
}

function ProfessionalsSection({ onInterest }: { onInterest: () => void }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section id="professionals" ref={ref} className="reveal border-t border-black/10 bg-[#e9e8e1] px-6 py-20 lg:px-12 lg:py-24" data-testid="section-professionals">
      <div className="mx-auto grid max-w-[1440px] items-end gap-10 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mono-label mb-4 text-[#4d7145] font-bold">For property professionals</p>
          <h2 className="max-w-[630px] text-4xl leading-[.97] tracking-[-.06em] font-semibold text-stone-900 sm:text-6xl">
            Your listing should<br />stay <span className="serif italic font-normal">open</span>.
          </h2>
        </div>
        <div className="lg:pl-10">
          <p className="max-w-[400px] text-sm leading-relaxed text-black/65">
            OpenHouse gives every property a persistent, evidence-backed place online—ready when a buyer is, without asking your team to rebuild the experience by hand.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link to="/portal" className="group inline-flex items-center gap-2 bg-[#11120f] px-5 py-3 text-xs font-semibold text-[#f7f6f1] rounded-lg hover:bg-black" data-testid="button-professional-intro">
              Simulate Ingestion Gateway <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <button onClick={onInterest} className="text-xs font-medium text-stone-700 hover:text-stone-900 underline underline-offset-4 cursor-pointer">
              Talk to OpenHouse
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ onInterest }: { onInterest: () => void }) {
  return (
    <footer className="relative overflow-hidden bg-[#f8f7f3] pt-12" data-testid="site-footer">
      
      {/* Seamless Closing Hero Illustration with integrated text inside */}
      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="relative w-full">
          <img
            src={closingVisual}
            alt="OpenHouse closing visual showing an architectural home opening into a persistent open house"
            className="block w-full h-auto object-contain pointer-events-none"
            data-testid="img-closing-visual"
          />

          {/* Text positioned cleanly inside the lower clearing */}
          <div className="text-center pt-4 pb-8 max-w-[900px] mx-auto">
            <p className="mono-label text-[#4d7145] font-bold mb-3">OPENHOUSE &nbsp;/ &nbsp;READY WHEN THE LISTING IS</p>
            <h2 className="text-4xl sm:text-6xl lg:text-[72px] leading-[.93] tracking-[-.065em] font-normal text-stone-900">
              Your next open house<br />
              <span className="serif italic font-normal">never has to close.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-xs sm:text-sm leading-relaxed text-black/65">
              Add the property. OpenHouse prepares the experience and brings you in only when evidence or approval is needed.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/portal" className="bg-[#11120f] px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-semibold text-[#f7f6f1] hover:bg-black rounded-lg shadow-sm" data-testid="button-footer-add-property">
                Add a property
              </Link>
              <Link to="/public/homestead-pd" className="border border-black/25 bg-[#f8f7f3] px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-semibold text-stone-900 hover:bg-black/5 rounded-lg" data-testid="link-footer-see-experience">
                See the experience
              </Link>
            </div>
            <p className="mt-4 font-mono text-[9px] sm:text-[10px] text-black/45">
              Guided phone capture&nbsp; · &nbsp;Browser-based viewing&nbsp; · &nbsp;Approval before publishing
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar matching Reference Screenshot 3 */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="border-t border-black/15 pt-12 pb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[190px] text-[11px] leading-5 text-black/55">
              Every listing becomes<br />a 24/7 open house.
            </p>
            <div className="mt-4 text-[9px] font-mono text-black/50 space-y-1">
              <p className="text-[#4d7145] font-bold">● &nbsp;SYSTEM / EXPERIENCE READY</p>
              <p>LAST ENTRY / 8 ADMIRALTY WAY</p>
            </div>
          </div>

          <div>
            <p className="mono-label mb-3 text-black/50 font-bold">PRODUCT</p>
            <div className="space-y-2 text-[11.5px] text-black/65">
              <a className="block hover:text-black" href="#process">How it works</a>
              <a className="block hover:text-black" href="#professionals">For professionals</a>
              <Link className="block hover:text-black" to="/public/homestead-pd">See an experience</Link>
              <a className="block hover:text-black" href="#trust">Trust</a>
              <Link className="block hover:text-black font-semibold text-[#194534]" to="/portal">MLS Ingestion Simulator</Link>
            </div>
          </div>

          <div>
            <p className="mono-label mb-3 text-black/50 font-bold">COMPANY</p>
            <div className="space-y-2 text-[11.5px] text-black/65">
              <a className="block hover:text-black" href="#top">About</a>
              <button onClick={onInterest} className="block text-left hover:text-black">Contact</button>
              <a className="block hover:text-black" href="#top">Privacy</a>
              <a className="block hover:text-black" href="#top">Terms</a>
            </div>
          </div>

          <div>
            <p className="mono-label mb-3 text-black/50 font-bold">RESOURCES</p>
            <div className="space-y-2 text-[11.5px] text-black/65">
              <a className="block hover:text-black" href="https://github.com/Bigestdave/OpenHouse" target="_blank" rel="noreferrer">Documentation</a>
              <a className="block hover:text-black" href="https://github.com/Bigestdave/OpenHouse" target="_blank" rel="noreferrer">GitHub</a>
              <span className="block text-stone-500">Capture guide</span>
              <span className="block text-stone-500">System status</span>
            </div>
          </div>

          <div>
            <p className="mono-label mb-3 text-black/50 font-bold">DEMO</p>
            <div className="space-y-2 text-[11.5px] text-black/65">
              <Link className="block hover:text-black font-semibold text-stone-900" to="/public/homestead-pd">See a home</Link>
              <button onClick={onInterest} className="block text-left hover:text-black text-[#194534]">Request a demo</button>
              <button onClick={onInterest} className="block text-left hover:text-black">Talk to sales</button>
            </div>
          </div>
        </div>

        <div id="contact" className="flex flex-col sm:flex-row items-center justify-between border-t border-black/15 py-4 font-mono text-[9px] text-black/45 gap-2">
          <span>OPENHOUSE SYSTEMS INC.</span>
          <span>© 2026 OpenHouse</span>
        </div>
      </div>
    </footer>
  )
}

export function LandingScreen() {
  const [interestOpen, setInterestOpen] = useState(false)
  return (
    <div className="site-shell min-h-screen bg-[#f8f7f3] text-stone-900 font-sans selection:bg-[#4d7145]/20">
      <Header />
      <main>
        <Hero />
        <FlowSection />
        <ExperienceSection />
        <EvidenceSection />
        <ProfessionalsSection onInterest={() => setInterestOpen(true)} />
      </main>
      <Footer onInterest={() => setInterestOpen(true)} />
      <InterestPanel open={interestOpen} onClose={() => setInterestOpen(false)} />
    </div>
  )
}
