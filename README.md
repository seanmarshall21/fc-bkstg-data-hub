# Data Hub — Phase 1 + 2 Handoff

**Branch:** Data Dashboard Chat  
**Status:** Ready for Master Chat review and integration  
**Date:** 2026-05-02  

---

## What's in this package

| File | Phase | Purpose |
|---|---|---|
| `src/config/siteRegistry.patch.js` | 1 | Shows exact additions to siteRegistry.js — additive only |
| `src/components/DataHubEntryPoint.jsx` | 1 | Home screen tile for Data Hub — only renders when flag is true |
| `src/modules/data-hub/auth/DataHubAuthContext.jsx` | 2 | Separate auth context — does not touch AuthContext.jsx |
| `src/modules/data-hub/screens/DataHubLogin.jsx` | 2 | Standalone login screen at /data-hub/login |
| `supabase/002_data_hub.sql` | 2 | New tables only — zero changes to existing schema |
| `netlify/functions/shx-proxy.js` | 2 | ShowClix API proxy — first live data endpoint |
| `data-hub-routes.jsx` | 2 | Route additions + DataHubGate auth guard |

---

## Phase 1 — Zero-risk config (do this first)

**Step 1a — siteRegistry.js**  
Add `data_hub_enabled: false` to all sites.  
Set `data_hub_enabled: true` for Proper NYE only.  
Reference: `src/config/siteRegistry.patch.js`

**Step 1b — App home screen**  
Import and render `<DataHubEntryPoint site={activeSite} />` on the home screen.  
Placement TBD by Master Chat — suggested: below or alongside existing Event Hub entry.  
It self-hides when `data_hub_enabled` is false. Nothing breaks on any other site.

**Step 1c — DataHubAuthProvider**  
Wrap app root in `<DataHubAuthProvider>` alongside existing `<AuthProvider>`.  
They are siblings — do not nest one inside the other as a dependency.

**Step 1d — Routes**  
Add `/data-hub/login` and `/data-hub/*` routes per `data-hub-routes.jsx`.

Result of Phase 1: Data Hub tile appears on Proper NYE. Tapping it shows the login screen. Nothing else is wired yet.

---

## Phase 2 — Supabase + first API (do after Phase 1 is deployed and clean)

**Step 2a — Run SQL migration**  
Run `supabase/002_data_hub.sql` in Supabase SQL editor.  
Creates: `dh_users`, `dh_permissions`, `dh_credentials`.  
Zero impact on existing tables.

**Step 2b — Create pgsodium vault key**  
```sql
SELECT pgsodium.create_key(
  name     := 'vc_dh_credentials',
  key_type := 'aead-det'
);
```
Store returned `key_id` as Netlify env var: `DH_PGSODIUM_KEY_ID`

**Step 2c — Create dh_decrypt_credential RPC**  
This Postgres function wraps pgsodium decryption for the proxy to call:
```sql
CREATE OR REPLACE FUNCTION dh_decrypt_credential(
  p_brand_slug text,
  p_api_key    text,
  p_key_id     uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_credential bytea;
  v_decrypted  text;
BEGIN
  SELECT credential INTO v_credential
  FROM dh_credentials
  WHERE brand_slug = p_brand_slug AND api_key = p_api_key;

  IF v_credential IS NULL THEN
    RAISE EXCEPTION 'Credential not found: %/%', p_brand_slug, p_api_key;
  END IF;

  v_decrypted := convert_from(
    pgsodium.crypto_aead_det_decrypt(v_credential, '', p_key_id),
    'UTF8'
  );

  RETURN v_decrypted::jsonb;
END;
$$;
```

**Step 2d — Seed admin user**  
1. Create Supabase Auth account for sean@crssd.com via Supabase dashboard (Auth → Users → Invite)
2. Copy the UUID from the created auth user
3. Insert into dh_users:
```sql
INSERT INTO dh_users (id, email, name, role)
VALUES ('<auth-uid>', 'sean@crssd.com', 'Sean Marshall', 'admin');
```

**Step 2e — Add ShowClix credential for Proper NYE**  
1. Get your ShowClix/Leap API token from your account rep  
2. Encrypt and insert:
```sql
INSERT INTO dh_credentials (brand_slug, api_key, credential)
VALUES (
  'proper-nye',
  'showclix',
  pgsodium.crypto_aead_det_encrypt(
    convert_to('{"token":"YOUR_SHOWCLIX_TOKEN"}', 'UTF8'),
    '',
    (SELECT id FROM pgsodium.valid_key WHERE name = 'vc_dh_credentials')
  )
);
```

**Step 2f — Deploy shx-proxy Netlify function**  
Add to Netlify env vars:
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Settings → API
- `DH_PGSODIUM_KEY_ID` — from step 2b
- `PWA_ORIGIN` — `https://fcevents.netlify.app`

Deploy `netlify/functions/shx-proxy.js`. Test:
```
GET https://fcevents.netlify.app/api/data/shx/proper-nye/event/{event_id}/sales
Authorization: Bearer {dh_session_token}
```

---

## What is NOT included yet (future sprints)

- DataHubHome.jsx — the main data hub landing screen
- DataHubEventDetail.jsx — per-event widget dashboard
- Widget components (TicketSalesWidget, QueueMonitorWidget, etc.)
- Queue-it, GA4, Instagram, Mailchimp proxies
- Cross-brand compare screen
- Admin user management UI

These are Phase 3+ and depend on Master Chat sign-off on Phase 1+2 first.

---

## Files Master Chat must NOT modify in the existing codebase

- `src/auth/AuthContext.jsx`
- `src/api/endpoints.js`
- `src/hooks/useSchema.js`
- Any existing module in `src/modules/`
- Plugin files
- ACF JSON

---

## Two hubs — separation is intentional and non-negotiable

Event Hub (existing) → WordPress-connected → content editing  
Data Hub (new) → external APIs → read-only reporting  

They are separate entry points on the home screen.  
Separate auth. Separate nav. Separate concerns.  
A user can have one without the other.
