import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { signIn, signUp } from '../lib/auth'
import { isDemoMode } from '../lib/runtime'
import { OpenHouseLogoMark } from '../components/WorkspaceShell'
import imgPointCloudDoorway from '../assets/openhouse-pointcloud-doorway.png'

type AuthMode = 'signin' | 'signup'

function inputClass(hasIcon = false) {
  return `w-full rounded-xl border border-border bg-surface py-3 text-[14px] text-ink outline-none transition-all placeholder:text-ink-3 hover:border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/15 ${hasIcon ? 'pl-10 pr-11' : 'px-4'}`
}

export function AuthScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeMode: AuthMode = location.pathname === '/signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<AuthMode>(routeMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode(routeMode)
    setError(null)
  }, [routeMode])

  const pageCopy = useMemo(() => mode === 'signin' ? {
    eyebrow: 'Welcome back',
    title: <>Sign in to<br /><em className="font-normal">OpenHouse</em></>,
    description: 'Access your properties, captures, and publishing workspace.',
    action: 'Sign in',
  } : {
    eyebrow: 'Create your account',
    title: <>Create your<br /><em className="font-normal">OpenHouse account</em></>,
    description: 'Build, capture, and publish immersive property experiences from one workspace.',
    action: 'Create account',
  }, [mode])

  const handleDemoSignIn = async () => {
    setError(null)
    setLoading(true)
    const result = await signIn('david@openhouse.com', 'demo1234')
    setLoading(false)
    if (result.error) setError(result.error)
    else navigate('/properties')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError('Enter your work email and password to continue.')
      return
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (mode === 'signup' && !fullName) {
      setError('Enter your first and last name to create an account.')
      return
    }
    setLoading(true)
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, fullName, agencyName)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(mode === 'signin' ? '/properties' : '/setup')
  }

  return <div className="min-h-screen bg-canvas font-sans text-ink selection:bg-primary/20"><div className="grid min-h-screen lg:grid-cols-[minmax(460px,42%)_minmax(0,58%)]">
    <section className="flex min-h-screen flex-col px-7 py-7 sm:px-12 lg:px-16 xl:px-20">
      <header className="flex items-center justify-between"><Link to="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar"><OpenHouseLogoMark className="h-5 w-5" /></span><span className="text-[23px] font-extrabold tracking-tight">OpenHouse</span></Link><Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-primary"><ArrowLeft size={15} /> Back to home</Link></header>
      <main className="my-auto w-full max-w-[480px] py-12"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{pageCopy.eyebrow}</p><h1 className="mt-5 font-serif text-[48px] leading-[0.96] tracking-[-0.04em] text-black sm:text-[56px]">{pageCopy.title}</h1><p className="mt-5 max-w-[390px] text-[16px] leading-relaxed text-ink-2">{pageCopy.description}</p>
        <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
          {error && <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-medium text-danger">{error}</div>}
          {mode === 'signup' && <><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-[12px] font-bold text-ink">First name</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" placeholder="David" className={inputClass()} /></label><label><span className="mb-2 block text-[12px] font-bold text-ink">Last name</span><input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" placeholder="Olabowale" className={inputClass()} /></label></div><label><span className="mb-2 block text-[12px] font-bold text-ink">Agency <span className="font-normal text-ink-3">(optional)</span></span><input value={agencyName} onChange={(event) => setAgencyName(event.target.value)} autoComplete="organization" placeholder="Your brokerage or agency" className={inputClass()} /></label></>}
          <label><span className="mb-2 block text-[12px] font-bold text-ink">Work email</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@brokerage.com" className={inputClass(true)} /></span></label>
          <label><span className="mb-2 block text-[12px] font-bold text-ink">Password</span><span className="relative block"><LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" className={inputClass(true)} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 transition-colors hover:text-ink" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          {mode === 'signup' && <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-2"><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className={password.length >= 8 ? 'text-primary' : 'text-ink-3'} />At least 8 characters</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className={/[A-Z]/.test(password) ? 'text-primary' : 'text-ink-3'} />One uppercase letter</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className={/[0-9]/.test(password) ? 'text-primary' : 'text-ink-3'} />One number</span></div>}
          {mode === 'signin' && <div className="flex items-center justify-between text-[12px]"><label className="inline-flex items-center gap-2 text-ink-2"><input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" /> Remember me</label><span className="text-ink-3">Password recovery coming soon</span></div>}
          <button type="submit" disabled={loading} className="mt-1 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-4 text-[15px] font-bold text-text-inverse shadow-subtle transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait…' : pageCopy.action}<ArrowRight size={18} /></button>
        </form>
        {isDemoMode && mode === 'signin' && <button type="button" onClick={handleDemoSignIn} disabled={loading} className="mt-5 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:bg-raised disabled:opacity-60"><span><span className="block text-[12px] font-bold text-ink">Quick demo login</span><span className="mt-0.5 block text-[11px] text-ink-2">Explore OpenHouse with a demo account</span></span><span className="text-[12px] font-bold text-primary">Use demo account <ArrowRight size={14} className="ml-1 inline" /></span></button>}
        <p className="mt-7 text-center text-[13px] text-ink-2">{mode === 'signin' ? <>Don’t have an account? <Link to="/signup" className="font-bold text-primary underline underline-offset-4">Sign up</Link></> : <>Already have an account? <Link to="/login" className="font-bold text-primary underline underline-offset-4">Sign in</Link></>}</p>
        {mode === 'signup' && <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-3">By creating an account, you agree to OpenHouse’s <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.</p>}
      </main>
      <footer className="text-[11px] text-ink-3">© {new Date().getFullYear()} OpenHouse</footer>
    </section>
    <aside className="relative hidden overflow-hidden bg-[#f5f0e7] lg:block"><img src={imgPointCloudDoorway} alt="A doorway into an OpenHouse property experience" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute right-14 top-28 font-mono text-[11px] leading-6 tracking-tight text-ink/80"><p>PROPERTY&nbsp; / &nbsp;OH-00241</p><p>SPACES&nbsp;&nbsp;&nbsp; / &nbsp;07</p><p>EVIDENCE&nbsp; / &nbsp;VERIFIED</p><p>STATUS&nbsp;&nbsp;&nbsp; / &nbsp;READY</p><span className="mt-3 block h-px w-7 bg-primary" /></div></aside>
  </div></div>
}
