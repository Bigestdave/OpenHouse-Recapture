import { useSyncExternalStore } from 'react';
import type {
  StoreState,
  Property,
  CaptureRequest,
  Booking,
  Workspace,
  PropertyStatus,
  TimelineEvent,
  MediaItem,
} from './types';
import { getSeedData } from './seed';
import {
  fetchCloudStoreState,
  syncPropertyToCloud,
  deletePropertyFromCloud,
  syncCaptureRequestToCloud,
  syncBookingToCloud,
  syncWorkspaceToCloud,
} from './supabaseStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/runtime';

const STORAGE_KEY = 'openhouse.store';
const STORE_VERSION = 'v3-stable-ids'; // bump this to force-wipe stale localStorage
const VERSION_KEY = 'openhouse.store.version';

// Wipe stale data from old sessions whenever seed version changes
try {
  if (localStorage.getItem(VERSION_KEY) !== STORE_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, STORE_VERSION);
  }
} catch { /* ignore */ }

let initialSeed: StoreState | null = null;
if (isDemoMode) {
  try {
    initialSeed = getSeedData();
  } catch (error) {
    console.warn('Seed data not available', error);
  }
}

let state: StoreState = {
  workspace: initialSeed?.workspace || null,
  properties: initialSeed?.properties || [],
  captureRequests: initialSeed?.captureRequests || [],
  bookings: initialSeed?.bookings || [],
  initialized: false,
};

const listeners = new Set<(state: StoreState) => void>();

// --- Core Store Functions ---

function notify() {
  listeners.forEach((listener) => listener(state));
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function initStore() {
  if (state.initialized) return;

  if (!isDemoMode) {
    state = { workspace: null, properties: [], captureRequests: [], bookings: [], initialized: true };
    notify();
    if (isSupabaseConfigured) {
      fetchCloudStoreState().then((cloudData) => {
        if (!cloudData) return;
        state = {
          ...state,
          workspace: cloudData.workspace ?? null,
          properties: cloudData.properties ?? [],
          captureRequests: cloudData.captureRequests ?? [],
          bookings: cloudData.bookings ?? [],
        };
        notify();
      });
    }
    return;
  }

  // 1. Initial synchronous hydration from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.properties) && parsed.properties.length > 0) {
        state = { ...parsed, initialized: true };
      } else {
        const seed = getSeedData();
        state = { ...seed, initialized: true };
      }
    } else {
      const seed = getSeedData();
      state = { ...seed, initialized: true };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    const seed = getSeedData();
    state = { ...seed, initialized: true };
  }

  persist();
  notify();

  // 3. Asynchronous cloud hydration if Supabase is configured
  if (isSupabaseConfigured) {
    fetchCloudStoreState().then((cloudData) => {
      if (cloudData && cloudData.properties && cloudData.properties.length > 0) {
        state = {
          ...state,
          workspace: cloudData.workspace || state.workspace,
          properties: cloudData.properties,
          captureRequests: cloudData.captureRequests || state.captureRequests,
          bookings: cloudData.bookings || state.bookings,
        };
        persist();
        notify();
      }
    });
  }
}

// Auto-initialize on module load
initStore();

export function resetStore() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
  
  if (!isDemoMode) {
    state = { workspace: null, properties: [], captureRequests: [], bookings: [], initialized: true };
    notify();
    return;
  }

  let seed: StoreState | null = null;
  try {
    seed = getSeedData();
  } catch (error) {
    console.warn('Seed data not available', error);
  }

  if (seed) {
    state = { ...seed, initialized: true };
  } else {
    state = {
      workspace: null,
      properties: [],
      captureRequests: [],
      bookings: [],
      initialized: true,
    };
  }
  
  persist();
  notify();
}

export function getState(): StoreState {
  return state;
}

