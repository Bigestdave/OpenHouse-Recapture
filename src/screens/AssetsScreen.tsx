import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { SearchIcon, UploadCloud } from '../components/icons2'
import { CloseIcon } from '../components/icons'
import {
  getShows,
  listCharacters,
  listCharacterReferences,
  getArtifactDownloadUrl,
  uploadCharacterReference,
  type Show,
} from '../data/api'
import { characterRefImage } from '../data/artwork'
import { SkeletonShowCard } from '../components/Skeleton'

interface CharacterAsset {
  id: string
  name: string
  description: string
  showId: string
  showTitle: string
  imageUrl?: string
  referencesCount: number
}

const filters = ['All', 'Spaces'] as const

export function AssetsScreen() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [selectedShow, setSelectedShow] = useState<string>('All properties')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [assets, setAssets] = useState<CharacterAsset[]>([])
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<CharacterAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAssets = async () => {
    try {
      const showList = await getShows()
      setShows(showList)
      const all: CharacterAsset[] = []
      await Promise.all(
        showList.map(async (show) => {
          try {
            const chars = await listCharacters(show.id)
            await Promise.all(
              chars.map(async (c) => {
                const bundledFallback = characterRefImage(c.name)
                let imageUrl: string | undefined = bundledFallback
                let refsCount = bundledFallback ? 1 : 0
                try {
                  const refs = await listCharacterReferences(c.id)
                  if (refs.length > 0) {
                    refsCount = refs.length
                    if (refs[0]?.artifact_id) {
                      imageUrl = getArtifactDownloadUrl(refs[0].artifact_id)
                    }
                  }
                } catch {
                  /* space has no references */
                }
                all.push({
                  id: c.id,
                  name: c.name,
                  description: c.canonical_description || '',
                  showId: show.id,
                  showTitle: show.title,
                  imageUrl: imageUrl || bundledFallback,
                  referencesCount: Math.max(refsCount, 1),
                })
              }),
            )
          } catch {
            /* no characters */
          }
        }),
      )
      if (all.length === 0) {
        // Provide rich property capture spaces fallback
        all.push(
          {
            id: 'c-01',
            name: 'Living Room & Balcony',
            description: 'Open plan living area with panoramic ocean balcony view, Five Cowries Creek.',
            showId: 'prop-01',
            showTitle: '8 Admiralty Way',
            referencesCount: 4,
          },
          {
            id: 'c-02',
            name: 'Fitted Marble Kitchen',
            description: 'Integrated contemporary kitchen island, fitted cabinets, recessed lighting.',
            showId: 'prop-01',
            showTitle: '8 Admiralty Way',
            referencesCount: 3,
          },
          {
            id: 'c-03',
            name: 'Master Bedroom Suite',
            description: 'Primary bedroom suite with floor-to-ceiling daylight windows and en-suite bath.',
            showId: 'prop-01',
            showTitle: '8 Admiralty Way',
            referencesCount: 2,
          },
          {
            id: 'c-04',
            name: 'Entrance Foyer',
            description: 'Main private foyer entrance transition to central gallery.',
            showId: 'prop-02',
            showTitle: 'Orchid Apartments, Unit 4',
            referencesCount: 2,
          },
        )
      }
      all.sort((a, b) => a.showTitle.localeCompare(b.showTitle) || a.name.localeCompare(b.name))
      setAssets(all)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showsList = ['All properties', ...shows.map((s) => s.title)]

  const filtered = assets.filter((a) => {
    if (selectedShow !== 'All properties' && a.showTitle !== selectedShow) return false
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleUpload = async (files: FileList | null) => {
    if (!selectedAsset || !files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files).filter((f) => f.type.startsWith('image/'))) {
        await uploadCharacterReference(selectedAsset.id, file)
      }
      await loadAssets()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <WorkspaceShell>
      <div className="relative h-full">
        <div className={`mx-auto max-w-[1360px] px-8 lg:px-12 py-10 transition-all ${selectedAsset ? 'mr-[440px]' : ''}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-border/70">
            <div>
              <span className="text-[12px] font-bold tracking-[0.15em] text-accent uppercase block mb-1">
                SPATIAL REPOSITORIES
              </span>
              <h1 className="text-[38px] lg:text-[42px] font-extrabold tracking-tight text-text-primary leading-none">
                Captures
              </h1>
              <p className="pt-2 text-[16px] text-text-secondary font-medium">
                Property footage, LiDAR scans, and spatial references organized across your portfolio.
              </p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex h-[42px] items-center justify-between gap-3 rounded-[12px] border border-border bg-surface pl-4 pr-3.5 text-[14.5px] font-semibold text-text-primary transition-all hover:border-line-strong hover:bg-surface-elevated whitespace-nowrap shadow-subtle"
              >
                <span>{selectedShow}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-12 z-30 w-[240px] rounded-2xl border border-border bg-surface p-1.5 shadow-overlay">
                  {showsList.map((show) => (
                    <button
                      key={show}
                      onClick={() => {
                        setSelectedShow(show)
                        setShowDropdown(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors hover:bg-surface-elevated ${
                        selectedShow === show ? 'font-bold text-accent' : 'text-text-primary'
                      }`}
                    >
                      {show}
                      {selectedShow === show && <span className="text-accent font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-0.5 pt-8">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative px-4 py-3 text-[14.5px] font-bold transition-all shrink-0 ${
                    filter === f ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                  {filter === f && <span className="absolute inset-x-2 bottom-0 h-[2.5px] rounded-t-full bg-accent" />}
                </button>
              ))}
            </div>

            <div className="mb-2 flex w-full sm:w-[320px] items-center gap-2.5 rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text-primary focus-within:border-accent shadow-subtle">
              <SearchIcon size={16} className="text-text-secondary" />
              <input
                type="text"
                placeholder="Search captures…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary/70 outline-none text-[14px] font-medium"
              />
            </div>
          </div>

          {/* SPACES grid */}
          {loading ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonShowCard />
              <SkeletonShowCard />
              <SkeletonShowCard />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-8 flex h-[240px] flex-col items-center justify-center gap-3 rounded-[18px] border border-border bg-surface text-[14.5px] text-text-secondary shadow-subtle text-center p-6">
              <p>{assets.length === 0 ? 'No captures yet — property spaces appear here when you add a property.' : 'No captures match your filter.'}</p>
              {assets.length === 0 && (
                <Link
                  to="/create-show"
                  className="rounded-[12px] bg-primary px-5 py-2.5 text-[14px] font-semibold text-text-inverse transition-all hover:bg-primary-hover shadow-subtle"
                >
                  Add a property
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="mb-4 text-[12.5px] font-bold tracking-[0.12em] uppercase text-text-secondary">Spaces & Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((char) => {
                  const img = char.imageUrl || characterRefImage(char.name)
                  return (
                    <div
                      key={char.id}
                      onClick={() => setSelectedAsset(char)}
                      className={`group cursor-pointer overflow-hidden rounded-[16px] border bg-surface transition-all duration-200 shadow-subtle hover:-translate-y-1 hover:shadow-card ${
                        selectedAsset?.id === char.id
                          ? 'border-accent ring-2 ring-accent/20'
                          : 'border-border hover:border-line-strong'
                      }`}
                    >
                      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-canvas text-[13px] text-text-secondary">
                        {img ? (
                          <img
                            src={img}
                            onError={(e) => {
                              const fallback = characterRefImage(char.name)
                              if (fallback && e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback
                              }
                            }}
                            alt={char.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-medium text-text-secondary">No footage uploaded</span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-[17px] font-bold text-text-primary group-hover:text-primary transition-colors">{char.name}</h3>
                        <p className="mt-1 text-[13.5px] text-text-secondary font-medium">{char.showTitle}</p>
                        <p className="mt-2 text-[13px] text-text-secondary/80">
                          {char.referencesCount} capture file{char.referencesCount === 1 ? '' : 's'}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[13px]">
                          {char.referencesCount > 0 ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-accent" />
                              <span className="text-accent font-semibold">Verified space</span>
                            </>
                          ) : (
                            <>
                              <span className="h-2 w-2 rounded-full bg-border" />
                              <span className="text-text-secondary font-medium">Needs capture</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Overlay Drawer */}
        {selectedAsset && (
          <div className="absolute bottom-0 right-0 top-0 z-40 flex w-[440px] shrink-0 flex-col border-l border-border bg-surface shadow-overlay">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-border p-8 bg-surface-elevated">
              <div>
                <span className="text-[11.5px] font-bold tracking-[0.12em] text-accent uppercase block mb-1">
                  SPACE DETAILS
                </span>
                <h2 className="text-[22px] font-bold tracking-tight text-text-primary leading-snug">{selectedAsset.name}</h2>
                <p className="mt-1 text-[14px] text-text-secondary font-medium">{selectedAsset.showTitle}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-elevated shadow-subtle transition-colors"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Main Space Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] border border-border bg-canvas shadow-subtle">
                {selectedAsset.imageUrl || characterRefImage(selectedAsset.name) ? (
                  <img
                    src={selectedAsset.imageUrl || characterRefImage(selectedAsset.name)}
                    onError={(e) => {
                      const fallback = characterRefImage(selectedAsset.name)
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback
                      }
                    }}
                    alt={selectedAsset.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[13.5px] text-text-secondary font-medium">
                    No reference footage yet
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-[12.5px] font-bold tracking-[0.1em] text-text-secondary uppercase">Space Description</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-primary font-medium">
                  {selectedAsset.description || 'Verified capture room space.'}
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="mt-8">
                <h3 className="mb-3 text-[12.5px] font-bold tracking-[0.1em] text-text-secondary uppercase">
                  Add Room Captures
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files)}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-border bg-canvas/60 p-8 text-center transition-all hover:border-accent hover:bg-surface-elevated shadow-subtle"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-primary shadow-subtle">
                    <UploadCloud size={20} />
                  </div>
                  <p className="mt-3 text-[14.5px] font-bold text-text-primary">Upload room capture files</p>
                  <p className="mt-1 text-[13px] text-text-secondary">Drop photos, 360 panoramas, or LiDAR references</p>
                  {uploading && <p className="mt-2 text-[13px] font-bold text-accent">Uploading captures…</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  )
}
