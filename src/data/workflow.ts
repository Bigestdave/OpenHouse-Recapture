import { getProperty, updatePropertyStatus, addCaptureRequest, addTimelineEvent, addProperty } from './store';
import type { Property, Space } from './types';

// Store active timers
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Cancel any running workflow timers (cleanup on unmount).
 */
export function cancelWorkflow(propertyId: string): void {
  const timer = activeTimers.get(propertyId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(propertyId);
  }
}

function setWorkflowTimer(propertyId: string, delayMs: number, callback: () => void) {
  cancelWorkflow(propertyId);
  const timer = setTimeout(() => {
    activeTimers.delete(propertyId);
    callback();
  }, delayMs);
  activeTimers.set(propertyId, timer);
}

/**
 * Start the autonomous workflow for a newly detected property.
 * This simulates the agent processing pipeline with realistic delays.
 * Each step adds a timeline event explaining what the agent did.
 */
export function startPropertyWorkflow(propertyId: string): void {
  const property = getProperty(propertyId);
  if (!property) return;

  updatePropertyStatus(propertyId, 'detected');
  addTimelineEvent(propertyId, {
    type: 'detection',
    event: 'New listing detected',
    detail: 'Property information collected from listing portal',
  });

  setWorkflowTimer(propertyId, 2000, () => {
    const currentProp = getProperty(propertyId);
    if (!currentProp) return;

    updatePropertyStatus(propertyId, 'checking_media');
    const mediaCount = currentProp.sourceMedia?.length || 0;
    const spaceCount = currentProp.spaces?.length || 0;
    addTimelineEvent(propertyId, {
      type: 'analysis',
      event: 'Checking media quality and coverage',
      detail: `Evaluating ${mediaCount} source images across ${spaceCount} advertised spaces`,
    });

    // If insufficient, needs recapture in 3s; if sufficient, prepares in 4s.
    const missingSpace = currentProp.spaces.find((s) => s.captured === false);
    const delay = missingSpace ? 3000 : 4000;

    setWorkflowTimer(propertyId, delay, () => {
      const propToCheck = getProperty(propertyId);
      if (!propToCheck) return;

      const stillMissingSpace = propToCheck.spaces.find((s) => s.captured === false);

      if (stillMissingSpace) {
        updatePropertyStatus(propertyId, 'needs_recapture');
        addTimelineEvent(propertyId, {
          type: 'capture_request',
          event: `Coverage insufficient for ${stillMissingSpace.name}`,
          detail: 'Capture request sent to Property Manager',
        });

        if (typeof addCaptureRequest === 'function') {
          addCaptureRequest({
            propertyId,
            propertyTitle: propToCheck.title,
            room: stillMissingSpace.name,
            reason: 'Insufficient coverage',
            instructions: `Please provide a 360 panorama or clear photos of the ${stillMissingSpace.name}`,
            estimatedTime: '5 mins',
            recipientName: 'Property Manager',
            status: 'sent',
          });
        }
      } else {
        startPreparing(propertyId);
      }
    });
  });
}

function startPreparing(propertyId: string) {
  updatePropertyStatus(propertyId, 'preparing');
  addTimelineEvent(propertyId, {
    type: 'reconstruction',
    event: 'Evidence requirements satisfied',
    detail: 'Building interactive experience',
  });

  setWorkflowTimer(propertyId, 8000, () => {
    updatePropertyStatus(propertyId, 'quality_check');
    addTimelineEvent(propertyId, {
      type: 'verification',
      event: 'Reconstruction complete',
      detail: 'Comparing result against source evidence',
    });

    setWorkflowTimer(propertyId, 5000, () => {
      updatePropertyStatus(propertyId, 'ready_for_review');
      addTimelineEvent(propertyId, {
        type: 'approval',
        event: 'Quality verification passed',
        detail: 'Publication approval requested',
      });
    });
  });
}

/**
 * Resume the workflow after a capture request is resolved.
 * Called automatically by store.resolveCaptureRequest, but can also be called manually.
 */
export function resumePropertyWorkflow(propertyId: string): void {
  const property = getProperty(propertyId);
  if (!property) return;

  updatePropertyStatus(propertyId, 'checking_media');
  addTimelineEvent(propertyId, {
    type: 'analysis',
    event: 'Checking media quality and coverage',
    detail: 'Evaluating newly uploaded media',
  });

  setWorkflowTimer(propertyId, 4000, () => {
    const currentProp = getProperty(propertyId);
    if (!currentProp) return;

    const missingSpace = currentProp.spaces.find((s) => s.captured === false);
    if (missingSpace) {
      updatePropertyStatus(propertyId, 'needs_recapture');
      addTimelineEvent(propertyId, {
        type: 'capture_request',
        event: `Coverage insufficient for ${missingSpace.name}`,
        detail: 'Capture request sent to Property Manager',
      });

      if (typeof addCaptureRequest === 'function') {
        addCaptureRequest({
          propertyId,
          propertyTitle: currentProp.title,
          room: missingSpace.name,
          reason: 'Insufficient coverage',
          instructions: `Please provide a 360 panorama or clear photos of the ${missingSpace.name}`,
          estimatedTime: '5 mins',
          recipientName: 'Property Manager',
          status: 'sent',
        });
      }
    } else {
      startPreparing(propertyId);
    }
  });
}

/**
 * Approve a property for publication.
 * Advances from 'ready_for_review' to 'live' and adds publication timeline events.
 */
export function approveProperty(propertyId: string): void {
  cancelWorkflow(propertyId);
  updatePropertyStatus(propertyId, 'live');
  addTimelineEvent(propertyId, {
    type: 'publication',
    event: 'Publication approved by Agent',
    detail: 'Experience is now live',
  });
}

/**
 * Simulate the full webhook flow: a new listing arrives and triggers the full pipeline.
 * This is called from the Demo Portal when a realtor publishes a listing.
 */
export function handleNewListing(listing: {
  title: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  description: string;
  coverImage?: string;
  spaces?: Array<{ name: string; captured?: boolean }>;
}): string {
  const propertyId = 'prop-' + Math.random().toString(36).substring(2, 11);

  const spaces: Space[] = (listing.spaces || []).map((s, idx) => ({
    id: `space-${Date.now()}-${idx}`,
    name: s.name,
    captured: s.captured ?? true,
    verified: false,
    issues: [],
  }));

  const newProperty: Property = {
    id: propertyId,
    title: listing.title,
    address: listing.address,
    type: listing.type,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    price: listing.price,
    description: listing.description,
    status: 'detected',
    spaces,
    sourceMedia: [],
    timeline: [],
    coverImage: listing.coverImage,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    workspaceId: 'default',
  };

  if (typeof addProperty === 'function') {
    addProperty(newProperty);
  } else {
    console.warn('addProperty not found in store, could not save new property state.');
  }

  startPropertyWorkflow(propertyId);
  return propertyId;
}

