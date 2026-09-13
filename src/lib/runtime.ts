/**
 * Runtime mode is deliberately explicit.  Demo mode keeps the visual product
 * usable without external services; production mode never substitutes mock
 * users, object URLs, or browser-held provider credentials for durable data.
 */
const configuredMode = import.meta.env.VITE_OPENHOUSE_MODE?.toLowerCase()

// Demo data must be an explicit choice. A missing hosting variable must never
// make a real workspace look populated with invented properties.
export const isDemoMode = configuredMode === 'demo'
export const isProductionMode = !isDemoMode

export const runtimeModeLabel = isDemoMode ? 'Demo mode' : 'Production mode'
