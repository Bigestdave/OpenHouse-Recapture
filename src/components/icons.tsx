import type { SVGProps } from 'react'
import {
  CheckCircle as IconoirCheckCircle,
  CheckCircleSolid as IconoirCheckCircleSolid,
  Circle as IconoirCircle,
  WarningTriangle as IconoirWarningTriangle,
  WarningCircle as IconoirWarningCircle,
  NavArrowLeft,
  NavArrowRight,
  NavArrowDown,
  Pause as IconoirPause,
  Play as IconoirPlay,
  MoreHoriz,
  Page,
  MusicDoubleNote,
  Leaf as IconoirLeaf,
  FaceId,
  Flash,
  SoundHigh,
  Expand,
  Xmark,
  Settings as IconoirSettings,
  Sparks,
  User as IconoirUser,
  SunLight,
  Voice,
  HandCard,
} from 'iconoir-react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  strokeWidth?: number
}

export function CheckCircle({ size = 18, className = 'text-accent', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCheckCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CheckCircleSolid({ size = 18, className = 'text-accent', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCheckCircleSolid width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function DotSolid({ size = 8, className = 'text-accent' }: IconProps) {
  return (
    <span
      className={`inline-block rounded-full bg-current ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function CircleOutline({ size = 18, className = 'text-ink-3', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function WarnTriangle({ size = 18, className = 'text-warn', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirWarningTriangle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function WarnCircle({ size = 18, className = 'text-warn', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirWarningCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function Spinner({ size = 16, className = 'text-accent' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      style={{ animationDuration: '1.2s' }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="14 8" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

export function ArrowLeft({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <NavArrowLeft width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ChevronRight({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <NavArrowRight width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ChevronDown({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <NavArrowDown width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function Pause({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirPause width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function Play({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirPlay width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function Ellipsis({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <MoreHoriz width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function DocIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Page width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function MusicNote({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <MusicDoubleNote width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function LeafIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirLeaf width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function FaceIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <FaceId width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function BoltIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Flash width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function VolumeIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SoundHigh width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function FullscreenIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Expand width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CloseIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Xmark width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SlidersIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirSettings width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SparkleIcon({ size = 18, className = 'text-accent', strokeWidth = 1.5, ...props }: IconProps) {
  return <Sparks width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PersonIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirUser width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SunIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SunLight width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function WaveIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Voice width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function HandIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <HandCard width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}
