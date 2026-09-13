import { CheckCircleSolid, DotSolid, CircleOutline, Spinner, WarnCircle } from './icons'
import type { ShotStatus } from '../data/shots'

export function StatusIcon({ status, size = 18 }: { status: ShotStatus; size?: number }) {
  switch (status) {
    case 'approved': return <CheckCircleSolid size={size} />
    case 'active': return <DotSolid size={size} />
    case 'warning': return <WarnCircle size={size} />
    case 'generating': return <Spinner size={size} />
    default: return <CircleOutline size={size} />
  }
}
