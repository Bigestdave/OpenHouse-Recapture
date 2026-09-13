import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardShell, WizardTitle, Field, TextArea, SelectInput } from '../components/WizardShell'
import { generateShowProposal, generateIdea } from '../data/api'

const PROPERTY_TYPES = ['Apartment', 'Terrace Duplex', 'Detached House', 'Penthouse', 'Maisonette']
const LOCATIONS = ['Lekki Phase 1, Lagos', 'Ikoyi, Lagos', 'Victoria Island, Lagos', 'Banana Island, Lagos']
const BEDROOMS = ['1-Bedroom', '2-Bedroom', '3-Bedroom', '4-Bedroom', '5+ Bedroom']
const MARKETS = ['Luxury Residential', 'Short-let Investment', 'Executive Rental', 'Family Residence']

export function CreateShowBasicsScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [sparking, setSparking] = useState(false)
  const [formData, setFormData] = useState({
    genre: 'Apartment',
    animation_style: '3-Bedroom',
    tone: 'Lekki Phase 1, Lagos',
    target_audience: 'Luxury Residential',
    default_duration_seconds: 60,
    idea_seed: '8 Admiralty Way, 3-bedroom luxury waterfront apartment with panoramic balcony view and private elevator.'
  })

  const handleSpark = async () => {
    setSparking(true)
    try {
      const result = await generateIdea(formData.genre, formData.tone)
      setFormData({ ...formData, idea_seed: result.idea })
    } catch {
      setFormData({
        ...formData,
        idea_seed: 'Orchid Apartments, Unit 4 — contemporary 2-bedroom residence with open-plan kitchen and private balcony in Lekki, Lagos.'
      })
    } finally {
      setSparking(false)
    }
  }

  const handleGenerate = async () => {
    if (!formData.idea_seed) return
    setLoading(true)
    try {
      const proposal = await generateShowProposal(formData)
      navigate('/create-show/style', { state: { proposal } })
    } catch {
      // Fallback smooth navigation for demo
      const proposal = {
        title: '8 Admiralty Way',
        premise: formData.idea_seed,
        visual_style: {
          animation_style: 'LiDAR + High-Res Capture',
          creative_direction: { colors: 'Natural Daylight, Warm Wood, Travertine' },
          negative_prompt: 'No fisheye distortion, low lighting, obstructed angles',
        },
      }
      navigate('/create-show/style', { state: { proposal } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <WizardShell
      step={1}
      footerRight={
        <button
          onClick={handleGenerate}
          disabled={loading || !formData.idea_seed}
          className="flex items-center gap-2.5 rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:opacity-50 shadow-subtle"
        >
          {loading ? 'OpenHouse is preparing property details…' : 'Continue to Capture'}
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 4.5L16.5 10 11 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      }
    >
      <WizardTitle 
        title="Add a new property" 
        subtitle="Provide the property specifications and address to organize your spatial captures." 
        info 
      />
      <div className="mx-auto max-w-[680px] px-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Property Type">
            <SelectInput
              value={formData.genre}
              options={PROPERTY_TYPES}
              onChange={(v) => setFormData({...formData, genre: v || 'Apartment'})}
            />
          </Field>
          <Field label="Location / Area">
            <SelectInput
              value={formData.tone}
              options={LOCATIONS}
              onChange={(v) => setFormData({...formData, tone: v || 'Lekki Phase 1, Lagos'})}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Bedrooms & Configuration">
            <SelectInput
              value={formData.animation_style}
              options={BEDROOMS}
              onChange={(v) => setFormData({...formData, animation_style: v || '3-Bedroom'})}
            />
          </Field>
          <Field label="Target Category">
            <SelectInput
              value={formData.target_audience}
              options={MARKETS}
              onChange={(v) => setFormData({...formData, target_audience: v || 'Luxury Residential'})}
            />
          </Field>
        </div>

        <Field label="Property Title & Key Details">
          <TextArea
            value={formData.idea_seed}
            onChange={(v) => setFormData({...formData, idea_seed: v || ''})}
            placeholder="e.g. 8 Admiralty Way, 3-bedroom apartment with sea view balcony in Lekki, Lagos"
            rows={4}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[13px] text-ink-3">
              {sparking
                ? 'OpenHouse is generating property highlights…'
                : 'Need suggested details? Click suggest description to autofill Lagos property highlights.'}
            </p>
            <button
              type="button"
              onClick={handleSpark}
              disabled={sparking}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-[14px] font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-50 shadow-subtle"
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l1.8 4.6L16.5 8l-4.7 1.4L10 14l-1.8-4.6L3.5 8l4.7-1.4L10 2z" fill="currentColor" />
                <path d="M15.5 12.5l.9 2.3 2.1.7-2.1.7-.9 2.3-.9-2.3-2.1-.7 2.1-.7.9-2.3z" fill="currentColor" opacity="0.7" />
              </svg>
              {sparking ? 'Suggesting…' : 'Suggest description'}
            </button>
          </div>
        </Field>
      </div>
    </WizardShell>
  )
}
