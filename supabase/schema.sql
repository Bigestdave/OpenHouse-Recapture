-- ============================================================================
-- OpenHouse Supabase Cloud Database Schema
-- Version: 2.0.0
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  work_type TEXT NOT NULL DEFAULT 'agency',
  portfolio_size TEXT NOT NULL DEFAULT '11–50 active properties',
  primary_market TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
  team_size TEXT NOT NULL DEFAULT '2–5 people',
  listing_source TEXT NOT NULL DEFAULT 'demo',
  require_approval BOOLEAN NOT NULL DEFAULT true,
  default_visibility TEXT NOT NULL DEFAULT 'unlisted',
  notification_preferences JSONB NOT NULL DEFAULT '{"captureRequired": true, "reviewReady": true, "published": true, "processingFailed": true, "everyUpdate": false, "channels": ["email", "in_app"]}'::jsonb,
  branding JSONB DEFAULT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  price TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'detected',
  spaces JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_media JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience_url TEXT DEFAULT NULL,
  cover_image TEXT DEFAULT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 3. CAPTURE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS capture_requests (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  room TEXT NOT NULL,
  reason TEXT NOT NULL,
  instructions TEXT NOT NULL,
  estimated_time TEXT NOT NULL DEFAULT '15s sweep',
  status TEXT NOT NULL DEFAULT 'pending',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT DEFAULT NULL,
  recipient_email TEXT DEFAULT NULL,
  capture_url TEXT NOT NULL,
  uploaded_media JSONB DEFAULT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  renter_name TEXT NOT NULL,
  renter_phone TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_properties_workspace ON properties(workspace_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_capture_requests_property ON capture_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Deliberately no public policies. A table with RLS enabled and no policy is
-- inaccessible to browser clients by default. Apply the production migration
-- after this schema to add workspace-scoped policies and private media buckets.
