export type ShotStatus = 'approved' | 'active' | 'warning' | 'generating' | 'pending'

export interface Shot {
  id: string          // S01
  num: string         // 01
  name: string
  description: string
  sec: number
  time: string        // 00:04
  characters: string
  location: string
  camera: string
  action: string
}

export const shots: Shot[] = [
  { id: 'S01', num: '01', name: 'Entrance', description: 'Main foyer and doorway transition', sec: 4, time: '00:04', characters: 'None', location: 'Entrance foyer', camera: 'Wide shot · Pan', action: 'Smooth tracking entrance into the residence.' },
  { id: 'S02', num: '02', name: 'Living room', description: 'Open plan living area and terrace view', sec: 6, time: '00:06', characters: 'None', location: 'Living room', camera: 'Wide frame · Pan', action: 'Connected to the entrance hall, kitchen and balcony.' },
  { id: 'S03', num: '03', name: 'Kitchen', description: 'Fitted kitchen island and cabinetry', sec: 5, time: '00:05', characters: 'None', location: 'Kitchen', camera: 'Medium shot · Static', action: 'Marble island and contemporary integrated appliances.' },
  { id: 'S04', num: '04', name: 'Main bedroom', description: 'En-suite master suite with natural lighting', sec: 6, time: '00:06', characters: 'None', location: 'Main bedroom', camera: 'Wide frame · Slow push', action: 'Spacious primary bedroom with private bathroom access.' },
  { id: 'S05', num: '05', name: 'Bedroom 2', description: 'Second double bedroom with fitted wardrobes', sec: 5, time: '00:05', characters: 'None', location: 'Bedroom 2', camera: 'Medium close-up · Static', action: 'Guest bedroom overlooking the garden courtyard.' },
  { id: 'S06', num: '06', name: 'Bedroom 3', description: 'Third en-suite bedroom with study nook', sec: 5, time: '00:05', characters: 'None', location: 'Bedroom 3', camera: 'Medium shot · Static', action: 'Ample daylight with custom storage fixtures.' },
  { id: 'S07', num: '07', name: 'Balcony', description: 'Waterfront terrace and outdoor lounge', sec: 7, time: '00:07', characters: 'None', location: 'Balcony', camera: 'Wide panoramic · Static', action: 'Direct panoramic ocean views across Lekki waterfront.' },
  { id: 'S08', num: '08', name: 'Overview', description: 'Connected full spatial walkthrough', sec: 8, time: '00:08', characters: 'None', location: 'Full Residence', camera: '3D Spatial view', action: 'Interactive spatial navigation model generated.' },
]

/* Refined architectural placeholder gradients per space */
export const shotGradients: Record<string, string> = {
  S01: 'linear-gradient(135deg, #E6E7E2 0%, #DEDFDA 55%, #C9CBC5 100%)',
  S02: 'linear-gradient(135deg, #F1F1EE 0%, #E6E7E2 60%, #DEDFDA 100%)',
  S03: 'linear-gradient(135deg, #ECEDE9 0%, #E6E7E2 50%, #C9CBC5 100%)',
  S04: 'linear-gradient(135deg, #F5F5F2 0%, #E6E7E2 65%, #DEDFDA 100%)',
  S05: 'linear-gradient(135deg, #FAFAF8 0%, #ECEDE9 45%, #DEDFDA 100%)',
  S06: 'linear-gradient(135deg, #F1F1EE 0%, #E6E7E2 60%, #DEDFDA 100%)',
  S07: 'linear-gradient(135deg, #E9EAE6 0%, #DEDFDA 50%, #C9CBC5 100%)',
  S08: 'linear-gradient(135deg, #F5F5F2 0%, #E6E7E2 55%, #C9CBC5 100%)',
}

export const sidebarSteps = [
  'Brief', 'Plan', 'References', 'Keyframes',
  'Animation', 'Audio', 'Assembly', 'Final review',
] as const

export type StepName = (typeof sidebarSteps)[number]
