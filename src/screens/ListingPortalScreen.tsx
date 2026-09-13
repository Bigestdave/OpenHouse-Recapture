import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, Link as LinkIcon, ShieldCheck, Lock, ArrowRight, Camera, Layers, Video } from 'lucide-react'
import demoLiving from '../assets/demo-living-room.jpg'
import propAdmiraltyImg from '../assets/prop-admiralty.jpg'
import propBourdillonImg from '../assets/prop-bourdillon.jpg'
import logoAsset from '../assets/landing-logo.png'
import { useDemoContext } from '../context/DemoContext'

interface ListingOption {
  id: string
  title: string
  address: string
  badge: string
  badgeType: 'featured' | 'penthouse' | 'coverage'
  price: string
  specs: string
  propertyType: string
  lotSize: string
  bedrooms: number
  bathrooms: number | string
  yearBuilt: number
  photosCount: number
  floorPlansCount: number
  walkthroughsCount: number
  image: string
  sourceText: string
  updatedDate: string
}

const LISTING_OPTIONS: ListingOption[] = [
  {
    id: 'homestead_pd',
    title: '72691 Homestead Road',
    address: 'Palm Desert, CA 92260',
    badge: 'FEATURED',
    badgeType: 'featured',
    price: '$1,495,000',
    specs: '$1,495,000 · 4 Beds · 4 Baths · 10,454 sq ft',
    propertyType: '4-Bedroom Luxury Estate',
    lotSize: '10,454 sq ft',
    bedrooms: 4,
    bathrooms: 4,
    yearBuilt: 2018,
    photosCount: 16,
    floorPlansCount: 1,
    walkthroughsCount: 1,
    image: demoLiving,
    sourceText: 'Listed on Zillow MLS',
    updatedDate: 'Updated May 17, 2025'
  },
  {
    id: 'park_ave',
    title: '740 Park Avenue',
    address: 'Upper East Side, New York, NY 10021',
    badge: 'Penthouse',
    badgeType: 'penthouse',
    price: '$18,500/mo',
    specs: '$18,500/mo · 4 Beds · 4.5 Baths · 3,200 sq ft',
    propertyType: 'Luxury Penthouse Suite',
    lotSize: '3,200 sq ft',
    bedrooms: 4,
    bathrooms: 4.5,
    yearBuilt: 1930,
    photosCount: 18,
    floorPlansCount: 1,
    walkthroughsCount: 1,
    image: propAdmiraltyImg,
    sourceText: 'Listed on Realtor.com Feed',
    updatedDate: 'Updated June 2, 2025'
  },
  {
    id: 'ocean_dr',
    title: '1048 Ocean Drive',
    address: 'South Beach, Miami, FL 33139',
    badge: 'Full Coverage',
    badgeType: 'coverage',
    price: '$35,000/mo',
    specs: '$35,000/mo · 4 Beds · 5 Baths · 4,800 sq ft',
    propertyType: '5-Bedroom Waterfront Villa',
    lotSize: '4,800 sq ft',
    bedrooms: 4,
    bathrooms: 5,
    yearBuilt: 2021,
    photosCount: 22,
    floorPlansCount: 1,
    walkthroughsCount: 1,
    image: propBourdillonImg,
    sourceText: 'Listed on Custom MLS Webhook',
    updatedDate: 'Updated June 14, 2025'
  }
]

