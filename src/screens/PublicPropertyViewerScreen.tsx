import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ShareIcon,
  GridIcon,
  MapPinIcon,
  SoundIcon,
  SoundOffIcon,
  ChatIcon,
  SendIcon,
  CalendarIcon,
  CopyIcon,
  QrCodeIcon,
  SearchIcon,
  CheckCircleIcon,
  CheckIcon,
  MobileIcon,
  MessageIcon,
  NavArrowUpIcon,
} from '../components/icons2'
import { Ellipsis, FullscreenIcon, CloseIcon } from '../components/icons'
import { OpenHouseLogoMark } from '../components/WorkspaceShell'
import demoLiving from '../assets/demo-living-room.jpg'
import demoKitchen from '../assets/demo-kitchen.jpg'
import demoBed from '../assets/demo-master-bedroom.jpg'
import demoBalcony from '../assets/demo-balcony.jpg'
import demoBath from '../assets/demo-bathroom.jpg'
import demoExterior from '../assets/demo-exterior.jpg'

import propAdmiralty from '../assets/prop-admiralty.jpg'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'
import propHeroWaterfront from '../assets/prop-hero-waterfront.jpg'
import propKitchen from '../assets/prop-kitchen.png'
import { DEMO_PROPERTY_ID } from '../context/DemoContext'
import { isDemoMode } from '../lib/runtime'
import { createPublicBooking, getPublicExperience, type PublicExperience } from '../lib/productionWorkflow'
import { askOpenHouseAssistant } from '../lib/gemini'

interface Room {
  id: string
  name: string
  img: string
  description: string
  hotspotTarget?: string
  hotspotLabel?: string
}

const DEMO_PROPERTY_ROOMS: Room[] = [
  {
    id: 'living',
    name: 'Living Room',
    img: demoLiving,
    description: 'Soaring architectural wood-beam ceilings, designer blue velvet seating, statement fireplace, and open flow to dining and kitchen.',
    hotspotTarget: 'balcony',
    hotspotLabel: 'Pool & Outdoor',
  },
  {
    id: 'entrance',
    name: 'Entry & Patio',
    img: demoExterior,
    description: 'Lush private patio with covered seating, access to the resort-style pool and guest house.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living Room',
  },
  {
    id: 'kitchen',
    name: 'Dining & Kitchen',
    img: demoKitchen,
    description: 'Open-plan dining with custom wine rack, large wood dining table, and warm natural light.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living Room',
  },
  {
    id: 'main-bed',
    name: 'Primary Suite',
    img: demoBed,
    description: 'Spacious primary suite with king bed, built-in mirrored closets, and en-suite marble bathroom.',
    hotspotTarget: 'bathroom',
    hotspotLabel: 'Primary Bathroom',
  },
  {
    id: 'bathroom',
    name: 'Primary Bathroom',
    img: demoBath,
    description: 'Marble-clad en-suite with frameless glass shower, gold fixtures, and modern floating vanity.',
    hotspotTarget: 'main-bed',
    hotspotLabel: 'Primary Suite',
  },
  {
    id: 'balcony',
    name: 'Pool & Outdoor',
    img: demoBalcony,
    description: 'Resort-style pool with loungers, covered patio, outdoor dining, and access to the detached guest house.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living Room',
  },
]

