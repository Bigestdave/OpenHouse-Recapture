import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { WizardShell, WizardTitle } from '../components/WizardShell'
import { UploadCloud, PlusIcon } from '../components/icons2'
import propAdmiralty from '../assets/prop-admiralty.jpg'
import { addProperty } from '../data/store'
import { startPropertyWorkflow } from '../data/workflow'
import type { Space } from '../data/types'

export function CreateShowCharactersScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({})

  const initialProposal = location.state?.proposal || {
    title: '8 Admiralty Way',
    premise: 'Luxury 3-bedroom waterfront apartment with expansive terrace views over Five Cowries Creek, Lekki, Lagos.',
    visual_style: { animation_style: 'Interactive 3D Walkthrough + Spatial Navigation' },
    characters: [
      { id: 'c1', name: 'Living Room & Balcony', canonical_description: 'Open plan living area with floor-to-ceiling glass doors connecting to ocean balcony.' },
      { id: 'c2', name: 'Fitted Kitchen', canonical_description: 'Contemporary marble island with integrated appliances and direct breakfast bar.' },
      { id: 'c3', name: 'Master Suite', canonical_description: 'Spacious master bedroom with en-suite bath and unobstructed water view.' }
    ]
  }

  const [proposal, setProposal] = useState(initialProposal)
  const [refFiles, setRefFiles] = useState<Record<number, File[]>>({})
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleUpdateChar = (index: number, field: string, value: string) => {
    const updated = [...proposal.characters]
    updated[index] = { ...updated[index], [field]: value }
    setProposal({ ...proposal, characters: updated })
  }

  const handleRemoveChar = (index: number) => {
    setProposal({
      ...proposal,
      characters: proposal.characters.filter((_: any, i: number) => i !== index),
    })
  }

  const handleFiles = (index: number, fileList: FileList | null) => {
    if (!fileList) return
    const images = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (images.length) {
      setRefFiles((prev) => ({ ...prev, [index]: [...(prev[index] || []), ...images].slice(0, 4) }))
    }
  }

  const handleCreateShow = async () => {
    setLoading(true)
    setError(null)
    try {
      setProgress('OpenHouse is structuring property spaces…')
      
      const formattedSpaces: Space[] = proposal.characters.map((char: any, idx: number) => ({
        id: `space-${Date.now()}-${idx}`,
        name: char.name || `Space 0${idx + 1}`,
        captured: idx !== 0, // First space or balcony pending to demo the autonomous attention loop
        verified: false,
        issues: [],
      }))

      const newProp = addProperty({
        title: proposal.title || '8 Admiralty Way',
        address: 'Lekki Phase 1, Lagos',
        price: '₦8,000,000 / year',
        type: '3-bedroom apartment',
        bedrooms: 3,
        bathrooms: 3,
        description: proposal.premise || 'Luxury waterfront apartment in Lekki.',
        status: 'detected',
        spaces: formattedSpaces,
        sourceMedia: [],
        timeline: [],
        coverImage: propAdmiralty,
        workspaceId: 'default',
      })

      // Start autonomous pipeline
      startPropertyWorkflow(newProp.id)

      setTimeout(() => {
        setLoading(false)
        navigate(`/property/${newProp.id}`)
      }, 600)
    } catch (err) {
      console.error(err)
      navigate('/properties')
    }
  }

  return (
    <WizardShell
      step={3}
      footerLeft={
        <Link
          to="/create-show/style"
          state={{ proposal }}
          className="rounded-lg border border-border bg-surface px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-raised-2 shadow-subtle"
        >
          Back
        </Link>
      }
      footerRight={
        <div className="flex items-center gap-4">
          {error && <p className="text-[13.5px] text-danger">{error}</p>}
          {loading && progress && <p className="text-[13.5px] text-primary font-semibold animate-pulse">{progress}</p>}
          <button
            onClick={handleCreateShow}
            disabled={loading || proposal.characters.length === 0}
            className="flex items-center gap-2.5 rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:opacity-50 shadow-subtle"
          >
            {loading ? 'Publishing…' : 'Publish property'}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M11 4.5L16.5 10 11 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      }
    >
      <WizardTitle
        title="Verify property spaces & coverage"
        subtitle="Confirm the identified spaces or upload additional photos and floor plan captures to finalize your property."
      />
      <div className="mx-auto max-w-[1080px] px-6 font-sans text-ink">
        {proposal.characters.map((char: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-border bg-surface p-6 mb-8 shadow-subtle">
            <div className="flex items-center justify-between pb-5 border-b border-border mb-5">
              <p className="text-[16px] font-bold text-ink">Space 0{idx + 1}</p>
              <button
                onClick={() => handleRemoveChar(idx)}
                className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-ink-3 transition-colors hover:bg-raised-2 hover:text-ink shadow-subtle"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">
              {/* Left: upload + reference thumbs */}
              <div>
                <input
                  ref={(el) => { fileInputs.current[idx] = el }}
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(idx, e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputs.current[idx]?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFiles(idx, e.dataTransfer.files)
                  }}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-9 bg-canvas/40 transition-colors hover:border-primary cursor-pointer"
                >
                  <UploadCloud size={28} className="text-ink-2" />
                  <p className="text-[15px] font-semibold text-ink">Upload space footage (optional)</p>
                  <p className="text-[13.5px] text-ink-2">
                    Drag captures here or <span className="text-primary font-semibold">choose files</span>
                  </p>
                  <p className="text-[12px] text-ink-3">OpenHouse will reconstruct this space from your captures</p>
                </button>
                {(refFiles[idx]?.length ?? 0) > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {refFiles[idx].map((file, fi) => (
                      <div key={fi} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-20 w-20 rounded-lg border border-border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRefFiles((prev) => ({ ...prev, [idx]: prev[idx].filter((_, i) => i !== fi) }))
                          }
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[11px] text-ink-2 hover:text-ink shadow-subtle"
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: name, description */}
              <div className="space-y-4">
                <div>
                  <p className="pb-1.5 text-[13px] font-semibold text-ink">Space Name</p>
                  <input
                    value={char.name}
                    onChange={(e) => handleUpdateChar(idx, 'name', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary shadow-subtle"
                  />
                </div>

                <div>
                  <p className="pb-1.5 text-[13px] font-semibold text-ink">Space Notes & Dimensions</p>
                  <textarea
                    rows={4}
                    value={char.canonical_description}
                    onChange={(e) => handleUpdateChar(idx, 'canonical_description', e.target.value)}
                    className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink leading-relaxed outline-none transition-colors focus:border-primary shadow-subtle"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {proposal.characters.length === 0 && (
          <div className="mb-8 rounded-xl border border-border bg-surface py-12 text-center text-sm text-ink-2 shadow-subtle">
            No spaces were configured. Add at least one space to continue.
          </div>
        )}

        <button
          type="button"
          onClick={() => setProposal({ ...proposal, characters: [...proposal.characters, { name: '', canonical_description: '' }] })}
          className="mt-2 flex items-center gap-2 text-sm text-primary font-bold hover:underline"
        >
          <PlusIcon size={16} />
          <span>Add another space</span>
        </button>
      </div>
    </WizardShell>
  )
}