export function subscribe(listener: (state: StoreState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// --- Properties API ---

export function getProperties(): Property[] {
  return state.properties;
}

export function getProperty(id: string): Property | undefined {
  return state.properties.find((p) => p.id === id);
}

export function addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
  const newProperty: Property = {
    ...property,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state = {
    ...state,
    properties: [newProperty, ...state.properties],
  };
  persist();
  notify();

  // Background Cloud Sync
  syncPropertyToCloud(newProperty);

  return newProperty;
}

export function updateProperty(id: string, updates: Partial<Property>): Property | undefined {
  let updatedProperty: Property | undefined;
  state = {
    ...state,
    properties: state.properties.map((p) => {
      if (p.id === id) {
        updatedProperty = { ...p, ...updates, updatedAt: Date.now() };
        return updatedProperty;
      }
      return p;
    }),
  };
  if (updatedProperty) {
    persist();
    notify();
    syncPropertyToCloud(updatedProperty);
  }
  return updatedProperty;
}

export function updatePropertyStatus(
  id: string,
  status: PropertyStatus,
  timelineEvent?: Omit<TimelineEvent, 'id' | 'timestamp'>
): Property | undefined {
  let updatedProperty: Property | undefined;
  state = {
    ...state,
    properties: state.properties.map((p) => {
      if (p.id === id) {
        const updatedTimeline = timelineEvent
          ? [
              { ...timelineEvent, id: generateId(), timestamp: Date.now() },
              ...p.timeline,
            ]
          : p.timeline;
        
        updatedProperty = {
          ...p,
          status,
          timeline: updatedTimeline,
          updatedAt: Date.now(),
        };
        return updatedProperty;
      }
      return p;
    }),
  };
  if (updatedProperty) {
    persist();
    notify();
    syncPropertyToCloud(updatedProperty);
  }
  return updatedProperty;
}

export function addTimelineEvent(propertyId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): void {
  let updatedProperty: Property | undefined;
  state = {
    ...state,
    properties: state.properties.map((p) => {
      if (p.id === propertyId) {
        updatedProperty = {
          ...p,
          timeline: [
            { ...event, id: generateId(), timestamp: Date.now() },
            ...p.timeline,
          ],
          updatedAt: Date.now(),
        };
        return updatedProperty;
      }
      return p;
    }),
  };
  persist();
  notify();
  if (updatedProperty) {
    syncPropertyToCloud(updatedProperty);
  }
}

export function deleteProperty(id: string): void {
  state = {
    ...state,
    properties: state.properties.filter((p) => p.id !== id),
  };
  persist();
  notify();
  deletePropertyFromCloud(id);
}

export function getPropertiesByStatus(status: PropertyStatus): Property[] {
  return state.properties.filter((p) => p.status === status);
}

export function getPropertyStats() {
  const stats = { total: 0, live: 0, preparing: 0, needsAttention: 0, readyForReview: 0 };
  state.properties.forEach((p) => {
    stats.total++;
    if (p.status === 'live') stats.live++;
    if (p.status === 'preparing') stats.preparing++;
    if (p.status === 'needs_recapture' || p.status === 'failed') stats.needsAttention++;
    if (p.status === 'ready_for_review') stats.readyForReview++;
  });
  return stats;
}

// --- Capture Requests API ---

export function getCaptureRequests(): CaptureRequest[] {
  return state.captureRequests;
}

export function getCaptureRequest(id: string): CaptureRequest | undefined {
  return state.captureRequests.find((cr) => cr.id === id);
}

export function getCaptureRequestsForProperty(propertyId: string): CaptureRequest[] {
  return state.captureRequests.filter((cr) => cr.propertyId === propertyId);
}

export function addCaptureRequest(
  request: Omit<CaptureRequest, 'id' | 'createdAt' | 'updatedAt' | 'captureUrl'>
): CaptureRequest {
  const id = generateId();
  const newRequest: CaptureRequest = {
    ...request,
    id,
    captureUrl: `/capture/${id}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state = {
    ...state,
    captureRequests: [newRequest, ...state.captureRequests],
  };
  persist();
  notify();

  syncCaptureRequestToCloud(newRequest);

  return newRequest;
}

export function updateCaptureRequest(id: string, updates: Partial<CaptureRequest>): CaptureRequest | undefined {
  let updatedRequest: CaptureRequest | undefined;
  state = {
    ...state,
    captureRequests: state.captureRequests.map((cr) => {
      if (cr.id === id) {
        updatedRequest = { ...cr, ...updates, updatedAt: Date.now() };
        return updatedRequest;
      }
      return cr;
    }),
  };
  if (updatedRequest) {
    persist();
    notify();
    syncCaptureRequestToCloud(updatedRequest);
  }
  return updatedRequest;
}

export function resolveCaptureRequest(id: string, media?: MediaItem[]): void {
  const request = getCaptureRequest(id);
  if (!request) return;

  // Update capture request
  updateCaptureRequest(id, {
    status: 'resolved',
    uploadedMedia: media || [],
  });

  // Update associated property and space
  let modifiedProperty: Property | undefined;
  state = {
    ...state,
    properties: state.properties.map((p) => {
      if (p.id === request.propertyId) {
        // Find if there are other pending requests for this property
        const otherPendingRequests = state.captureRequests.filter(
          (cr) => cr.propertyId === p.id && cr.id !== id && cr.status !== 'resolved' && cr.status !== 'failed'
        );
        
        // Update space
        const updatedSpaces = p.spaces.map((space) => {
          if (space.name === request.room || space.captureRequestId === id) {
            return { ...space, captured: true };
          }
          return space;
        });

        const newStatus =
          p.status === 'needs_recapture' && otherPendingRequests.length === 0
            ? 'checking_media'
            : p.status;

        modifiedProperty = {
          ...p,
          spaces: updatedSpaces,
          status: newStatus,
          updatedAt: Date.now(),
        };
        return modifiedProperty;
      }
      return p;
    }),
  };
  
  persist();
  notify();

  if (modifiedProperty) {
    syncPropertyToCloud(modifiedProperty);
  }
}

// --- Bookings API ---

export function getBookings(): Booking[] {
  return state.bookings;
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const newBooking: Booking = {
    ...booking,
    id: generateId(),
    createdAt: Date.now(),
  };
  state = {
    ...state,
    bookings: [newBooking, ...state.bookings],
  };
  persist();
  notify();

  syncBookingToCloud(newBooking);

  return newBooking;
}

// --- Workspace API ---

export function getWorkspace(): Workspace | null {
  return state.workspace;
}

export async function setWorkspace(workspace: Workspace): Promise<void> {
  if (!isDemoMode) await syncWorkspaceToCloud(workspace);
  state = {
    ...state,
    workspace,
  };
  if (isDemoMode) persist();
  notify();
  if (isDemoMode) void syncWorkspaceToCloud(workspace);
}

// --- React Hooks ---

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useProperty(id: string): Property | undefined {
  const currentStore = useStore();
  if (!id) return currentStore.properties[0];
  return (
    currentStore.properties.find((p) => p.id === id) ||
    currentStore.properties.find((p) => p.id.toLowerCase() === id.toLowerCase()) ||
    currentStore.properties.find((p) =>
      p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(id.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    ) ||
    currentStore.properties.find((p) =>
      id.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    ) ||
    currentStore.properties[0]
  );
}

export function usePropertyStats() {
  const currentStore = useStore();
  const stats = { total: 0, live: 0, preparing: 0, needsAttention: 0, readyForReview: 0 };
  currentStore.properties.forEach((p) => {
    stats.total++;
    if (p.status === 'live') stats.live++;
    if (p.status === 'preparing') stats.preparing++;
    if (p.status === 'needs_recapture' || p.status === 'failed') stats.needsAttention++;
    if (p.status === 'ready_for_review') stats.readyForReview++;
  });
  return stats;
}

export function useCaptureRequests(): CaptureRequest[] {
  const currentStore = useStore();
  return currentStore.captureRequests;
}

export async function syncWithSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;

  const cloudData = await fetchCloudStoreState();
  if (!cloudData) return;

  state = isDemoMode ? {
    ...state,
    workspace: cloudData.workspace ?? state.workspace,
    properties: cloudData.properties ?? state.properties,
    captureRequests: cloudData.captureRequests ?? state.captureRequests,
    bookings: cloudData.bookings ?? state.bookings,
  } : {
    ...state,
    workspace: cloudData.workspace ?? null,
    properties: cloudData.properties ?? [],
    captureRequests: cloudData.captureRequests ?? [],
    bookings: cloudData.bookings ?? [],
  };
  if (isDemoMode) persist();
  notify();
}

