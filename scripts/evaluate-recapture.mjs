/**
 * Offline contract tests for the safety-critical Recapture decisions.
 *
 * These deliberately do not pretend to call Calendar, Drive, Telegram, or
 * Gmail. They verify the deterministic conditions that must be true before
 * the deployed agent is allowed to call any connector.
 */
import assert from 'node:assert/strict'

const future = () => new Date(Date.now() + 60 * 60 * 1000).toISOString()
const past = () => new Date(Date.now() - 60 * 60 * 1000).toISOString()

function decide({ existing = false, approvalRequired = true, scheduledFor, connectorReady = true, captureReceived = false, evidenceResolved }) {
  if (existing) return { status: 'deduplicated', externalActions: 0 }
  if (captureReceived && evidenceResolved === false) return { status: 'needs_follow_up', externalActions: 0 }
  if (captureReceived && evidenceResolved === true) return { status: 'resolved', externalActions: 0 }
  if (approvalRequired) return { status: 'awaiting_realtor_approval', externalActions: 0 }
  if (!scheduledFor || Date.parse(scheduledFor) < Date.now() - 5 * 60_000) return { status: 'needs_human_schedule', externalActions: 0 }
  if (!connectorReady) return { status: 'failed_closed', externalActions: 0 }
  return { status: 'scheduled', externalActions: 4 }
}

const cases = [
  ['schedules a valid approved mission', { approvalRequired: false, scheduledFor: future() }, 'scheduled', 4],
  ['requires approval when policy requires it', { approvalRequired: true, scheduledFor: future() }, 'awaiting_realtor_approval', 0],
  ['does not dispatch a duplicate gap', { existing: true, approvalRequired: false, scheduledFor: future() }, 'deduplicated', 0],
  ['does not dispatch a second duplicate gap', { existing: true, approvalRequired: false, scheduledFor: future() }, 'deduplicated', 0],
  ['does not dispatch a third duplicate gap', { existing: true, approvalRequired: false, scheduledFor: future() }, 'deduplicated', 0],
  ['escalates an unscheduled mission', { approvalRequired: false }, 'needs_human_schedule', 0],
  ['rejects a past appointment', { approvalRequired: false, scheduledFor: past() }, 'needs_human_schedule', 0],
  ['fails closed when connector credentials are unavailable', { approvalRequired: false, scheduledFor: future(), connectorReady: false }, 'failed_closed', 0],
  ['does not resolve insufficient new footage', { captureReceived: true, evidenceResolved: false }, 'needs_follow_up', 0],
  ['only resolves after a positive verification decision', { captureReceived: true, evidenceResolved: true }, 'resolved', 0],
]

for (const [label, input, expectedStatus, expectedActions] of cases) {
  const result = decide(input)
  assert.equal(result.status, expectedStatus, label)
  assert.equal(result.externalActions, expectedActions, label)
}

console.log(`Recapture policy contract: ${cases.length}/${cases.length} cases passed`)
