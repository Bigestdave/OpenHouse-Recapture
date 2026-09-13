import { useState } from 'react'
import { getArtifactDownloadUrl } from '../data/api'
import { CloseIcon, ChevronDown, CheckCircleSolid } from './icons'

interface ExportModalProps {
  onClose: () => void
  episodeTitle?: string | null
  episodeNumber?: number | string | null
  artifactId?: string | null
  duration?: string
  aspectRatio?: string
}

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex items-center gap-3 py-1.5 text-[15px]">
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-colors ${
          checked ? 'border-accent bg-accent' : 'border-line bg-transparent'
        }`}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="#101300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}

function Select({ value }: { value: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg border border-line bg-raised px-4 py-2.5 text-[15px] transition-colors hover:border-ink-3">
      {value}
      <ChevronDown className="text-ink-3" />
    </button>
  )
}

export function ExportModal({
  onClose,
  episodeTitle,
  episodeNumber,
  artifactId,
  duration,
  aspectRatio = '4K UHD (3840 × 2160)',
}: ExportModalProps) {
  const [include, setInclude] = useState({ video: true, thumbnail: true, storyboard: false, report: false })
  const [exported, setExported] = useState(false)
  const [copied, setCopied] = useState(false)
  const toggle = (k: keyof typeof include) => setInclude((p) => ({ ...p, [k]: !p[k] }))

  const epNumStr = episodeNumber ? String(episodeNumber).padStart(2, '0') : '01'
  const displayTitle = episodeTitle ? episodeTitle : `Spatial Walkthrough ${epNumStr}`
  const filename = episodeTitle
    ? `${episodeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-walkthrough.mp4`
    : `openhouse-property-walkthrough-${epNumStr}.mp4`

  const handleDownload = () => {
    const url = getArtifactDownloadUrl(artifactId)
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    onClose()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6" onClick={onClose}>
      <div className="flex w-[460px] flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        {!exported ? (
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-overlay text-ink">
            <div className="flex items-start justify-between">
              <h2 className="text-[20px] font-semibold tracking-tight truncate max-w-[360px]">Export {displayTitle}</h2>
              <button onClick={onClose} className="mt-1 text-ink-3 transition-colors hover:text-ink" aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <p className="pt-1.5 text-[14px] text-ink-2">Choose what to include in your property presentation package.</p>

            <div className="flex items-center gap-4 pt-6">
              <span className="w-[100px] text-[14px] font-medium text-ink-2">Resolution</span>
              <Select value={aspectRatio} />
            </div>
            <div className="flex items-center gap-4 pt-3">
              <span className="w-[100px] text-[14px] font-medium text-ink-2">Format</span>
              <Select value="WebGL 3D + MP4 H.265" />
            </div>

            <p className="pt-5 text-[14px] font-medium text-ink-2">Include in bundle</p>
            <div className="flex flex-col pt-1">
              <Checkbox checked={include.video} label="Interactive 3D Walkthrough & Video" onChange={() => toggle('video')} />
              <Checkbox checked={include.thumbnail} label="High-Resolution Cover Artwork" onChange={() => toggle('thumbnail')} />
              <Checkbox checked={include.storyboard} label="2D Floorplan Overlay Map" onChange={() => toggle('storyboard')} />
              <Checkbox checked={include.report} label="Spatial Dimension & Area Report" onChange={() => toggle('report')} />
            </div>

            <button className="mt-5 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-raised shadow-subtle">
              <span>Advanced embed & hosting settings</span>
              <ChevronDown className="text-ink-3" />
            </button>

            <div className="flex justify-end gap-3 pt-6">
              <button onClick={onClose} className="rounded-lg border border-line bg-surface px-5 py-2.5 text-[14.5px] font-medium text-ink transition-colors hover:bg-raised shadow-subtle">
                Cancel
              </button>
              <button
                onClick={() => setExported(true)}
                className="rounded-lg bg-ink px-6 py-2.5 text-[14.5px] font-medium text-white transition-colors hover:bg-ink/90 shadow-subtle"
              >
                Export package
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-7 text-center shadow-overlay text-ink">
            <div className="flex items-center justify-center gap-3">
              <span className="text-accent"><CheckCircleSolid size={26} /></span>
              <h2 className="text-[20px] font-semibold">Experience Package Ready</h2>
            </div>
            <p className="pt-4 text-[14.5px] font-medium truncate text-ink">{filename}</p>
            <p className="pt-1 text-[13.5px] text-ink-2">
              {aspectRatio} {duration ? <><span className="px-1 text-ink-3">·</span> {duration}</> : null}
            </p>

            <div className="flex justify-center gap-3 pt-6">
              <button
                onClick={handleCopyLink}
                className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-raised shadow-subtle"
              >
                {copied ? 'Copied link! ✓' : 'Copy Client Share Link'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-ink/90 shadow-subtle"
              >
                Download Package
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
