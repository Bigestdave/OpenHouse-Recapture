import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ShowsHomeScreen } from './screens/ShowsHomeScreen'
import { ShowOverviewScreen } from './screens/ShowOverviewScreen'
import { ProductionsScreen } from './screens/ProductionsScreen'
import { AssetsScreen } from './screens/AssetsScreen'
import { UsageScreen } from './screens/UsageScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { NotificationsScreen } from './screens/NotificationsScreen'
import { CaptureRequestsScreen } from './screens/CaptureRequestsScreen'
import { CaptureRequestDetailScreen } from './screens/CaptureRequestDetailScreen'
import { ApprovalsScreen } from './screens/ApprovalsScreen'
import { TeamScreen } from './screens/TeamScreen'
import { PublishedExperienceScreen } from './screens/PublishedExperienceScreen'
import { PublicPropertyViewerScreen } from './screens/PublicPropertyViewerScreen'
import { MobileCaptureScreen } from './screens/MobileCaptureScreen'
import { InitialSetupScreen } from './screens/InitialSetupScreen'
import { ListingPortalScreen } from './screens/ListingPortalScreen'
import { LandingScreen } from './screens/LandingScreen'
import { AuthScreen } from './screens/AuthScreen'
import { CreateShowBasicsScreen } from './screens/CreateShowBasicsScreen'
import { CreateShowStyleScreen } from './screens/CreateShowStyleScreen'
import { CreateShowCharactersScreen } from './screens/CreateShowCharactersScreen'
import { AddPropertyScreen } from './screens/AddPropertyScreen'
import { ProductionPropertiesScreen } from './screens/ProductionPropertiesScreen'
import { ImportedListingsScreen } from './screens/ImportedListingsScreen'
import { ListingSourcesScreen } from './screens/ListingSourcesScreen'
import { DiagnosticsScreen } from './screens/DiagnosticsScreen'
import { RecaptureLabScreen } from './screens/RecaptureLabScreen'
import { isDemoMode } from './lib/runtime'
import { AuthGate } from './components/AuthGate'
import { DemoProvider } from './context/DemoContext'
import { DemoToaster } from './components/DemoToaster'
import { DemoControlBar } from './components/DemoControlBar'

