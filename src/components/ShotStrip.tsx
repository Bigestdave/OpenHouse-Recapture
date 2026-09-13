import { useEffect, useState, useMemo, type ReactNode } from 'react'

import { getArtifactDownloadUrl } from '../data/api'
import { shots as fixtureShots, shotGradients, type ShotStatus } from '../data/shots'
import { StatusIcon } from './StatusIcon'

export interface StripShot {
  id: string
  sequence_number?: number
  story_function?: string
  duration_seconds?: number
  approved_storyboard_artifact_id?: string | null
  approved_keyframe_artifact_id?: string | null
  approved_video_artifact_id?: string | null
}

const fallbackShots: StripShot[] = fixtureShots.map((shot, index) => ({
  id: shot.id,
  sequence_number: index + 1,
  story_function: shot.name,
  duration_seconds: shot.sec,
}))

function shotLabel(shot: StripShot) {
  return shot.sequence_number ? `S${String(shot.sequence_number).padStart(2, '0')}` : shot.id
}

function shotTime(shot: StripShot) {
  return `00:${String(Math.round(shot.duration_seconds || 0)).padStart(2, '0')}`
}

export function Thumb({
  shotId,
  artifactId,
  className = '',
}: {
  shotId: string
  artifactId?: string | null
  className?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const artifactUrl = getArtifactDownloadUrl(artifactId)

  useEffect(() => {
    setImageFailed(false)
    setImageLoaded(false)
  }, [artifactUrl])

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{ background: shotGradients[shotId] ?? shotGradients.S01 }}
      role="img"
      aria-label={`${shotId} thumbnail`}
    >
      {artifactUrl && !imageFailed && (
        <img
          key={artifactUrl}
          src={artifactUrl}
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-150 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  )
}

export type StripStatuses = Record<string, ShotStatus>

interface TextStripProps {
  shots?: StripShot[]
  statuses: StripStatuses
  selected?: string
  onSelect?: (id: string) => void
}

/** Text-only strip cards (Plan screen): shot / narrative function / duration. */
export function TextShotStrip({ shots = fallbackShots, statuses, selected, onSelect }: TextStripProps) {
  const uniqueShots = useMemo(() => {
    const seen = new Set<string>()
    return shots.filter((s) => {
      const key = s.sequence_number ? `seq_${s.sequence_number}` : s.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [shots])

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {uniqueShots.map((shot: StripShot) => {
        const isSelected = selected === shot.id
        return (
          <button
            key={shot.id}
            onClick={() => onSelect?.(shot.id)}
            className={`min-w-[130px] flex-1 shrink-0 rounded-xl border p-3.5 text-left transition-all ${
              isSelected ? 'border-accent bg-surface shadow-[0_0_0_2px_var(--color-accent)]' : 'border-line bg-surface hover:bg-raised shadow-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">{shotLabel(shot)}</span>
              <StatusIcon status={statuses[shot.id] ?? 'pending'} size={15} />
            </div>
            <p className="mt-2 truncate text-[13px] font-medium text-ink-2">{shot.story_function || 'Space walkthrough'}</p>
            <p className="mt-0.5 text-[12px] text-ink-3">{shot.duration_seconds || 0} sec</p>
          </button>
        )
      })}
    </div>
  )
}

interface ThumbStripProps {
  shots?: StripShot[]
  statuses: StripStatuses
  selected?: string
  onSelect?: (id: string) => void
  /** 'name-time': label + 00:0X · 'time': 00:0X · 'name-sec': label + N sec · 'plain': duration only */
  variant?: 'name-time' | 'time' | 'name-sec' | 'plain'
  footer?: (shotId: string) => ReactNode
  caption?: (shotId: string) => ReactNode
}

/** Thumbnail strip cards used by production stages. Uses API shots when supplied. */
export function ThumbShotStrip({ shots = fallbackShots, statuses, selected, onSelect, variant = 'name-time', footer, caption }: ThumbStripProps) {
  const uniqueShots = useMemo(() => {
    const seen = new Set<string>()
    return shots.filter((s) => {
      const key = s.sequence_number ? `seq_${s.sequence_number}` : s.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [shots])

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {uniqueShots.map((shot: StripShot) => {
        const isSelected = selected === shot.id
        const artifactId = shot.approved_video_artifact_id || shot.approved_keyframe_artifact_id || shot.approved_storyboard_artifact_id
        return (
          <button
            key={shot.id}
            onClick={() => onSelect?.(shot.id)}
            className={`min-w-[125px] flex-1 shrink-0 relative rounded-xl border p-[5px] pb-2 text-left transition-all ${
              isSelected
                ? 'border-accent bg-surface shadow-[0_0_0_2px_var(--color-accent)]'
                : 'border border-line bg-surface hover:bg-raised shadow-subtle'
            }`}
          >
            <Thumb
              shotId={shotLabel(shot)}
              artifactId={artifactId}
              className="mb-2 aspect-[16/10] w-full rounded-lg border border-line"
            />

            <div className="flex items-center justify-between px-1">
              <span className="text-[13.5px] font-semibold text-ink">{shotLabel(shot)}</span>
              <StatusIcon status={statuses[shot.id] ?? 'pending'} size={14} />
            </div>

            <div className="px-1 pt-1 text-[12px] leading-tight text-ink-2">
              {variant === 'name-time' && (
                <>
                  <p className="truncate text-ink font-medium">{shot.story_function || 'Space walkthrough'}</p>
                  <p className="pt-0.5 text-ink-3">{shotTime(shot)}</p>
                </>
              )}
              {variant === 'time' && <p className="text-ink-3">{shotTime(shot)}</p>}
              {variant === 'name-sec' && (
                <>
                  <p className="truncate text-ink font-medium">{shot.story_function || 'Space walkthrough'}</p>
                  <p className="pt-0.5 text-ink-3">{shot.duration_seconds || 0} sec</p>
                </>
              )}
              {variant === 'plain' && <p className="text-ink-3">{shot.duration_seconds || 0} sec</p>}
            </div>
            {caption?.(shot.id)}
            {footer?.(shot.id)}
          </button>
        )
      })}
    </div>
  )
}

