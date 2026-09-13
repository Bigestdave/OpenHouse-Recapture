-- ============================================================================
-- OpenHouse Supabase Seed Data
-- ============================================================================

-- Seed Workspace
INSERT INTO workspaces (
  id, name, owner_name, owner_email, work_type, portfolio_size, primary_market, team_size, listing_source, require_approval, default_visibility, notification_preferences, branding
) VALUES (
  'ws-default',
  'David''s Property Workspace',
  'David Olabowale',
  'david@openhouse.com',
  'agency',
  '11–50 active properties',
  'Lagos, Nigeria',
  '2–5 people',
  'demo',
  true,
  'unlisted',
  '{"captureRequired": true, "reviewReady": true, "published": true, "processingFailed": true, "everyUpdate": false, "channels": ["email", "in_app"]}'::jsonb,
  '{"agencyName": "OpenHouse Realty Advisors", "brandColor": "#194534", "contactDestination": "david@openhouse.com"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Properties
INSERT INTO properties (
  id, workspace_id, title, address, type, bedrooms, bathrooms, price, description, status, spaces, source_media, timeline, experience_url, cover_image
) VALUES
(
  '8-admiralty',
  'ws-default',
  '8 Admiralty Way',
  'Lekki Phase 1, Lagos',
  '3-bedroom apartment',
  3,
  2,
  '₦8,000,000 / year',
  'Modern 3-bedroom luxury apartment with sea-view balcony in the heart of Lekki Phase 1.',
  'needs_recapture',
  '[
    {"id": "sp-1", "name": "Living room", "captured": true, "verified": true, "issues": []},
    {"id": "sp-2", "name": "Kitchen", "captured": true, "verified": true, "issues": []},
    {"id": "sp-3", "name": "Master bedroom", "captured": true, "verified": true, "issues": []},
    {"id": "sp-4", "name": "Master bathroom", "captured": true, "verified": true, "issues": []},
    {"id": "sp-5", "name": "Bedroom 2", "captured": true, "verified": true, "issues": []},
    {"id": "sp-6", "name": "Bedroom 3", "captured": true, "verified": true, "issues": []},
    {"id": "sp-7", "name": "Balcony", "captured": false, "verified": false, "issues": ["Blind spot on ocean-facing railing", "Shadow artifact in left corner"], "captureRequestId": "cr-1"}
  ]'::jsonb,
  '[
    {"id": "sm-1", "url": "/src/assets/prop-admiralty.jpg", "type": "photo", "room": "Living room", "quality": "good", "uploadedAt": 1740700800000},
    {"id": "sm-2", "url": "/src/assets/prop-kitchen.png", "type": "photo", "room": "Kitchen", "quality": "good", "uploadedAt": 1740700800000}
  ]'::jsonb,
  '[
    {"id": "tl-1", "timestamp": 1740700800000, "event": "Property detected from listing feed", "detail": "Listing platform: PropertyPro NG (ID: #PP-88219)", "type": "detection", "evidence": "Imported via OpenHouse Listing Sync"},
    {"id": "tl-2", "timestamp": 1740701000000, "event": "Media analysis complete", "detail": "12 photos, 1 floor plan analyzed. 6 of 7 spaces identified.", "type": "analysis", "evidence": "6 rooms verified at 94% visual confidence"},
    {"id": "tl-3", "timestamp": 1740701200000, "event": "Recapture request sent", "detail": "Balcony coverage insufficient — 15s sweep needed", "type": "capture_request", "agentDecision": "Created mobile capture ticket for field assistant"}
  ]'::jsonb,
  NULL,
  '/src/assets/prop-admiralty.jpg'
),
(
  '14-bourdillon',
  'ws-default',
  '14 Bourdillon Road',
  'Ikoyi, Lagos',
  '5-bedroom detached house',
  5,
  6,
  '₦45,000,000 / year',
  'Palatial 5-bedroom detached house with swimming pool, landscaped garden, and 2-room staff quarters in Old Ikoyi.',
  'preparing',
  '[
    {"id": "sp-10", "name": "Foyer & Entrance", "captured": true, "verified": true, "issues": []},
    {"id": "sp-11", "name": "Main Living Room", "captured": true, "verified": true, "issues": []},
    {"id": "sp-12", "name": "Formal Dining", "captured": true, "verified": true, "issues": []},
    {"id": "sp-13", "name": "Chef Kitchen", "captured": true, "verified": true, "issues": []},
    {"id": "sp-14", "name": "Master Suite", "captured": true, "verified": true, "issues": []},
    {"id": "sp-15", "name": "Master Spa Bath", "captured": true, "verified": true, "issues": []},
    {"id": "sp-16", "name": "Bedroom 2", "captured": true, "verified": true, "issues": []},
    {"id": "sp-17", "name": "Bedroom 3", "captured": true, "verified": true, "issues": []},
    {"id": "sp-18", "name": "Family Lounge", "captured": true, "verified": true, "issues": []},
    {"id": "sp-19", "name": "Garden & Pool Terrace", "captured": true, "verified": true, "issues": []}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"id": "tl-10", "timestamp": 1740697200000, "event": "Property detected from Private CRM", "detail": "Listing platform: Direct CRM Upload", "type": "detection"},
    {"id": "tl-11", "timestamp": 1740698000000, "event": "Media analysis complete", "detail": "32 photos analyzed across 10 spaces", "type": "analysis"},
    {"id": "tl-12", "timestamp": 1740700000000, "event": "3D Reconstruction started", "detail": "Gaussian splatting underway for 10 spaces", "type": "reconstruction"}
  ]'::jsonb,
  NULL,
  '/src/assets/prop-bourdillon.jpg'
),
(
  'orchid-apt-4',
  'ws-default',
  'Orchid Apartments, Unit 4',
  'Orchid Road, Lekki',
  '2-bedroom apartment',
  2,
  2,
  '₦4,500,000 / year',
  'Brand new 2-bedroom serviced apartment with modern fittings, 24/7 power, and swimming pool.',
  'quality_check',
  '[
    {"id": "sp-20", "name": "Living & Dining", "captured": true, "verified": true, "issues": []},
    {"id": "sp-21", "name": "Kitchen", "captured": true, "verified": true, "issues": []},
    {"id": "sp-22", "name": "Master Bedroom", "captured": true, "verified": true, "issues": []},
    {"id": "sp-23", "name": "Bedroom 2", "captured": true, "verified": true, "issues": []},
    {"id": "sp-24", "name": "Balcony", "captured": true, "verified": true, "issues": []}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"id": "tl-20", "timestamp": 1740690000000, "event": "Property detected", "type": "detection"},
    {"id": "tl-21", "timestamp": 1740692000000, "event": "3D Reconstruction completed", "type": "reconstruction"},
    {"id": "tl-22", "timestamp": 1740694000000, "event": "Visual verification in progress", "type": "verification"}
  ]'::jsonb,
  NULL,
  '/src/assets/prop-orchid.jpg'
),
(
  'lekki-gardens-12',
  'ws-default',
  'Lekki Gardens, Unit 12',
  'Lekki Phase 1, Lagos',
  '3-bedroom terrace duplex',
  3,
  3,
  '₦6,000,000 / year',
  'Contemporary 3-bedroom terrace with private backyard, fitted kitchen, and dedicated parking.',
  'ready_for_review',
  '[
    {"id": "sp-30", "name": "Living Room", "captured": true, "verified": true, "issues": []},
    {"id": "sp-31", "name": "Kitchen", "captured": true, "verified": true, "issues": []},
    {"id": "sp-32", "name": "Master Bedroom", "captured": true, "verified": true, "issues": []},
    {"id": "sp-33", "name": "Bedroom 2", "captured": true, "verified": true, "issues": []},
    {"id": "sp-34", "name": "Bedroom 3", "captured": true, "verified": true, "issues": []},
    {"id": "sp-35", "name": "Backyard Patio", "captured": true, "verified": true, "issues": []}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"id": "tl-30", "timestamp": 1740680000000, "event": "Property detected", "type": "detection"},
    {"id": "tl-31", "timestamp": 1740685000000, "event": "3D Tour generated and verified", "type": "reconstruction"},
    {"id": "tl-32", "timestamp": 1740690000000, "event": "Ready for approval", "type": "approval", "agentDecision": "Passed all 6 spatial fidelity checks"}
  ]'::jsonb,
  NULL,
  '/src/assets/prop-lekkigardens.jpg'
),
(
  'victoria-courts-8',
  'ws-default',
  'Victoria Courts, Unit 8',
  'Victoria Island, Lagos',
  '4-bedroom penthouse',
  4,
  4,
  '₦18,000,000 / year',
  'Spectacular 4-bedroom penthouse with wrap-around terrace overlooking Lagos Lagoon.',
  'live',
  '[
    {"id": "sp-40", "name": "Grand Salon", "captured": true, "verified": true, "issues": []},
    {"id": "sp-41", "name": "Dining Room", "captured": true, "verified": true, "issues": []},
    {"id": "sp-42", "name": "Kitchen & Island", "captured": true, "verified": true, "issues": []},
    {"id": "sp-43", "name": "Primary Suite", "captured": true, "verified": true, "issues": []},
    {"id": "sp-44", "name": "Suite 2", "captured": true, "verified": true, "issues": []},
    {"id": "sp-45", "name": "Suite 3", "captured": true, "verified": true, "issues": []},
    {"id": "sp-46", "name": "Suite 4", "captured": true, "verified": true, "issues": []},
    {"id": "sp-47", "name": "Lagoon Terrace", "captured": true, "verified": true, "issues": []}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"id": "tl-40", "timestamp": 1740650000000, "event": "Property detected", "type": "detection"},
    {"id": "tl-41", "timestamp": 1740660000000, "event": "Approved and published", "type": "publication", "detail": "Published to OpenHouse Viewer & WhatsApp share ready"}
  ]'::jsonb,
  '/#/view/victoria-courts-8',
  '/src/assets/prop-hero-waterfront.jpg'
) ON CONFLICT (id) DO NOTHING;

-- Seed Capture Requests
INSERT INTO capture_requests (
  id, property_id, property_title, room, reason, instructions, estimated_time, status, recipient_name, recipient_phone, recipient_email, capture_url
) VALUES (
  'cr-1',
  '8-admiralty',
  '8 Admiralty Way',
  'Balcony',
  'Coverage insufficient for 3D reconstruction — ocean railing blind spot',
  'Stand at the balcony entrance, rotate phone 180° across the railing, sweep slowly for 15s.',
  '15s sweep',
  'awaiting_capture',
  'Tunde Bakare',
  '+234 803 123 4567',
  'tunde@lekkiagents.ng',
  '/#/capture/8-admiralty'
) ON CONFLICT (id) DO NOTHING;
