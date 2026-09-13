import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { ShareIcon, GridIcon, MapPinIcon, MailIcon, QrCodeIcon } from '../components/icons2'
import { FullscreenIcon } from '../components/icons'


import propAdmiralty from '../assets/prop-admiralty.jpg'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'
import propHeroWaterfront from '../assets/prop-hero-waterfront.jpg'
import propKitchen from '../assets/prop-kitchen.png'

import demoLiving from '../assets/demo-living-room.jpg'
import demoExterior from '../assets/demo-exterior.jpg'
import demoKitchen from '../assets/demo-kitchen.jpg'
import demoBed from '../assets/demo-master-bedroom.jpg'
import demoBath from '../assets/demo-bathroom.jpg'
import demoBalcony from '../assets/demo-balcony.jpg'
import { DEMO_PROPERTY_ID, DEMO_PROPERTY_LABEL } from '../context/DemoContext'

const DEMO_ROOMS = [
  { id: 'living', name: 'Living room', img: demoLiving },
  { id: 'entrance', name: 'Entry & Patio', img: demoExterior },
  { id: 'kitchen', name: 'Dining & Kitchen', img: demoKitchen },
  { id: 'main-bed', name: 'Primary Suite', img: demoBed },
  { id: 'bathroom', name: 'Primary Bathroom', img: demoBath },
  { id: 'balcony', name: 'Pool & Outdoor', img: demoBalcony },
]

const STANDARD_ROOMS = [
  { id: 'entrance', name: 'Entrance', img: propHeroWaterfront },
  { id: 'living', name: 'Living room', img: propAdmiralty },
  { id: 'kitchen', name: 'Kitchen', img: propKitchen },
  { id: 'main-bed', name: 'Main bedroom', img: propBourdillon },
  { id: 'bed-2', name: 'Bedroom 2', img: propLekkiGardens },
  { id: 'bed-3', name: 'Bedroom 3', img: propOrchid },
  { id: 'balcony', name: 'Balcony', img: propHeroWaterfront },
]