const PROPERTY_ROOMS: Room[] = [
  {
    id: 'entrance',
    name: 'Entrance',
    img: propAdmiralty,
    description: 'Connected to the entrance hall, living room and guest washroom.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living room',
  },
  {
    id: 'living',
    name: 'Living room',
    img: propHeroWaterfront,
    description: 'Connected to the entrance hall, kitchen and balcony.',
    hotspotTarget: 'balcony',
    hotspotLabel: 'Balcony',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    img: propKitchen,
    description: 'Custom fitted cabinetry with integrated appliances, connected to dining area.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living room',
  },
  {
    id: 'main-bed',
    name: 'Main bedroom',
    img: propBourdillon,
    description: 'Expansive master suite with floor-to-ceiling windows and en-suite bathroom.',
    hotspotTarget: 'balcony',
    hotspotLabel: 'Balcony',
  },
  {
    id: 'bed-2',
    name: 'Bedroom 2',
    img: propLekkiGardens,
    description: 'Spacious second bedroom with direct natural light and fitted wardrobes.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living room',
  },
  {
    id: 'bed-3',
    name: 'Bedroom 3',
    img: propOrchid,
    description: 'Quiet third bedroom suitable for guests, children, or dedicated home workspace.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living room',
  },
  {
    id: 'balcony',
    name: 'Balcony',
    img: propHeroWaterfront,
    description: 'Panoramic private outdoor terrace overlooking the waterfront skyline.',
    hotspotTarget: 'living',
    hotspotLabel: 'Living room',
  },
]

interface Message {
  sender: 'user' | 'ai'
  text: string
  badge?: string
  subtext?: string
}

import { useStore, addBooking } from '../data/store'

