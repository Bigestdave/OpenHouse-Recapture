import { useMemo } from 'react'

/** Deterministic pseudo-random for stable waveforms across renders */
function prng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

interface WaveformProps {
  bars?: number
  height?: number
  color?: string
  seed?: number
  /** 'full' dense waveform, 'sparse' occasional tick marks (Expressions/SFX rows) */
  mode?: 'full' | 'sparse'
  /** envelope shaping: peak in middle */
  envelope?: boolean
  className?: string
}

export function Waveform({ bars = 160, height = 44, color = 'var(--color-accent)', seed = 7, mode = 'full', envelope = true, className = '' }: WaveformProps) {
  const heights = useMemo(() => {
    const rand = prng(seed)
    return Array.from({ length: bars }, (_, i) => {
      if (mode === 'sparse') {
        return rand() > 0.88 ? 0.4 + rand() * 0.6 : 0
      }
      const env = envelope ? 0.35 + 0.65 * Math.sin((i / bars) * Math.PI) : 1
      return (0.15 + rand() * 0.85) * env
    })
  }, [bars, seed, mode, envelope])

  const w = 3
  const gap = 1.5
  const totalW = bars * (w + gap)

  return (
    <svg viewBox={`0 0 ${totalW} ${height}`} preserveAspectRatio="none" className={className} style={{ height, width: '100%' }} aria-hidden>
      {heights.map((h, i) =>
        h === 0 ? null : (
          <rect
            key={i}
            x={i * (w + gap)}
            y={(height - h * height) / 2}
            width={w}
            height={Math.max(h * height, 1.5)}
            rx={1}
            fill={color}
          />
        ),
      )}
    </svg>
  )
}
