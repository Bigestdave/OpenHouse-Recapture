import type { Workspace, Property, CaptureRequest, StoreState } from './types';
import propAdmiraltyImg from '../assets/prop-admiralty.jpg';
import propOrchidImg from '../assets/prop-orchid.jpg';
import propLekkiImg from '../assets/prop-lekkigardens.jpg';
import propBourdillonImg from '../assets/prop-bourdillon.jpg';
import propKitchenImg from '../assets/prop-kitchen.png';

const now = Date.now();
// Stable IDs — never random so localStorage stays valid across reloads

export const SEED_WORKSPACE: Workspace = {
  id: 'ws-default',
  name: "Kiki Casa",
  ownerName: 'David Olabowale',
  ownerEmail: 'david@openhouse.com',
  workType: 'agency',
  portfolioSize: '11–50 active properties',
  primaryMarket: 'Lagos, Nigeria',
  teamSize: '2–5 people',
  listingSource: 'demo',
  requireApproval: true,
  defaultVisibility: 'unlisted',
  notificationPreferences: {
    captureRequired: true,
    reviewReady: true,
    published: true,
    processingFailed: true,
    everyUpdate: false,
    channels: ['email', 'in_app'],
  },
  createdAt: now - 86400000 * 30,
};

export const SEED_PROPERTIES: Property[] = [
  // ─── PROPERTY 1: Needs Recapture ──────────────────────────────────────────
  {
    id: 'prop-01',
    title: '8 Admiralty Way',
    address: 'Lekki Phase 1, Lagos',
    type: '3-bed apartment',
    bedrooms: 3,
    bathrooms: 2,
    price: '₦8,000,000/year',
    description: 'Beautiful 3-bedroom apartment on the 9th floor of Admiralty Tower with panoramic lagoon views.',
    status: 'needs_recapture',
    spaces: [
      { id: 'p01-s1', name: 'Living Room', captured: true, verified: true, issues: [], thumbnailUrl: propAdmiraltyImg },
      { id: 'p01-s2', name: 'Kitchen', captured: true, verified: true, issues: [], thumbnailUrl: propKitchenImg },
      { id: 'p01-s3', name: 'Main Bedroom', captured: true, verified: true, issues: [] },
      { id: 'p01-s4', name: 'Bedroom 2', captured: true, verified: true, issues: [] },
      { id: 'p01-s5', name: 'Bedroom 3', captured: true, verified: true, issues: [] },
      { id: 'p01-s6', name: 'Main Bathroom', captured: true, verified: true, issues: [] },
      { id: 'p01-s7', name: 'Balcony', captured: false, verified: false, issues: ['Missing full capture — entrance not shown'] },
    ],
    sourceMedia: [],
    timeline: [
      { id: 'p01-t1', timestamp: now - 3600000 * 6, event: 'Property detected from listing', type: 'detection', detail: 'Pulled from PropertyPro listing #8AW' },
      { id: 'p01-t2', timestamp: now - 3600000 * 5, event: 'Media analysis started', type: 'analysis', detail: '14 source images and 2 videos found' },
      { id: 'p01-t3', timestamp: now - 3600000 * 4, event: 'All rooms identified', type: 'analysis', detail: '7 distinct spaces mapped', agentDecision: 'Confidence 94% — proceeding' },
      { id: 'p01-t4', timestamp: now - 3600000 * 3, event: 'Balcony entrance missing', type: 'error', detail: 'Balcony listed but doorway not captured in any media file' },
      { id: 'p01-t5', timestamp: now - 3600000 * 2, event: 'Capture request sent', type: 'capture_request', detail: 'WhatsApp notification sent to David Olabowale' },
    ],
    coverImage: propAdmiraltyImg,
    createdAt: now - 86400000 * 2,
    updatedAt: now - 3600000 * 2,
    workspaceId: 'ws-default',
  },

  // ─── PROPERTY 2: Preparing / Reconstruction ────────────────────────────────
  {
    id: 'prop-02',
    title: '14 Bourdillon Road',
    address: 'Ikoyi, Lagos',
    type: '5-bed detached house',
    bedrooms: 5,
    bathrooms: 6,
    price: '₦45,000,000/year',
    description: 'Elegant colonial-style 5-bedroom detached house with private pool and garden in the heart of Ikoyi.',
    status: 'preparing',
    spaces: [
      { id: 'p02-s1', name: 'Entrance Hall', captured: true, verified: true, issues: [] },
      { id: 'p02-s2', name: 'Living Room', captured: true, verified: true, issues: [] },
      { id: 'p02-s3', name: 'Dining Room', captured: true, verified: true, issues: [] },
      { id: 'p02-s4', name: 'Kitchen', captured: true, verified: true, issues: [], thumbnailUrl: propKitchenImg },
      { id: 'p02-s5', name: 'Main Bedroom', captured: true, verified: true, issues: [] },
      { id: 'p02-s6', name: 'Bedroom 2', captured: true, verified: true, issues: [] },
      { id: 'p02-s7', name: 'Bedroom 3', captured: true, verified: true, issues: [] },
      { id: 'p02-s8', name: 'Bedroom 4', captured: true, verified: true, issues: [] },
      { id: 'p02-s9', name: 'Bedroom 5', captured: true, verified: true, issues: [] },
      { id: 'p02-s10', name: 'Garden Terrace', captured: true, verified: true, issues: [] },
    ],
    sourceMedia: [],
    timeline: [
      { id: 'p02-t1', timestamp: now - 3600000 * 8, event: 'Property detected', type: 'detection', detail: 'Imported from private listing brief' },
      { id: 'p02-t2', timestamp: now - 3600000 * 7, event: 'All 10 spaces confirmed', type: 'analysis', agentDecision: 'Full media coverage verified' },
      { id: 'p02-t3', timestamp: now - 3600000 * 5, event: 'Reconstruction started', type: 'reconstruction', detail: 'Gaussian splat pipeline initialised' },
      { id: 'p02-t4', timestamp: now - 3600000 * 3, event: 'Additional balcony footage received', type: 'capture_received', detail: 'New footage uploaded by David Olabowale' },
      { id: 'p02-t5', timestamp: now - 3600000 * 2, event: 'Capture quality passed', type: 'analysis', detail: 'All footage verified — 180 keyframes extracted' },
      { id: 'p02-t6', timestamp: now - 3600000 * 1, event: 'Reconstruction resumed', type: 'reconstruction', detail: 'Building connected experience' },
    ],
    coverImage: propBourdillonImg,
    createdAt: now - 86400000 * 3,
    updatedAt: now - 3600000 * 1,
    workspaceId: 'ws-default',
  },

  // ─── PROPERTY 3: Quality Check ────────────────────────────────────────────
  {
    id: 'prop-03',
    title: 'Orchid Road Luxury Villa',
    address: 'Orchid Road, Lekki, Lagos',
    type: '4-bed semi-detached villa',
    bedrooms: 4,
    bathrooms: 5,
    price: '₦22,000,000/year',
    description: 'Spacious 4-bedroom semi-detached villa in the sought-after Orchid Road corridor.',
    status: 'quality_check',
    spaces: [
      { id: 'p03-s1', name: 'Entrance Porch', captured: true, verified: true, issues: [] },
      { id: 'p03-s2', name: 'Living Room', captured: true, verified: true, issues: [] },
      { id: 'p03-s3', name: 'Kitchen', captured: true, verified: true, issues: [], thumbnailUrl: propKitchenImg },
      { id: 'p03-s4', name: 'Main Bedroom', captured: true, verified: true, issues: [] },
      { id: 'p03-s5', name: 'Bedroom 2', captured: true, verified: true, issues: [] },
    ],
    sourceMedia: [],
    timeline: [
      { id: 'p03-t1', timestamp: now - 86400000, event: 'Reconstruction complete', type: 'reconstruction', detail: 'All 5 rooms stitched and aligned' },
      { id: 'p03-t2', timestamp: now - 43200000, event: 'Privacy check running', type: 'verification', detail: 'Scanning for faces, documents, and personal items', agentDecision: 'Automated check in progress' },
      { id: 'p03-t3', timestamp: now - 3600000 * 2, event: 'Spatial fidelity check', type: 'verification', detail: 'Comparing rendered rooms against source listing dimensions' },
    ],
    coverImage: propOrchidImg,
    createdAt: now - 86400000 * 4,
    updatedAt: now - 3600000 * 2,
    workspaceId: 'ws-default',
  },

  // ─── PROPERTY 4: Ready for Review ─────────────────────────────────────────
  {
    id: 'prop-04',
    title: 'Lekki Gardens, Unit 12',
    address: 'Lekki Phase 1, Lagos',
    type: '3-bed terrace duplex',
    bedrooms: 3,
    bathrooms: 3,
    price: '₦6,000,000/year',
    description: 'Modern 3-bed terrace duplex with rooftop terrace and fitted kitchen.',
    status: 'ready_for_review',
    spaces: [
      { id: 'p04-s1', name: 'Living Room', captured: true, verified: true, issues: [] },
      { id: 'p04-s2', name: 'Kitchen', captured: true, verified: true, issues: [], thumbnailUrl: propKitchenImg },
      { id: 'p04-s3', name: 'Dining Area', captured: true, verified: true, issues: [] },
      { id: 'p04-s4', name: 'Main Bedroom', captured: true, verified: true, issues: [] },
      { id: 'p04-s5', name: 'Bedroom 2', captured: true, verified: true, issues: [] },
      { id: 'p04-s6', name: 'Rooftop Terrace', captured: true, verified: true, issues: [] },
    ],
    sourceMedia: [],
    timeline: [
      { id: 'p04-t1', timestamp: now - 86400000 * 3, event: 'Property detected', type: 'detection' },
      { id: 'p04-t2', timestamp: now - 86400000 * 2, event: 'Full pipeline complete', type: 'reconstruction', detail: '6 rooms, all verified and stitched' },
      { id: 'p04-t3', timestamp: now - 86400000 * 1, event: 'Privacy & fidelity checks passed', type: 'verification', agentDecision: 'No issues found — experience approved for review' },
      { id: 'p04-t4', timestamp: now - 3600000 * 4, event: 'Awaiting agent approval', type: 'info', detail: 'Tour ready to publish to listings' },
    ],
    coverImage: propLekkiImg,
    createdAt: now - 86400000 * 5,
    updatedAt: now - 86400000 * 1,
    workspaceId: 'ws-default',
  },

  // ─── PROPERTY 5: Live ─────────────────────────────────────────────────────
  {
    id: 'prop-05',
    title: 'Victoria Courts, Unit 8',
    address: 'Victoria Island, Lagos',
    type: '4-bed penthouse',
    bedrooms: 4,
    bathrooms: 4,
    price: '₦18,000,000/year',
    description: 'Spectacular 4-bedroom penthouse on the 18th floor with floor-to-ceiling glass and city skyline views.',
    status: 'live',
    spaces: [
      { id: 'p05-s1', name: 'Foyer', captured: true, verified: true, issues: [] },
      { id: 'p05-s2', name: 'Open Plan Living', captured: true, verified: true, issues: [] },
      { id: 'p05-s3', name: 'Kitchen & Island', captured: true, verified: true, issues: [], thumbnailUrl: propKitchenImg },
      { id: 'p05-s4', name: 'Main Bedroom Suite', captured: true, verified: true, issues: [] },
      { id: 'p05-s5', name: 'Bedroom 2', captured: true, verified: true, issues: [] },
      { id: 'p05-s6', name: 'Bedroom 3', captured: true, verified: true, issues: [] },
      { id: 'p05-s7', name: 'Bedroom 4', captured: true, verified: true, issues: [] },
      { id: 'p05-s8', name: 'Private Terrace', captured: true, verified: true, issues: [] },
    ],
    sourceMedia: [],
    timeline: [
      { id: 'p05-t1', timestamp: now - 86400000 * 7, event: 'Property detected', type: 'detection' },
      { id: 'p05-t2', timestamp: now - 86400000 * 6, event: 'Full pipeline complete', type: 'reconstruction' },
      { id: 'p05-t3', timestamp: now - 86400000 * 5, event: 'Quality checks passed', type: 'verification' },
      { id: 'p05-t4', timestamp: now - 86400000 * 4, event: 'Approved by David Olabowale', type: 'approval', detail: 'All 8 rooms confirmed' },
      { id: 'p05-t5', timestamp: now - 86400000 * 3, event: 'Published to listing', type: 'publication', detail: 'Live 24/7 virtual open house active' },
      { id: 'p05-t6', timestamp: now - 86400000 * 1, event: '47 unique visitor sessions', type: 'info', detail: 'Avg session 4m 32s · 3 inspection bookings received' },
    ],
    experienceUrl: '/view/prop-05',
    coverImage: undefined,
    createdAt: now - 86400000 * 10,
    updatedAt: now - 86400000 * 1,
    workspaceId: 'ws-default',
  }
];