import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/' && !window.location.hash) {
      window.location.replace(`/#${window.location.pathname}${window.location.search}`)
    }
  }, [])

  return (
    <HashRouter>
      <DemoProvider>
        {isDemoMode && <DemoToaster />}
        {isDemoMode && <DemoControlBar />}
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingScreen />} />

        {/* Auth Routes — always show login screen */}
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/signin" element={<AuthScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/signup" element={<AuthScreen />} />

        {/* Add Property — 3-step Create Show wizard */}
        <Route path="/add-property" element={<AuthGate><AddPropertyScreen /></AuthGate>} />
        <Route path="/create-show" element={<AuthGate><CreateShowBasicsScreen /></AuthGate>} />
        <Route path="/create-show/basics" element={<AuthGate><CreateShowBasicsScreen /></AuthGate>} />
        <Route path="/create-show/style" element={<AuthGate><CreateShowStyleScreen /></AuthGate>} />
        <Route path="/create-show/capture" element={<AuthGate><CreateShowStyleScreen /></AuthGate>} />
        <Route path="/create-show/characters" element={<AuthGate><CreateShowCharactersScreen /></AuthGate>} />
        <Route path="/create-show/publish" element={<AuthGate><CreateShowCharactersScreen /></AuthGate>} />
        <Route path="/create-show/spaces" element={<AuthGate><CreateShowCharactersScreen /></AuthGate>} />

        {/* MLS & Listing Intake Feeds */}
        <Route path="/import" element={<ListingPortalScreen />} />
        <Route path="/portal" element={<ListingPortalScreen />} />
        <Route path="/listing-portal" element={<ListingPortalScreen />} />
        <Route path="/demo-portal" element={<ListingPortalScreen />} />
        <Route path="/mls" element={<ListingPortalScreen />} />

        {/* Realtor Onboarding & Setup */}
        <Route path="/setup" element={<AuthGate><InitialSetupScreen /></AuthGate>} />
        <Route path="/onboarding" element={<AuthGate><InitialSetupScreen /></AuthGate>} />
        <Route path="/initial-setup" element={<AuthGate><InitialSetupScreen /></AuthGate>} />

        {/* Protected Realtor Workspace Hubs */}
        <Route path="/properties" element={<AuthGate>{isDemoMode ? <ShowsHomeScreen /> : <ProductionPropertiesScreen />}</AuthGate>} />
        <Route path="/imported-listings" element={<AuthGate><ImportedListingsScreen /></AuthGate>} />
        <Route path="/shows" element={<Navigate to="/properties" replace />} />
        <Route path="/capture-requests" element={<AuthGate><CaptureRequestsScreen /></AuthGate>} />
        <Route path="/capture-requests/:id" element={<AuthGate><CaptureRequestDetailScreen /></AuthGate>} />
        <Route path="/capture-request/:id" element={<AuthGate><CaptureRequestDetailScreen /></AuthGate>} />
        <Route path="/capture-request" element={<AuthGate><CaptureRequestsScreen /></AuthGate>} />
        <Route path="/recapture" element={<AuthGate><RecaptureLabScreen /></AuthGate>} />
        <Route path="/experiences" element={<AuthGate><ProductionsScreen /></AuthGate>} />
        <Route path="/experiences/:id" element={<AuthGate><ShowOverviewScreen /></AuthGate>} />
        <Route path="/productions" element={<Navigate to="/experiences" replace />} />
        <Route path="/approvals" element={<AuthGate><ApprovalsScreen /></AuthGate>} />
        <Route path="/activity" element={<AuthGate><ShowOverviewScreen /></AuthGate>} />
        <Route path="/assets" element={<AuthGate><AssetsScreen /></AuthGate>} />

        {/* Account & Team Hubs */}
        <Route path="/usage" element={<AuthGate><UsageScreen /></AuthGate>} />
        <Route path="/team" element={<AuthGate><TeamScreen /></AuthGate>} />
        <Route path="/settings" element={<AuthGate><SettingsScreen /></AuthGate>} />
        <Route path="/settings/listing-sources" element={<AuthGate><ListingSourcesScreen /></AuthGate>} />
        <Route path="/diagnostics" element={<AuthGate><DiagnosticsScreen /></AuthGate>} />
        <Route path="/notifications" element={<AuthGate><NotificationsScreen /></AuthGate>} />

        {/* Public Mobile Capture Link (Sent to Agent / Assistant) */}
        <Route path="/capture/:id" element={<MobileCaptureScreen />} />
        <Route path="/capture" element={<MobileCaptureScreen />} />
        <Route path="/c/:id" element={<MobileCaptureScreen />} />
        <Route path="/mobile-capture" element={<MobileCaptureScreen />} />

        {/* Property Inspector & Overview */}
        <Route path="/property/:id" element={<AuthGate><ShowOverviewScreen /></AuthGate>} />
        <Route path="/properties/:id" element={<AuthGate><ShowOverviewScreen /></AuthGate>} />
        <Route path="/show/:id" element={<AuthGate><ShowOverviewScreen /></AuthGate>} />
        <Route path="/property/:id/published" element={<AuthGate><PublishedExperienceScreen /></AuthGate>} />
        <Route path="/properties/:id/published" element={<AuthGate><PublishedExperienceScreen /></AuthGate>} />
        <Route path="/show/:id/published" element={<AuthGate><PublishedExperienceScreen /></AuthGate>} />
        <Route path="/experience/:id/published" element={<AuthGate><PublishedExperienceScreen /></AuthGate>} />

        {/* Public 3D Property Tour & Inspection Booking */}
        <Route path="/public/:id" element={<PublicPropertyViewerScreen />} />
        <Route path="/public" element={<PublicPropertyViewerScreen />} />
        <Route path="/view/:id" element={<PublicPropertyViewerScreen />} />
        <Route path="/view" element={<PublicPropertyViewerScreen />} />
        <Route path="/viewer" element={<PublicPropertyViewerScreen />} />
        <Route path="/experience/:id" element={<PublicPropertyViewerScreen />} />
        <Route path="/p/:id" element={<PublicPropertyViewerScreen />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/properties" replace />} />
      </Routes>
      </DemoProvider>
    </HashRouter>
  )
}