export function PublishedExperienceScreen() {
  const { id } = useParams()
  const isDemo = id === DEMO_PROPERTY_ID || id === 'homestead-pd' || id === 'laurel-12a' || id?.includes('homestead')
  const roomList = isDemo ? DEMO_ROOMS : STANDARD_ROOMS
  const [activeRoom, setActiveRoom] = useState('living')
  const [copiedLink, setCopiedLink] = useState(false)

  const propertyTitle = isDemo ? DEMO_PROPERTY_LABEL : (id?.includes('admiralty') ? '8 Admiralty Way' : '8 Admiralty Way')

  return (
    <WorkspaceShell
      breadcrumb={
        <div className="flex items-center gap-2 text-[13.5px] text-text-secondary whitespace-nowrap">
          <Link to="/productions" className="hover:text-text-primary">Experiences</Link>
          <span>&gt;</span>
          <Link to={`/show/${id || '8-admiralty-way'}`} className="hover:text-text-primary">{propertyTitle}</Link>
          <span>&gt;</span>
          <span className="font-semibold text-text-primary">Published</span>
        </div>
      }
      backTo="/productions"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-success whitespace-nowrap">
                LIVE · UNLISTED
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[30px] lg:text-[32px] font-extrabold tracking-tight text-text-primary leading-tight mt-1">
              Your OpenHouse is ready to share
            </h1>
            <p className="text-[14px] text-text-secondary font-normal mt-0.5 whitespace-nowrap">
              {propertyTitle} is published as an unlisted experience.
            </p>
          </div>

          <Link
            to={`/view/${id || '8-admiralty-way'}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors shrink-0 whitespace-nowrap"
          >
            <span>Open experience ↗</span>
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Left Column: 3D Interactive Viewer + Metrics */}
          <div className="space-y-4">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-sidebar border border-border shadow-card">
              <img
                src={roomList.find((r) => r.id === activeRoom)?.img || demoLiving}
                alt={activeRoom}
                className="h-full w-full object-cover"
              />

              <div className="absolute top-3 left-3 rounded-md bg-black/65 backdrop-blur-md px-2.5 py-1 text-white border border-white/10 text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap">
                {roomList.find((r) => r.id === activeRoom)?.name} / 01
              </div>

              <div className="absolute bottom-3 left-3 right-16 sm:right-auto rounded-xl bg-black/65 backdrop-blur-md p-3.5 text-white border border-white/10 max-w-xs sm:max-w-sm">
                <p className="text-[15px] font-bold leading-tight truncate">
                  {roomList.find((r) => r.id === activeRoom)?.name}
                </p>
                <p className="text-[12px] text-white/80 mt-0.5 leading-snug">
                  Connected to the entrance hall, kitchen and balcony.
                </p>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                <button className="flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11.5px] font-semibold text-white border border-white/10 hover:bg-black/80 whitespace-nowrap">
                  <GridIcon size={13} />
                  <span>Rooms</span>
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11.5px] font-semibold text-white border border-white/10 hover:bg-black/80 whitespace-nowrap">
                  <MapPinIcon size={13} />
                  <span>Map</span>
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11.5px] font-semibold text-white border border-white/10 hover:bg-black/80 whitespace-nowrap">
                  <FullscreenIcon size={13} />
                  <span>Full screen</span>
                </button>
              </div>
            </div>

            {/* Metrics summary card below viewer */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-subtle text-center">
              <div>
                <p className="text-[18px] sm:text-[20px] font-extrabold text-text-primary">7</p>
                <p className="text-[11.5px] text-text-secondary mt-0.5 whitespace-nowrap">Spaces connected</p>
              </div>
              <div>
                <p className="text-[18px] sm:text-[20px] font-extrabold text-text-primary">6</p>
                <p className="text-[11.5px] text-text-secondary mt-0.5 whitespace-nowrap">Advertised rooms</p>
              </div>
              <div>
                <p className="text-[18px] sm:text-[20px] font-extrabold text-success whitespace-nowrap">✓ Verified</p>
                <p className="text-[11.5px] text-text-secondary mt-0.5 whitespace-nowrap">Quality pass</p>
              </div>
            </div>

            {/* Room Selector Strip Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {roomList.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-1.5 shrink-0 transition-all ${
                    activeRoom === room.id
                      ? 'border-primary bg-primary/5 shadow-subtle'
                      : 'border-border bg-surface hover:bg-surface-elevated'
                  }`}
                >
                  <img src={room.img} alt={room.name} className="h-16 w-24 rounded-lg object-cover" />
                  <span className="text-[12px] font-semibold text-text-primary">{room.name}</span>
                </button>
              ))}
            </div>

            {/* Published Summary Metrics Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-border bg-surface p-6 shadow-subtle text-center">
              <div>
                <p className="text-[24px] font-extrabold text-text-primary">7</p>
                <p className="text-[12.5px] text-text-secondary mt-0.5">captured spaces</p>
              </div>
              <div>
                <p className="text-[24px] font-extrabold text-text-primary">6 of 6</p>
                <p className="text-[12.5px] text-text-secondary mt-0.5">rooms represented</p>
              </div>
              <div>
                <p className="text-[20px] font-extrabold text-success mt-1">Verified</p>
                <p className="text-[12.5px] text-text-secondary mt-0.5">OpenHouse badge</p>
              </div>
              <div>
                <p className="text-[20px] font-extrabold text-primary mt-1">Enabled</p>
                <p className="text-[12.5px] text-text-secondary mt-0.5">booking action</p>
              </div>
            </div>
          </div>

          {/* Right Column: Share & Embed Cards */}
          <div className="space-y-5">
            {/* Share Link Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-3.5">
              <h3 className="text-[14.5px] font-bold text-text-primary">Share link</h3>
              <div className="flex items-center rounded-lg border border-border bg-surface p-1 shadow-subtle">
                <span className="flex-1 px-3 text-[13px] font-mono text-text-primary truncate min-w-0">
                  openhouse.app/h/8-admiralty-way
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('https://openhouse.app/h/8-admiralty-way')
                    setCopiedLink(true)
                    setTimeout(() => setCopiedLink(false), 2000)
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-text-inverse hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy link'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-2 text-[12.5px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap">
                  <ShareIcon size={14} />
                  <span>Share</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-2 text-[12.5px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap">
                  <MailIcon size={14} />
                  <span>Email</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-2 text-[12.5px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap">
                  <QrCodeIcon size={14} />
                  <span>QR code</span>
                </button>
              </div>
            </div>

            {/* Visibility Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-2.5">
              <h3 className="text-[14.5px] font-bold text-text-primary">Visibility</h3>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text-primary outline-none">
                <option>Unlisted link</option>
                <option>Public discovery</option>
                <option>Password protected</option>
              </select>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Anyone with the link can enter. The experience will not appear in public discovery.
              </p>
            </div>

            {/* Add to Listing Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-3">
              <h3 className="text-[14.5px] font-bold text-text-primary">Add to listing</h3>
              <div className="space-y-2">
                <button className="w-full rounded-lg border border-border bg-surface py-1.5 text-[13px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap">
                  Copy listing button
                </button>
                <button className="w-full rounded-lg border border-border bg-surface py-1.5 text-[13px] font-semibold text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap">
                  Copy embed code
                </button>
              </div>

              <div className="rounded-lg bg-sidebar p-2.5 text-[11.5px] font-mono text-text-inverse-muted overflow-x-auto">
                <code>&lt;iframe src="https://openhouse.app/h/8-admiralty-way/embed" width="100%" height="600" /&gt;</code>
              </div>
            </div>

            {/* Visitor Contact Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-subtle space-y-3">
              <h3 className="text-[14.5px] font-bold text-text-primary">Visitor contact</h3>
              <button className="w-full rounded-lg bg-primary py-2 text-[13.5px] font-semibold text-text-inverse shadow-subtle hover:bg-primary-hover transition-colors whitespace-nowrap">
                Book an inspection
              </button>

              <div className="flex items-center justify-between text-[12.5px] pt-1">
                <div>
                  <p className="font-semibold text-text-primary truncate">David Olabowale</p>
                  <p className="text-text-secondary text-[11.5px]">WhatsApp and email</p>
                </div>
                <button className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-text-primary hover:bg-surface-elevated whitespace-nowrap">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
