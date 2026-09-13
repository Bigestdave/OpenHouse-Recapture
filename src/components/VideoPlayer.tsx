import { useState, useRef, useEffect } from 'react'
import { getArtifactDownloadUrl } from '../data/api'
import { Thumb } from './ShotStrip'
import { Play, Pause, VolumeIcon, FullscreenIcon } from './icons'

interface VideoPlayerProps {
  shotId: string
  artifactId?: string | null
  current?: string
  total?: string
  /** 0..100 played percentage override if desired */
  progress?: number
  overlayLabel?: string
  aspect?: string
  /** Override the outer wrapper — use to constrain width so the portrait aspect fits on screen */
  className?: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  shotId,
  artifactId,
  overlayLabel,
  aspect = 'aspect-[9/16]',
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const videoUrl = getArtifactDownloadUrl(artifactId)

  useEffect(() => {
    setVideoFailed(false)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [videoUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      video.play().then(() => setPlaying(true)).catch(console.error)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newFraction = Math.max(0, Math.min(1, clickX / rect.width))
    video.currentTime = newFraction * duration
    setCurrentTime(video.currentTime)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error)
      } else {
        videoRef.current.requestFullscreen().catch(console.error)
      }
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`overflow-hidden rounded-xl bg-black ${className}`}>
      <div className={`relative ${aspect} w-full cursor-pointer`} onClick={togglePlay}>
        {videoUrl && !videoFailed ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
            onError={() => setVideoFailed(true)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <Thumb shotId={shotId} className="absolute inset-0 h-full w-full rounded-none" />
        )}
        {overlayLabel && (
          <p className="absolute left-4 top-3 rounded-md bg-black/40 px-2.5 py-1 text-[13px] font-medium backdrop-blur-sm pointer-events-none">
            {overlayLabel}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 bg-surface border-t border-line">
        <button
          onClick={togglePlay}
          className="text-ink transition-colors hover:text-accent p-1"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span className="text-[12.5px] tabular-nums select-none min-w-[75px]">
          <span className="text-accent font-semibold">{formatTime(currentTime)}</span>
          <span className="text-ink-3"> / {formatTime(duration)}</span>
        </span>
        <div
          onClick={handleSeek}
          className="relative h-[6px] flex-1 cursor-pointer rounded-full bg-raised hover:h-[8px] transition-all"
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progressPercent}%` }}
          />
          <span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ink shadow-subtle"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
        </div>
        <button
          onClick={toggleMute}
          className={`p-1 transition-colors ${muted ? 'text-accent' : 'text-ink-2 hover:text-ink'}`}
          aria-label="Volume"
        >
          <VolumeIcon />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-1 text-ink-2 transition-colors hover:text-ink"
          aria-label="Fullscreen"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  )
}