export function ListingPortalScreen() {
  const navigate = useNavigate()
  const { setStage } = useDemoContext()
  const [selectedSource, setSelectedSource] = useState<'zillow' | 'realtor' | 'custom'>('zillow')
  const [selectedListingId, setSelectedListingId] = useState<string>('homestead_pd')
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedListing = LISTING_OPTIONS.find(item => item.id === selectedListingId) || LISTING_OPTIONS[0]

  const handleContinue = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setStage(1)
      navigate('/property/homestead-pd')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans pb-24 selection:bg-[#194534]/15">
      {/* Top Header */}
      <header className="border-b border-[#DDD7CB] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoAsset} alt="OpenHouse" className="h-7 w-7 rounded-lg object-cover" />
              <span className="text-[17px] font-bold tracking-tight text-[#17231E]">OpenHouse</span>
            </Link>
            <span className="text-[#DDD7CB]">/</span>
            <span className="text-sm font-medium text-[#727A73]">Import a Property</span>
          </div>

          <Link
            to="/properties"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#17231E] bg-white border border-[#DDD7CB] rounded-lg hover:bg-[#ECE7DC] transition-colors shadow-subtle"
          >
            <span>Realtor Workspace</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-8">
        {/* Top Header Headline */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17231E] mb-2">
            Import a property listing
          </h1>
          <p className="text-sm text-[#727A73] max-w-2xl leading-relaxed">
            Bring in your MLS listing and let OpenHouse prepare the property for a verified 3D experience.
          </p>
        </div>

        {/* LISTING SOURCE Section */}
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#727A73] mb-3">
            LISTING SOURCE
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Zillow MLS */}
            <button
              type="button"
              onClick={() => setSelectedSource('zillow')}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                selectedSource === 'zillow'
                  ? 'bg-[#112019] text-white border-[#112019] shadow-subtle'
                  : 'bg-white text-[#17231E] border-[#DDD7CB] hover:bg-[#ECE7DC]/40 hover:border-[#C8C2B4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-lg ${
                  selectedSource === 'zillow' ? 'bg-white/15 text-white' : 'bg-[#FAF8F5] text-stone-800 border border-[#DDD7CB]'
                }`}>
                  Z
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Zillow MLS</p>
                  <p className={`text-[11px] ${selectedSource === 'zillow' ? 'text-white/70' : 'text-[#727A73]'}`}>
                    MLS feed
                  </p>
                </div>
              </div>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                selectedSource === 'zillow' ? 'bg-white text-[#112019]' : 'border border-[#DDD7CB]'
              }`}>
                {selectedSource === 'zillow' && <Check size={12} strokeWidth={3} />}
              </div>
            </button>

            {/* Realtor.com */}
            <button
              type="button"
              onClick={() => setSelectedSource('realtor')}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                selectedSource === 'realtor'
                  ? 'bg-[#112019] text-white border-[#112019] shadow-subtle'
                  : 'bg-white text-[#17231E] border-[#DDD7CB] hover:bg-[#ECE7DC]/40 hover:border-[#C8C2B4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-base ${
                  selectedSource === 'realtor' ? 'bg-white/15 text-white' : 'bg-[#FAF8F5] text-stone-800 border border-[#DDD7CB] font-serif'
                }`}>
                  r
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Realtor.com</p>
                  <p className={`text-[11px] ${selectedSource === 'realtor' ? 'text-white/70' : 'text-[#727A73]'}`}>
                    Feed
                  </p>
                </div>
              </div>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                selectedSource === 'realtor' ? 'bg-white text-[#112019]' : 'border border-[#DDD7CB]'
              }`}>
                {selectedSource === 'realtor' && <Check size={12} strokeWidth={3} />}
              </div>
            </button>

            {/* Custom MLS */}
            <button
              type="button"
              onClick={() => setSelectedSource('custom')}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                selectedSource === 'custom'
                  ? 'bg-[#112019] text-white border-[#112019] shadow-subtle'
                  : 'bg-white text-[#17231E] border-[#DDD7CB] hover:bg-[#ECE7DC]/40 hover:border-[#C8C2B4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  selectedSource === 'custom' ? 'bg-white/15 text-white' : 'bg-[#FAF8F5] text-stone-800 border border-[#DDD7CB]'
                }`}>
                  <LinkIcon size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Custom MLS</p>
                  <p className={`text-[11px] ${selectedSource === 'custom' ? 'text-white/70' : 'text-[#727A73]'}`}>
                    Webhook connection
                  </p>
                </div>
              </div>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                selectedSource === 'custom' ? 'bg-white text-[#112019]' : 'border border-[#DDD7CB]'
              }`}>
                {selectedSource === 'custom' && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Listings Selector vs Details Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          {/* Left Column: Choose Listing */}
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#727A73] mb-3">
              CHOOSE A LISTING TO IMPORT
            </p>

            <div className="space-y-4">
              {LISTING_OPTIONS.map((item) => {
                const isSelected = selectedListingId === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListingId(item.id)}
                    className={`flex items-center justify-between p-4 rounded-xl bg-white border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-[#194534] shadow-subtle ring-2 ring-[#194534]/10'
                        : 'border-[#DDD7CB] hover:border-[#C8C2B4] hover:bg-[#ECE7DC]/20 shadow-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-18 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-[#17231E]">{item.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.badgeType === 'featured'
                              ? 'bg-[#194534] text-white'
                              : 'bg-[#FAF8F5] text-stone-700 border border-[#DDD7CB]'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#727A73] mb-1.5">{item.address}</p>
                        <p className="text-xs font-semibold text-[#17231E] mb-2">{item.specs}</p>
                        <div className="flex items-center gap-4 text-[11px] text-[#727A73] font-medium">
                          <span className="flex items-center gap-1.5">
                            <Camera size={13} className="text-[#194534]" />
                            {item.photosCount} Photos
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers size={13} className="text-[#194534]" />
                            {item.floorPlansCount} Floor Plan
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Video size={13} className="text-[#194534]" />
                            {item.walkthroughsCount} Walkthrough
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                      isSelected ? 'bg-[#194534] text-white' : 'border border-[#DDD7CB]'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-xs text-[#9CA29D] mt-4 font-medium">
              Showing 3 of 24 listings
            </p>
          </div>

          {/* Right Column: Preview & Details */}
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#727A73] mb-3">
              PREVIEW & DETAILS
            </p>

            <div className="bg-white border border-[#DDD7CB] rounded-xl p-6 shadow-subtle space-y-6">
              {/* Header Info */}
              <div className="flex items-start gap-4 pb-5 border-b border-[#DDD7CB]">
                <img
                  src={selectedListing.image}
                  alt={selectedListing.title}
                  className="w-28 h-20 rounded-lg object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-[#17231E]">{selectedListing.title}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedListing.badgeType === 'featured'
                        ? 'bg-[#194534] text-white'
                        : 'bg-[#FAF8F5] text-stone-700 border border-[#DDD7CB]'
                    }`}>
                      {selectedListing.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#727A73] mb-2">{selectedListing.address}</p>
                  <div className="space-y-0.5 text-[11px] text-[#9CA29D]">
                    <p>{selectedListing.sourceText}</p>
                    <p>{selectedListing.updatedDate}</p>
                  </div>
                </div>
              </div>

              {/* Spec Details Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Property Type</p>
                  <p className="font-semibold text-[#17231E]">{selectedListing.propertyType}</p>
                </div>
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Lot Size</p>
                  <p className="font-semibold text-[#17231E]">{selectedListing.lotSize}</p>
                </div>
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Bedrooms</p>
                  <p className="font-semibold text-[#17231E]">{selectedListing.bedrooms}</p>
                </div>
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Bathrooms</p>
                  <p className="font-semibold text-[#17231E]">{selectedListing.bathrooms}</p>
                </div>
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Year Built</p>
                  <p className="font-semibold text-[#17231E]">{selectedListing.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-[#727A73] text-[11px] mb-0.5">Listing Price</p>
                  <p className="font-bold text-[#17231E] text-sm">{selectedListing.price}</p>
                </div>
              </div>

              {/* Attached Media */}
              <div>
                <p className="text-[11px] font-medium text-[#727A73] mb-2">Attached Media</p>
                <div className="flex flex-wrap gap-2.5 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] font-medium text-[#17231E]">
                    <Camera size={13} className="text-[#194534]" />
                    {selectedListing.photosCount} Photos
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] font-medium text-[#17231E]">
                    <Layers size={13} className="text-[#194534]" />
                    {selectedListing.floorPlansCount} Floor Plan
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] font-medium text-[#17231E]">
                    <Video size={13} className="text-[#194534]" />
                    {selectedListing.walkthroughsCount} Walkthrough
                  </span>
                </div>
              </div>

              {/* Verification Callout */}
              <div className="bg-[#f0f6f2] border border-[#d2e5d7] rounded-lg p-4 flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#194534] shrink-0" />
                <p className="text-xs text-[#194534] font-medium leading-relaxed">
                  This listing will be verified and optimized before we create your 3D tour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 border-t border-[#DDD7CB] py-3.5 px-6 lg:px-12 backdrop-blur-md z-30 shadow-subtle">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between">
          <Link
            to="/properties"
            className="px-5 py-2.5 text-xs font-semibold text-[#17231E] bg-white border border-[#DDD7CB] rounded-lg hover:bg-[#ECE7DC] transition-colors shadow-subtle"
          >
            Cancel
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#727A73]">
            <Lock size={12} />
            <span>Your data is secure and never shared without permission.</span>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleContinue}
            className="flex items-center gap-2 px-7 py-2.5 text-xs font-bold text-white bg-[#194534] hover:bg-[#123A2B] rounded-lg transition-all shadow-subtle cursor-pointer disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Preparing Ingestion...</span>
              </>
            ) : (
              <>
                <span>Review & Continue</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
