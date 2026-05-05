-- ============================================================
-- Data Hub — Supabase Migration
-- File: supabase/migrations/002_data_hub.sql
-- Run AFTER 001_connected_sites.sql (existing migration)
--
-- Creates 3 new tables only. Zero changes to existing tables.
-- Run in Supabase SQL editor or via Supabase CLI.
-- ============================================================


-- ── 1. dh_users ──────────────────────────────────────────────
-- Data Hub user records. Auth is via Supabase Auth (email/password).
-- Having a Supabase Auth account is NOT enough — user must also
-- have a row here to be granted Data Hub access.

CREATE TABLE IF NOT EXISTS dh_users (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        UNIQUE NOT NULL,
  name        text        NOT NULL,
  role        text        NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('viewer', 'analyst', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid        REFERENCES dh_users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE dh_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row only
CREATE POLICY "dh_users: read own" ON dh_users
  FOR SELECT USING (id = auth.uid());

-- Admins can read all rows
CREATE POLICY "dh_users: admin read all" ON dh_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dh_users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only admins can insert/update
CREATE POLICY "dh_users: admin write" ON dh_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dh_users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );


-- ── 2. dh_permissions ────────────────────────────────────────
-- Per-user, per-brand, per-API access grants.
-- Having ShowClix access for 'proper-nye' does NOT give ShowClix
-- access for 'crssd'. Each grant is fully explicit.
--
-- api_key values: 'showclix' | 'queueit' | 'ga4' | 'instagram' | 'mailchimp'
--
-- Note: 'ga4', 'instagram', 'mailchimp' are public analytics tier —
-- any authenticated dh_user can view them (enforced in DataHubAuthContext,
-- not here). This table only needs rows for financial/restricted APIs,
-- but you can grant all types here for explicit control if preferred.

CREATE TABLE IF NOT EXISTS dh_permissions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES dh_users(id) ON DELETE CASCADE,
  brand_slug  text        NOT NULL,
  api_key     text        NOT NULL
                          CHECK (api_key IN ('showclix', 'queueit', 'ga4', 'instagram', 'mailchimp', 'laylo', 'meta_ads', 'spotify')),
  granted_at  timestamptz NOT NULL DEFAULT now(),
  granted_by  uuid        REFERENCES dh_users(id) ON DELETE SET NULL,

  UNIQUE (user_id, brand_slug, api_key)
);

-- RLS
ALTER TABLE dh_permissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own permissions
CREATE POLICY "dh_permissions: read own" ON dh_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read and manage all
CREATE POLICY "dh_permissions: admin all" ON dh_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dh_users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );


-- ── 3. dh_credentials ────────────────────────────────────────
-- API credentials per brand, encrypted at rest via pgsodium vault.
-- NEVER exposed to the client. Only read by Netlify proxy functions
-- using the Supabase service role key (server-side only).
--
-- Stored as jsonb to accommodate different credential shapes:
--   showclix:   { "token": "abc123" }
--   queueit:    { "api_key": "xyz" }
--   ga4:        { "property_id": "123456789", "service_account_json": "..." }
--   instagram:  { "access_token": "...", "ig_user_id": "..." }
--   mailchimp:  { "api_key": "...", "dc": "us21" }

CREATE TABLE IF NOT EXISTS dh_credentials (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug  text        NOT NULL,
  api_key     text        NOT NULL,
  -- encrypted via pgsodium: pgsodium.crypto_aead_det_encrypt()
  -- decrypt in Edge Function using vault key 'vc_dh_credentials'
  credential  bytea       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid        REFERENCES dh_users(id) ON DELETE SET NULL,

  UNIQUE (brand_slug, api_key)
);

-- RLS: NO client access. Period.
-- Only the service role (used by Netlify proxy functions) can read this table.
ALTER TABLE dh_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dh_credentials: deny all client access" ON dh_credentials
  FOR ALL USING (false);

-- Service role bypasses RLS automatically. Netlify functions use service role key.


-- ── Seed: Admin user (Sean) ───────────────────────────────────
-- Run AFTER creating the Supabase Auth account for sean@crssd.com.
-- Replace the UUID with the actual auth.users id from Supabase dashboard.
--
-- INSERT INTO dh_users (id, email, name, role)
-- VALUES (
--   '<paste-auth-uid-here>',
--   'sean@crssd.com',
--   'Sean Marshall',
--   'admin'
-- );
--
-- After inserting, Sean gets access to all brands and all APIs
-- (admin role bypasses permission checks in DataHubAuthContext).


-- ── Vault key for credential encryption ──────────────────────
-- Run this once in Supabase SQL editor to create the encryption key.
-- Uses pgsodium (already in Supabase — same extension planned for WP passwords).
--
-- SELECT pgsodium.create_key(
--   name     := 'vc_dh_credentials',
--   key_type := 'aead-det'
-- );
--
-- Store the returned key_id in Netlify env as: DH_PGSODIUM_KEY_ID
-- Netlify proxy functions use this to decrypt credentials server-side.


-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dh_permissions_user    ON dh_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_dh_permissions_brand   ON dh_permissions (brand_slug);
CREATE INDEX IF NOT EXISTS idx_dh_credentials_brand   ON dh_credentials (brand_slug);