export const SEED_CAPTURE_REQUESTS: CaptureRequest[] = [
  {
    id: 'cr-01',
    propertyId: 'prop-01',
    propertyTitle: '8 Admiralty Way',
    room: 'Balcony',
    reason: 'The balcony is listed in the property details but its doorway entrance was not captured in any media submitted.',
    instructions: 'Stand in the living room doorway facing the balcony. Record one slow, steady 15-second video moving through to the full balcony. End the video showing the full balcony space.',
    status: 'awaiting_capture',
    estimatedTime: '1 minute',
    recipientName: 'David Olabowale',
    captureUrl: '/capture/prop-01',
    createdAt: now - 3600000 * 2,
    updatedAt: now - 3600000 * 2,
  },
  {
    id: 'cr-02',
    propertyId: 'prop-02',
    propertyTitle: '14 Bourdillon Road',
    room: 'Garden Terrace',
    reason: 'Garden terrace footage had excessive motion blur and could not be used for reconstruction.',
    instructions: 'Record a steady 20-second pass along the garden terrace from the rear of the house to the pool edge.',
    status: 'resolved',
    estimatedTime: '1 minute',
    recipientName: 'David Olabowale',
    captureUrl: '/capture/prop-02',
    createdAt: now - 86400000,
    updatedAt: now - 43200000,
  },
  {
    id: 'cr-03',
    propertyId: 'prop-03',
    propertyTitle: 'Orchid Road Luxury Villa',
    room: 'Bedroom 2',
    reason: 'Bedroom 2 doorway connection to the corridor was not captured — rooms appear disconnected.',
    instructions: 'Start at the corridor outside Bedroom 2. Slowly open the door and walk through to show the full room. 10 seconds is enough.',
    status: 'awaiting_capture',
    estimatedTime: '30 seconds',
    recipientName: 'Tola Adeyemi',
    captureUrl: '/capture/prop-03',
    createdAt: now - 3600000 * 5,
    updatedAt: now - 3600000 * 5,
  },
];

export function getSeedData(): StoreState {
  return {
    workspace: SEED_WORKSPACE,
    properties: SEED_PROPERTIES,
    captureRequests: SEED_CAPTURE_REQUESTS,
    bookings: [],
    initialized: true,
  };
}
