// Show artwork: prefers backend-generated posters, falls back to bundled key art.
import { useEffect, useState } from 'react'
import { API_BASE_URL } from './api'
import propAdmiralty from '../assets/prop-admiralty.jpg'
import propOrchid from '../assets/prop-orchid.jpg'
import propLekkiGardens from '../assets/prop-lekkigardens.jpg'
import propBourdillon from '../assets/prop-bourdillon.jpg'
import propHeroWaterfront from '../assets/prop-hero-waterfront.jpg'
import demoLiving from '../assets/demo-living-room.jpg'
import demoExterior from '../assets/demo-exterior.jpg'
import demoKitchen from '../assets/demo-kitchen.jpg'
import demoBed from '../assets/demo-master-bedroom.jpg'
import demoBath from '../assets/demo-bathroom.jpg'
import demoBalcony from '../assets/demo-balcony.jpg'

const POSTERS: Record<string, string> = {
  '72691 homestead road': demoLiving,
  '72691 homestead road, palm desert': demoLiving,
  'homestead road': demoLiving,
  'homestead-pd': demoLiving,
  '2847 laurel canyon rd, unit 12a': demoLiving,
  '2847 laurel canyon rd': demoLiving,
  'laurel-12a': demoLiving,
  '8 admiralty way': propAdmiralty,
  'orchid apartments': propOrchid,
  'orchid apartments, unit 4': propOrchid,
  'lekki gardens': propLekkiGardens,
  'lekki gardens, unit 12': propLekkiGardens,
  'bourdillon court': propBourdillon,
  'fruitful secrets': propAdmiralty,
  'the lucky wallet': propOrchid,
}

const BANNERS: Record<string, string> = {
  '72691 homestead road': demoLiving,
  '72691 homestead road, palm desert': demoLiving,
  'homestead road': demoLiving,
  'homestead-pd': demoLiving,
  '2847 laurel canyon rd, unit 12a': demoLiving,
  '2847 laurel canyon rd': demoLiving,
  'laurel-12a': demoLiving,
  '8 admiralty way': propHeroWaterfront,
  'orchid apartments': propOrchid,
  'orchid apartments, unit 4': propOrchid,
  'lekki gardens': propLekkiGardens,
  'lekki gardens, unit 12': propLekkiGardens,
  'bourdillon court': propBourdillon,
  'fruitful secrets': propHeroWaterfront,
  'the lucky wallet': propOrchid,
}

const CHARACTER_REFS: Record<string, string> = {
  'entrance': demoExterior,
  'entry & patio': demoExterior,
  'entry foyer': demoExterior,
  'patio': demoExterior,
  'living room': demoLiving,
  'living': demoLiving,
  'kitchen': demoKitchen,
  'dining & kitchen': demoKitchen,
  'dining': demoKitchen,
  'primary suite': demoBed,
  'primary bedroom': demoBed,
  'main bedroom': demoBed,
  'bedroom 2': demoBed,
  'guest suite': demoBed,
  'bedroom 3': demoBed,
  'primary bathroom': demoBath,
  'bathroom': demoBath,
  'bath': demoBath,
  'pool & outdoor': demoBalcony,
  'pool': demoBalcony,
  'balcony': demoBalcony,
  'balcony terrace': demoBalcony,
  'terrace': demoBalcony,
  'foyer': demoExterior,
}

export function characterRefImage(name?: string | null): string | undefined {
  if (!name) return undefined
  const key = name.trim().toLowerCase()
  if (CHARACTER_REFS[key]) return CHARACTER_REFS[key]
  for (const [k, v] of Object.entries(CHARACTER_REFS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return propAdmiralty
}

// Cache of showId -> generated poster URL. Only positive results are cached —
// a missing poster is re-checked on next mount (it may still be generating).
const generatedPosters = new Map<string, string>()

/** Resolve a show's poster: backend-generated first (async), bundled art as fallback. */
export async function resolvePoster(showId: string, title?: string | null): Promise<string | undefined> {
  const cached = generatedPosters.get(showId)
  if (cached) return cached
  try {
    const response = await fetch(`${API_BASE_URL}/shows/${encodeURIComponent(showId)}/poster`)
    if (response.ok) {
      const data = (await response.json()) as { download_url: string }
      const url = `${API_BASE_URL.replace(/\/api$/, '')}${data.download_url}`
      generatedPosters.set(showId, url)
      return url
    }
  } catch {
    /* backend unreachable — fall through to bundled art */
  }
  return showPoster(title)
}

export function showPoster(title?: string | null): string | undefined {
  return title ? POSTERS[title.trim().toLowerCase()] : undefined
}

export function showBanner(title?: string | null): string | undefined {
  return title ? BANNERS[title.trim().toLowerCase()] : undefined
}

/** React hook: poster for a show — backend-generated first, bundled art immediately as placeholder. */
export function usePoster(showId?: string | null, title?: string | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => showPoster(title))
  useEffect(() => {
    setUrl(showPoster(title))
    if (!showId) return
    let cancelled = false
    resolvePoster(showId, title).then((resolved) => {
      if (!cancelled && resolved) setUrl(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [showId, title])
  return url
}