export function PublicPropertyViewerScreen() {
  const { id } = useParams()
  const { properties } = useStore()
  const [publicExperience, setPublicExperience] = useState<PublicExperience | null>(null)
  const [publicExperienceError, setPublicExperienceError] = useState<string | null>(null)

  const isDemo = id === DEMO_PROPERTY_ID || id === 'homestead-pd' || id === 'laurel-12a' || id?.includes('homestead') || id?.includes('laurel') || !id || id === 'demo'
  const publishedRooms: Room[] = (publicExperience?.spaces ?? []).map((space, index, allSpaces) => {
    const media = publicExperience?.media.find((asset) => asset.room_name?.toLowerCase() === space.name.toLowerCase())
      ?? publicExperience?.media[index]
    return {
      id: space.id,
      name: space.name,
      img: media?.url || propHeroWaterfront,
      description: space.issue || (space.verified ? 'Verified listing evidence.' : 'Evidence is awaiting verification.'),
      hotspotTarget: allSpaces[(index + 1) % Math.max(allSpaces.length, 1)]?.id,
      hotspotLabel: allSpaces[(index + 1) % Math.max(allSpaces.length, 1)]?.name,
    }
  })
  const propertyRooms = isDemo ? DEMO_PROPERTY_ROOMS : (!isDemoMode && publishedRooms.length ? publishedRooms : PROPERTY_ROOMS)

  const property = properties.find((p) =>
    p.id === id ||
    p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(id?.toLowerCase() || '') ||
    (id?.includes('admiralty') && p.title.includes('Admiralty')) ||
    (id?.includes('bourdillon') && p.title.includes('Bourdillon')) ||
    (id?.includes('orchid') && p.title.includes('Orchid')) ||
    (id?.includes('lekki') && p.title.includes('Lekki'))
  ) || properties[0]

  const propertyTitle = isDemo ? '72691 Homestead Road, Palm Desert' : (publicExperience?.property.title || property?.title || '8 Admiralty Way')
  const propertyLocation = isDemo ? 'Palm Desert, CA 92260' : (publicExperience?.property.address || property?.address || 'Lekki, Lagos')

  // Viewer state
  const [isEntered, setIsEntered] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState('living')
  const [activeRightDrawer, setActiveRightDrawer] = useState<'none' | 'rooms' | 'ask' | 'book' | 'map'>('none')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [, setIsFullscreen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [isTouring, setIsTouring] = useState(false)

  // Booking state
  const [selectedDay, setSelectedDay] = useState<number>(20)
  const [selectedTime, setSelectedTime] = useState<string>('11:30 AM')
  const [bookingName, setBookingName] = useState('David Olabowale')
  const [bookingEmail, setBookingEmail] = useState('david@example.com')
  const [bookingPhone, setBookingPhone] = useState('+1 (512) 555-0192')
  const [bookingNote, setBookingNote] = useState('')
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  // AI Chat state
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: 'Which room gets the most natural light?',
    },
    {
      sender: 'ai',
      text: 'The living room appears to receive the strongest natural light in the supplied daytime capture, primarily through the balcony glazing.',
      badge: 'Observed from daytime property capture',
      subtext: 'Measurements are shown only when supported by a floor plan or reference scale.',
    },
  ])

  const activeRoom = propertyRooms.find((r) => r.id === activeRoomId) || propertyRooms[1]

  useEffect(() => {
    if (isDemoMode || !id) return
    let active = true
    getPublicExperience(id)
      .then((experience) => { if (active) setPublicExperience(experience) })
      .catch((error) => { if (active) setPublicExperienceError(error instanceof Error ? error.message : 'Could not load this experience.') })
    return () => { active = false }
  }, [id])

  // Guided tour animation
  useEffect(() => {
    if (!isTouring) return
    const interval = setInterval(() => {
      setActiveRoomId((curr) => {
        const index = propertyRooms.findIndex((r) => r.id === curr)
        const nextIndex = (index + 1) % propertyRooms.length
        return propertyRooms[nextIndex].id
      })
    }, 4500)
    return () => clearInterval(interval)
  }, [isTouring, propertyRooms])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const q = textToSend || chatInput.trim()
    if (!q) return

    const newMsgs: Message[] = [...messages, { sender: 'user', text: q }]
    setMessages(newMsgs)
    setChatInput('')

    if (!isDemoMode) {
      void askOpenHouseAssistant(q, { title: propertyTitle, location: propertyLocation, rooms: propertyRooms.map((room) => room.name) })
        .then((answer) => setMessages((prev) => [...prev, { sender: 'ai', text: answer.answer, badge: answer.badge }]))
        .catch(() => setMessages((prev) => [...prev, { sender: 'ai', text: 'OpenHouse could not verify an answer right now.', badge: 'Not verified' }]))
      return
    }

    setTimeout(() => {
      let aiReply = 'OpenHouse has cross-referenced the property captures and verified listing details.'
      let badge = 'Observed from property capture'

      const lower = q.toLowerCase()
      if (lower.includes('light') || lower.includes('sun')) {
        aiReply = 'The living room and balcony receive optimal southern natural exposure throughout the day.'
        badge = 'Observed from daytime property capture'
      } else if (lower.includes('park') || lower.includes('car') || lower.includes('garage')) {
        aiReply = 'Yes, this property includes 2 dedicated covered parking spaces and guest parking on the ground level.'
        badge = 'Verified in listing specifications'
      } else if (lower.includes('balcony') || lower.includes('terrace') || lower.includes('connect')) {
        aiReply = 'The living room connects directly to the private balcony through sliding acoustic glass doors.'
        badge = 'Observed from spatial reconstruction'
      } else if (lower.includes('dimension') || lower.includes('size') || lower.includes('sqft')) {
        aiReply = 'The living room measures approximately 6.8m × 4.5m with a 3.1m high ceiling.'
        badge = 'Calculated from architectural survey'
      } else if (lower.includes('bedroom') || lower.includes('main')) {
        aiReply = 'The main bedroom is located down the private hallway with uninterrupted skyline views and en-suite bath.'
        badge = 'Observed from property capture'
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          badge,
          subtext: 'Measurements are shown only when supported by a floor plan or reference scale.',
        },
      ])
    }, 400)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B1713] select-none font-sans text-white">
      {publicExperienceError && (
        <div className="absolute inset-x-4 top-4 z-50 rounded-lg bg-red-950/95 px-4 py-3 text-center text-sm text-white shadow-lg">
          {publicExperienceError}
        </div>
      )}
      {/* 3D Panoramic Background Canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={activeRoom.img}
          alt={activeRoom.name}
          className="h-full w-full object-cover transition-all duration-700 ease-out"
        />
        {/* Top Vignette (for header & logo) */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
        {/* Left Vignette (for title & room drawer) */}
        <div className="absolute inset-y-0 left-0 w-[480px] bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none" />
        {/* Bottom Vignette (for context card & dock) */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-20 flex items-start justify-between p-6 sm:p-8">
        {/* Left: Branding & Property Title in Explore Mode */}
        <div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <OpenHouseLogoMark className="h-7 w-7" />
            <span className="text-[18px] font-bold tracking-tight text-white drop-shadow-md">
              OpenHouse
            </span>
          </Link>

          {isEntered && (
            <div className="mt-4">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight drop-shadow-md">
                {propertyTitle}
              </h1>
              <p className="text-[13.5px] text-white/80 font-normal drop-shadow-sm mt-0.5">
                {activeRoom.name}
              </p>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-2 rounded-lg glass-card-dark px-3.5 py-2 text-[13px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          >
            <ShareIcon size={14} />
            <span>Share</span>
          </button>

          {isEntered && (
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all shadow-lg ${
                soundEnabled
                  ? 'bg-primary text-white border border-primary/50'
                  : 'glass-card-dark text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              {soundEnabled ? <SoundIcon size={14} /> : <SoundOffIcon size={14} />}
              <span>Sound</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center gap-2 rounded-lg glass-card-dark px-3.5 py-2 text-[13px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          >
            <FullscreenIcon size={14} />
            <span>Full screen</span>
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg glass-card-dark text-white/90 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          >
            <Ellipsis size={16} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. ENTRY SCREEN OVERLAY (When isEntered === false) */}
      {/* ========================================================================= */}
      {!isEntered && (
        <div className="relative z-10 flex h-[calc(100vh-100px)] flex-col justify-end p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Left Property Entry Hero Card */}
            <div className="w-[420px] max-w-full rounded-xl glass-card-dark p-6 shadow-2xl space-y-3.5">
              <div className="flex items-center gap-1.5 text-white/75 text-[12px] font-medium">
                <MapPinIcon size={13} className="text-white/75" />
                <span>{propertyLocation}</span>
              </div>

              <div>
                <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                  {propertyTitle}
                </h2>
                <p className="text-[13px] text-white/75 font-normal mt-1">
                  3 bedrooms · 3 bathrooms · Private balcony
                </p>
              </div>

              <p className="text-[12.5px] text-white/65 leading-relaxed pt-0.5">
                Explore the property at your own pace or take the one-minute guided tour.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1.5">
                <button
                  onClick={() => setIsEntered(true)}
                  className="flex-1 rounded-lg bg-white py-2.5 px-4 text-[13px] font-semibold text-[#0B1713] shadow-md hover:bg-white/90 active:scale-[0.98] transition-all text-center"
                >
                  Enter home
                </button>
                <button
                  onClick={() => {
                    setIsEntered(true)
                    setIsTouring(true)
                  }}
                  className="flex-1 rounded-lg border border-white/20 bg-transparent hover:bg-white/10 py-2.5 px-4 text-[13px] font-semibold text-white active:scale-[0.98] transition-all text-center"
                >
                  Take guided tour
                </button>
              </div>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-center gap-2 text-[12px] text-white/70">
                  <MobileIcon size={14} className="text-white/70" />
                  <span>No app required</span>
                </div>
                <div className="border-t border-white/10" />
                <div className="flex items-center gap-2 text-[12px] text-emerald-400 font-normal">
                  <CheckCircleIcon size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-white/80">Property information checked by OpenHouse</span>
                </div>
              </div>
            </div>

            {/* Bottom-Right Space Count Pill */}
            <button
              onClick={() => setIsEntered(true)}
              className="self-start lg:self-end flex items-center gap-2 rounded-lg glass-card-dark px-3.5 py-2 text-[12px] font-medium text-white/90 hover:bg-white/10 transition-all shadow-lg border border-white/10"
            >
              <GridIcon size={14} />
              <span>7 spaces available</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXPLORE WALKTHROUGH MODE (When isEntered === true) */}
      {/* ========================================================================= */}
      {isEntered && (
        <>
          {/* Spatial Floor Interactive Hotspot */}
          {activeRoom.hotspotTarget && (
            <div className="absolute top-[60%] left-[69%] -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer">
              <button
                onClick={() => {
                  if (activeRoom.hotspotTarget) setActiveRoomId(activeRoom.hotspotTarget)
                }}
                className="relative flex items-center justify-center h-12 w-12 rounded-full glass-card-dark text-white shadow-2xl hover:scale-110 transition-all group-hover:ring-4 group-hover:ring-emerald-400/40"
              >
                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20 pointer-events-none" />
                <NavArrowUpIcon size={20} className="text-white" strokeWidth={2.5} />
              </button>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 rounded-lg glass-card-dark px-3 py-1 text-[11.5px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                Walk to {activeRoom.hotspotLabel || 'next room'}
              </div>
            </div>
          )}

          {/* Bottom-Left Room Context Card */}
          <div className="absolute bottom-24 left-6 z-10 w-[240px] rounded-xl glass-card-dark p-4 shadow-2xl space-y-1 hidden sm:block">
            <h3 className="text-[14px] font-semibold text-white leading-tight">
              {activeRoom.name}
            </h3>
            <p className="text-[12.5px] text-white/75 leading-relaxed">
              {activeRoom.description}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[11.5px] text-emerald-400 font-medium">
              <CheckCircleIcon size={13} className="text-emerald-400 shrink-0" />
              <span>Observed from property capture</span>
            </div>
          </div>

          {/* Bottom Center Floating Navigation Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-xl glass-dock p-1.5 shadow-2xl">
            {/* Rooms Toggle Button */}
            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'rooms' ? 'none' : 'rooms')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                activeRightDrawer === 'rooms'
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              <GridIcon size={15} />
              <span>Rooms</span>
            </button>

            {/* Ask AI Assistant Button */}
            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'ask' ? 'none' : 'ask')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                activeRightDrawer === 'ask'
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              <ChatIcon size={15} />
              <span>Ask</span>
            </button>

            {/* Map Floorplan Button */}
            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'map' ? 'none' : 'map')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                activeRightDrawer === 'map'
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              <MapPinIcon size={15} />
              <span>Map</span>
            </button>

            {/* Book Inspection Action Button */}
            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'book' ? 'none' : 'book')}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-[#0B1713] hover:bg-white/90 active:scale-95 transition-all ml-0.5"
            >
              <CalendarIcon size={15} className="text-[#0B1713]" />
              <span>Book inspection</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 3. RIGHT DRAWER: EXPLORE PROPERTY ROOMS */}
          {/* ========================================================================= */}
          {activeRightDrawer === 'rooms' && (
            <div className="absolute top-20 right-6 bottom-6 z-30 w-full max-w-[400px] rounded-xl glass-card-dark flex flex-col overflow-hidden shadow-2xl text-white">
              {/* Header */}
              <div className="p-5 pb-4 border-b border-white/10 flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-white tracking-tight">Explore the property</h3>
                  <p className="text-[12.5px] text-white/70 mt-0.5 leading-snug">
                    Select any space to jump to that perspective.
                  </p>
                </div>
                <button
                  onClick={() => setActiveRightDrawer('none')}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              {/* Room List Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
                {propertyRooms.map((room) => {
                  const isActive = room.id === activeRoomId
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isActive
                          ? 'bg-white/15 border border-white/20 shadow-xs'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={room.img}
                          alt={room.name}
                          className="h-11 w-15 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className={`text-[13.5px] truncate ${isActive ? 'font-semibold text-white' : 'font-normal text-white/85'}`}>
                            {room.name}
                          </p>
                          <p className="text-[11.5px] text-white/60 truncate mt-0.5">
                            {room.description}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. RIGHT DRAWER: ASK ABOUT THIS HOME */}
          {/* ========================================================================= */}
          {activeRightDrawer === 'ask' && (
            <div className="absolute top-20 right-6 bottom-6 z-30 w-full max-w-[400px] rounded-xl bg-white flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-5 pb-4">
                <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-tight">Ask about this home</h3>
                <p className="text-[12.5px] text-stone-500 mt-0.5 leading-snug">
                  Ask about rooms, features or information supplied with the listing.
                </p>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3 no-scrollbar">
                {/* Search / Ask Input Prompt */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-400 flex items-center gap-2.5">
                  <SearchIcon size={15} className="text-stone-400 shrink-0" />
                  <span>What would you like to know?</span>
                </div>

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="rounded-2xl bg-[#3D3929] text-white/90 px-4 py-2.5 text-[13px] font-normal max-w-[85%]">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="rounded-2xl border-l-2 border-stone-300 bg-stone-50 p-4 space-y-2 max-w-[95%]">
                        <p className="text-[13px] text-[#1A1A1A] leading-relaxed">{msg.text}</p>
                        {msg.badge && (
                          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-600">
                            <CheckCircleIcon size={13} className="text-emerald-600 shrink-0" />
                            <span>{msg.badge}</span>
                          </div>
                        )}
                        {msg.subtext && (
                          <p className="text-[11px] text-stone-400 leading-normal">
                            {msg.subtext}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Suggested Questions */}
                <div className="space-y-2 pt-1">
                  <p className="text-[12px] font-semibold text-stone-500">
                    Suggested questions
                  </p>
                  <div className="space-y-1.5">
                    {[
                      'Show me the main bedroom',
                      'Is parking included?',
                      'Which rooms connect to the balcony?',
                      'Are the bedroom dimensions available?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          if (q === 'Show me the main bedroom') setActiveRoomId('main-bed')
                          handleSendMessage(q)
                        }}
                        className="w-full text-left rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] font-normal text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all"
                      >
                        {q}
                      </button>
                    ))}

                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[13px]">
                      <span className="font-normal text-stone-700">Take me to the living room</span>
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5">
                        <span>You're here</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="px-5 py-4 border-t border-stone-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask another question..."
                    className="flex-1 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                  <button
                    type="submit"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1A1A1A] text-white hover:bg-black active:scale-95 transition-all shrink-0"
                  >
                    <SendIcon size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. RIGHT DRAWER: BOOK AN INSPECTION */}
          {/* ========================================================================= */}
          {activeRightDrawer === 'book' && (
            <div className="absolute top-20 right-6 bottom-6 z-30 w-full max-w-[400px] rounded-xl bg-white flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-5 pb-4 border-b border-stone-100 flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-tight">Book an inspection</h3>
                  <div className="flex items-center gap-2.5 mt-2">
                    <img
                      src={propertyRooms[0]?.img || demoLiving}
                      alt={propertyTitle}
                      className="h-9 w-12 rounded-lg object-cover border border-stone-200"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-stone-900">{propertyTitle}</p>
                      <p className="text-[11.5px] text-stone-500">{propertyLocation}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRightDrawer('none')}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              {/* Booking Form Scroll Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                {/* 1. Choose a time */}
                <div className="space-y-2.5">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-stone-500">
                    1. Choose a time
                  </h4>

                  {/* Calendar Matrix & Time Slots */}
                  <div className="grid grid-cols-[1.5fr_1fr] gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
                    <div>
                      <div className="flex items-center justify-between text-[12px] font-bold text-stone-800 pb-2">
                        <span>August 2026</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase">
                        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] pt-1.5">
                        {[17, 18, 19, 20, 21, 22, 23].map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`h-6 w-6 mx-auto rounded-md flex items-center justify-center font-medium transition-colors ${
                              selectedDay === day
                                ? 'bg-[#194534] text-white shadow-xs font-bold'
                                : 'hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-1 border-l border-stone-200 pl-2.5">
                      <p className="text-[10px] font-bold uppercase text-stone-400">Available</p>
                      {['10:00 AM', '11:30 AM', '1:00 PM', '3:30 PM'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`w-full rounded-md py-1 text-[11.5px] font-medium text-center transition-all ${
                            selectedTime === time
                              ? 'bg-[#194534] text-white font-semibold shadow-xs'
                              : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Your contact details */}
                <div className="space-y-2.5">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-stone-500">
                    2. Your contact details
                  </h4>

                  <div className="space-y-2.5 text-[12.5px]">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1">Full name</label>
                      <input
                        type="text"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1">Phone number</label>
                      <input
                        type="tel"
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1">
                        Anything the agent should know? <span className="text-stone-400">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                        placeholder="e.g. Preferred entry point, parking, accessibility needs..."
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-stone-100 bg-stone-50 space-y-2">
                <button
                  onClick={() => {
                    setBookingError(null)
                    setBookingSubmitting(true)
                    const finish = () => {
                      setBookingSubmitted(true)
                      setTimeout(() => {
                        setBookingSubmitted(false)
                        setActiveRightDrawer('none')
                      }, 2200)
                    }
                    if (!isDemoMode) {
                      if (!id) {
                        setBookingError('This experience link is invalid.')
                        setBookingSubmitting(false)
                        return
                      }
                      void createPublicBooking(id, {
                        name: bookingName, email: bookingEmail, phone: bookingPhone,
                        preferredDate: `March ${selectedDay}, 2026`, preferredTime: selectedTime, message: bookingNote,
                      }).then(finish).catch((error) => {
                        setBookingError(error instanceof Error ? error.message : 'Could not submit your request.')
                      }).finally(() => setBookingSubmitting(false))
                      return
                    }
                    addBooking({
                      propertyId: property?.id || 'prop-admiralty',
                      propertyTitle: property?.title || propertyTitle,
                      renterName: bookingName,
                      renterPhone: bookingPhone,
                      renterEmail: bookingEmail,
                      preferredDate: `March ${selectedDay}, 2026`,
                      preferredTime: selectedTime,
                      message: bookingNote,
                      status: 'requested',
                    })
                    finish()
                    setBookingSubmitting(false)
                  }}
                  disabled={bookingSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0B1713] py-2.5 text-[13px] font-semibold text-white shadow-xs hover:bg-black active:scale-[0.98] transition-all"
                >
                  {bookingSubmitted ? (
                    <>
                      <CheckIcon size={15} className="text-emerald-400" />
                      <span>Inspection Requested</span>
                    </>
                  ) : (
                    <span>{bookingSubmitting ? 'Sending request…' : 'Request inspection'}</span>
                  )}
                </button>
                {bookingError && <p className="text-[11px] text-center text-red-700">{bookingError}</p>}
                <p className="text-[11px] text-center text-stone-500">
                  David Olabowale will confirm your appointment.
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white py-2 text-[12px] font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <MessageIcon size={14} className="text-[#25D366]" />
                  <span>Contact on WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. RIGHT DRAWER: 2D FLOORPLAN & MAP */}
          {/* ========================================================================= */}
          {activeRightDrawer === 'map' && (
            <div className="absolute top-20 right-6 bottom-6 z-30 w-full max-w-[400px] rounded-xl bg-white flex flex-col overflow-hidden shadow-2xl">
              <div className="p-5 pb-4 border-b border-stone-100 flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-tight">Property floorplan</h3>
                  <p className="text-[12.5px] text-stone-500 mt-0.5 leading-snug">
                    Interactive layout representation of {propertyTitle}.
                  </p>
                </div>
                <button
                  onClick={() => setActiveRightDrawer('none')}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              <div className="flex-1 p-5 flex flex-col items-center justify-center space-y-4 no-scrollbar overflow-y-auto">
                <div className="relative w-full aspect-[4/3] rounded-xl bg-[#F2EEE5]/70 border border-stone-200 p-4 flex items-center justify-center shadow-inner">
                  <svg viewBox="0 0 300 220" className="w-full h-full text-stone-600">
                    {/* Living Room */}
                    <rect x="20" y="20" width="160" height="110" fill="#194534" fillOpacity="0.1" stroke="#194534" strokeWidth="2" rx="4" />
                    <text x="100" y="80" textAnchor="middle" fill="#0B1713" fontSize="12" fontWeight="bold">Living Room</text>
                    
                    {/* Kitchen */}
                    <rect x="190" y="20" width="90" height="90" fill="#FFFFFF" stroke="#D1C7B7" strokeWidth="2" rx="4" />
                    <text x="235" y="70" textAnchor="middle" fill="#5A6660" fontSize="11">Kitchen</text>

                    {/* Balcony */}
                    <rect x="20" y="140" width="160" height="60" fill="#D97945" fillOpacity="0.15" stroke="#D97945" strokeWidth="2" strokeDasharray="4 4" rx="4" />
                    <text x="100" y="175" textAnchor="middle" fill="#D97945" fontSize="11" fontWeight="bold">Private Balcony</text>

                    {/* Bedrooms */}
                    <rect x="190" y="120" width="90" height="80" fill="#FFFFFF" stroke="#D1C7B7" strokeWidth="2" rx="4" />
                    <text x="235" y="165" textAnchor="middle" fill="#5A6660" fontSize="11">Bedrooms</text>

                    {/* Active Point Indicator */}
                    <circle cx="100" cy="85" r="6" fill="#194534" />
                    <circle cx="100" cy="85" r="12" fill="#194534" fillOpacity="0.3" className="animate-ping" />
                  </svg>
                </div>
                <p className="text-[12px] text-stone-500 text-center">
                  Click any room in the floorplan or room drawer to jump to that perspective.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 6. SHARE MODAL OVERLAY */}
      {/* ========================================================================= */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl glass-card-light p-6 shadow-2xl space-y-5 text-text-primary">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-text-primary">Share property experience</h3>
                <p className="text-[13px] text-text-secondary mt-0.5">{propertyTitle} · {propertyLocation}</p>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-black/5"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  setCopiedShare(true)
                  setTimeout(() => setCopiedShare(false), 2000)
                }}
                className="w-full flex items-center justify-between rounded-xl border border-border/80 bg-white/70 backdrop-blur-sm p-3.5 hover:bg-white transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 text-[13.5px] font-semibold text-text-primary">
                  <CopyIcon size={16} />
                  <span>{copiedShare ? 'Copied link to clipboard!' : 'Copy experience link'}</span>
                </div>
                <span className="text-[12px] text-text-secondary truncate max-w-[140px]">openhouse.app/view/8-admiralty</span>
              </button>

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 rounded-xl border border-border/80 bg-white/70 backdrop-blur-sm p-3.5 hover:bg-white transition-all text-[13.5px] font-semibold text-text-primary shadow-sm"
              >
                <MessageIcon size={16} className="text-[#25D366]" />
                <span>Share via WhatsApp</span>
              </a>

              <button
                onClick={() => alert(`QR Code generated for ${propertyTitle}`)}
                className="w-full flex items-center gap-3 rounded-xl border border-border/80 bg-white/70 backdrop-blur-sm p-3.5 hover:bg-white transition-all text-[13.5px] font-semibold text-text-primary shadow-sm"
              >
                <QrCodeIcon size={16} />
                <span>Show QR code for brochures</span>
              </button>
            </div>

            <button
              onClick={() => setShareModalOpen(false)}
              className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-bold text-text-inverse hover:bg-primary-hover transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

