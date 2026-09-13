/* Icons for workspace shell + hubs + dashboard screens using authentic Iconoir */

import type { SVGProps } from 'react'
import {
  Plus,
  Bell,
  ViewGrid,
  MediaVideo,
  Folder,
  StatsReport,
  Settings,
  Search,
  CloudUpload,
  InfoCircle as IconoirInfoCircle,
  Clock as IconoirClock,
  Phone as IconoirPhone,
  Group,
  Refresh,
  MagicWand,
  Crop,
  VideoCamera,
  Box3dPoint,
  CheckSquare,
  Activity as IconoirActivity,
  Copy as IconoirCopy,
  ShareAndroid,
  MapPin,
  Eye as IconoirEye,
  Lock as IconoirLock,
  Trash as IconoirTrash,
  EditPencil,
  Download as IconoirDownload,
  QrCode as IconoirQrCode,
  SendMail,
  Calendar as IconoirCalendar,
  BadgeCheck,
  SmartphoneDevice,
  Globe as IconoirGlobe,
  ShieldCheck,
  Suitcase,
  Camera as IconoirCamera,
  Star as IconoirStar,
  CreditCard as IconoirCreditCard,
  LightBulb as IconoirLightBulb,
  Link as IconoirLink,
  User as IconoirUser,
  Xmark,
  SoundHigh,
  SoundOff,
  ChatBubble,
  SendDiagonal,
  NavArrowUp,
  Check,
  CheckCircle,
  Play,
  Pause,
  Message,
  HelpCircle,
  Walking,
  ArrowRight,
  Square,
} from 'iconoir-react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  strokeWidth?: number
}

export function PlusIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Plus width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function BellIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Bell width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function GridIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ViewGrid width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function FilmIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <MediaVideo width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function FolderIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Folder width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function UsageIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <StatsReport width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function GearIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Settings width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SearchIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Search width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function UploadCloud({ size = 22, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <CloudUpload width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function InfoCircle({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirInfoCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ClockIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirClock width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PhoneIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirPhone width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PeopleIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Group width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function LoopIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Refresh width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function WandIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <MagicWand width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function FramePlaceholder({ size = 20, className = 'text-ink-4', strokeWidth = 1.5, ...props }: IconProps) {
  return <Crop width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CaptureRequestsIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <VideoCamera width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CubeIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Box3dPoint width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ApprovalsIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <CheckSquare width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ActivityIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirActivity width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function TeamIcon({ size = 18, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Group width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CopyIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCopy width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ShareIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ShareAndroid width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function MapPinIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <MapPin width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function EyeIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirEye width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function LockIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirLock width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function TrashIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirTrash width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function EditIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <EditPencil width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function DownloadIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirDownload width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function QrCodeIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirQrCode width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function MailIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SendMail width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CalendarIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCalendar width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function VerifiedBadgeIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <BadgeCheck width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function MobileIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SmartphoneDevice width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function GlobeIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirGlobe width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ShieldIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ShieldCheck width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SuitcaseIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Suitcase width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CameraIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCamera width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function StarIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirStar width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CreditCardIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirCreditCard width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function LightBulbIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirLightBulb width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function LinkIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirLink width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PersonIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirUser width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SoundIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SoundHigh width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SoundOffIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SoundOff width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ChatIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ChatBubble width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SendIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <SendDiagonal width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function NavArrowUpIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <NavArrowUp width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CheckIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Check width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CheckCircleIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <CheckCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PlayIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Play width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function PauseIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Pause width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function MessageIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Message width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function HelpCircleIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <HelpCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function WalkingIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Walking width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ArrowRightIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ArrowRight width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SquareIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Square width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function CloseIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <Xmark width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function InfoIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <IconoirInfoCircle width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function VideoCameraIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <VideoCamera width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function ShieldCheckIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return <ShieldCheck width={size} height={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export function SofaIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M4 18v2M20 18v2" />
    </svg>
  )
}

export function BalconyIcon({ size = 16, className = '', strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 10h16v10H4z" />
      <path d="M8 10v10M12 10v10M16 10v10" />
      <path d="M2 6h20M7 6V3M17 6V3" />
    </svg>
  )
}


