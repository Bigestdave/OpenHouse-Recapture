import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { WizardShell, WizardTitle, Field, TextInput, TextArea } from '../components/WizardShell'
import imgCapture3D from '../assets/capture-3d-walkthrough.jpg'
import imgCapturePanoramic from '../assets/capture-panoramic-tour.jpg'

const styles = [
  {
    id: 'lidar',
    title: 'Interactive 3D Walkthrough + Spatial Navigation',
    lines: ['Gaussian Splatting + Room Alignment', 'Fluid real-time room navigation on web & mobile'],
    image: imgCapture3D,
    imageAlt: 'High-density spatial capture of property',
    recommended: true,
  },
  {
    id: 'panoramic',
    title: 'High-Resolution 360° Guided Spatial Tour',
    lines: ['High dynamic range photography', 'Accurate room dimension verification'],
    image: imgCapturePanoramic,
    imageAlt: 'High-resolution panoramic spatial capture',
    recommended: false,
  },
]

/** creative_direction may arrive as a string or an object like {colors: "..."} — render it as text either way. */
function creativeDirectionText(cd: unknown): string {
  if (!cd) return 'Natural coastal daylight, polished travertine surfaces, contemporary warm oak cabinetry'
  if (typeof cd === 'string') return cd
  if (typeof cd === 'object') {
    const vals = Object.values(cd as Record<string, unknown>).filter((v) => typeof v === 'string')
    return vals.join('. ')
  }
  return 'Natural coastal daylight, polished travertine surfaces, contemporary warm oak cabinetry'
}

export function CreateShowStyleScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // The proposal object from the previous screen
  const initialProposal = location.state?.proposal || {}
  
  const [selectedStyle, setSelectedStyle] = useState('lidar')
  const [proposal, setProposal] = useState({
    title: initialProposal.title || '8 Admiralty Way',
    premise: initialProposal.premise || 'Luxury 3-bedroom waterfront apartment with expansive terrace views over Five Cowries Creek, Lekki, Lagos.',
    visual_style: initialProposal.visual_style || { creative_direction: {} },
    characters: initialProposal.characters || [
      { id: 'c1', name: 'Living Room & Balcony', canonical_description: 'Open plan living area with floor-to-ceiling glass doors connecting to ocean balcony.' },
      { id: 'c2', name: 'Fitted Kitchen', canonical_description: 'Contemporary marble island with integrated appliances and direct breakfast bar.' },
      { id: 'c3', name: 'Master Suite', canonical_description: 'Spacious master bedroom with en-suite bath and unobstructed water view.' }
    ]
  })

  // Preselect style if it matches
  useEffect(() => {
    if (proposal.visual_style?.animation_style?.toLowerCase().includes('360')) {
      setSelectedStyle('panoramic')
    }
  }, [proposal])

  const handleContinue = () => {
    const styleTitle = styles.find((s) => s.id === selectedStyle)?.title || 'Interactive 3D Walkthrough + Spatial Navigation'
    const merged = {
      ...proposal,
      visual_style: { ...proposal.visual_style, animation_style: styleTitle },
    }
    navigate('/create-show/characters', { state: { proposal: merged } })
  }

  return (
    <WizardShell
      step={2}
      footerLeft={
        <Link
          to="/create-show"
          className="rounded-lg border border-border bg-surface px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-raised-2 shadow-subtle"
        >
          Back
        </Link>
      }
      footerRight={
        <button
          onClick={handleContinue}
          className="flex items-center gap-2.5 rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover shadow-subtle"
        >
          Continue to Publish
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 4.5L16.5 10 11 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      }
    >
      <WizardTitle 
        title="Review property details" 
        subtitle="OpenHouse has structured your property details. Select your capture method below." 
      />
      <div className="mx-auto max-w-[820px] px-6 font-sans text-ink">
        
        <div className="mx-auto max-w-[680px] pb-8 space-y-4">
          <Field label="Property Title">
            <TextInput 
              value={proposal.title}
              onChange={(v) => setProposal({...proposal, title: v})}
            />
          </Field>
          <Field label="Property Description & Address">
            <TextArea 
              value={proposal.premise}
              onChange={(v) => setProposal({...proposal, premise: v})}
              rows={4}
            />
          </Field>
          <Field label="Lighting & Architectural Features">
            <TextArea
              value={creativeDirectionText(proposal.visual_style?.creative_direction)}
              onChange={(v) => setProposal({
                ...proposal,
                visual_style: { ...proposal.visual_style, creative_direction: v }
              })}
              rows={3}
            />
          </Field>
        </div>

        <p className="pb-4 text-[14px] text-ink-2 font-medium text-center">Capture Method</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
          {styles.map((s) => {
            const isSel = selectedStyle === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStyle(s.id)}
                className={`relative overflow-hidden rounded-xl border text-left transition-all shadow-subtle ${
                  isSel
                    ? 'border-primary bg-surface ring-2 ring-primary'
                    : 'border-border bg-surface hover:border-line-strong'
                }`}
              >
                {s.recommended && (
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-accent px-2.5 py-1 text-[12px] font-bold text-white shadow-subtle">
                    Recommended
                  </span>
                )}
                <img src={s.image} alt={s.imageAlt} className="aspect-video w-full object-cover" />
                <div className="flex items-start justify-between p-5 bg-surface">
                  <div>
                    <p className="text-[16px] font-bold text-ink">{s.title}</p>
                    <p className="pt-1.5 text-[13px] leading-relaxed text-ink-2">
                      {s.lines[0]}<br />{s.lines[1]}
                    </p>
                  </div>
                  <span
                    className={`mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSel ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}
                  >
                    {isSel && (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M3.2 7.3l2.6 2.6 5-5.4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </WizardShell>
  )
}
