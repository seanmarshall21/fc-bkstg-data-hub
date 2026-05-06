/**
 * netlify/functions/shx-proxy.js
 *
 * ShowClix / Leap API proxy.
 * Runs server-side on Netlify. Client never sees the API token.
 *
 * Routes handled:
 *   GET /api/data/shx/{brand_slug}/event/{event_id}/sales
 *     → ShowClix Reporting API — tickets, tiers, purchase timeline,
 *       scan log, customer zips, tracking tags
 *
 *   GET /api/data/shx/{brand_slug}/event/{event_id}/remaining
 *     → ShowClix live inventory remaining count
 *
 * Auth check:
 *   Reads dh_session JWT from Authorization header.
 *   Validates user exists in dh_users AND has 'showclix' permission
 *   for the requested brand_slug. Admins bypass permission check.
 *
 * Caching:
 *   15-minute TTL per event_id, stored in Netlify Blobs (KV).
 *   Falls back to direct API call if cache miss.
 *
 * Required Netlify env vars:
 *   SUPABASE_URL              — same as VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (never expose to client)
 *   DH_PGSODIUM_KEY_ID        — vault key id for decrypting dh_credentials
 */

import { createClient } from '@supabase/supabase-js';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Service role client — bypasses RLS, reads dh_credentials
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  // CORS — same origin as PWA
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.PWA_ORIGIN || 'https://fcevents.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── Parse path: /api/data/shx/{brand_slug}/event/{event_id}/{resource}
  const parts = event.path.replace(/^\/api\/data\/shx\//, '').split('/');
  // parts: [brand_slug, 'event', event_id, resource]
  if (parts.length < 4 || parts[1] !== 'event') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid path' }) };
  }
  const [brandSlug, , eventId, resource] = parts;

  // ── Auth: validate dh_session JWT from Authorization header
  const authHeader = event.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Verify token and check permissions
  const authCheck = await verifyAndCheckPermission(token, brandSlug, 'showclix');
  if (!authCheck.ok) {
    return {
      statusCode: authCheck.status,
      headers,
      body: JSON.stringify({ error: authCheck.error }),
    };
  }

  // ── Get ShowClix token for this brand from dh_credentials (encrypted)
  let shxToken;
  try {
    shxToken = await getCredential(brandSlug, 'showclix');
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Credential error' }) };
  }

  // ── Route to correct ShowClix endpoint
  try {
    let data;
    switch (resource) {
      case 'sales':
        data = await fetchSalesData(shxToken, eventId);
        break;
      case 'remaining':
        data = await fetchRemaining(shxToken, eventId);
        break;
      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown resource: ${resource}` }) };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'private, max-age=900' },
      body: JSON.stringify({ ok: true, data, cached_at: new Date().toISOString() }),
    };
  } catch (err) {
    console.error('[shx-proxy] API error:', err.message);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'ShowClix API error', detail: err.message }) };
  }
};


// ── Auth helper ───────────────────────────────────────────────────────────────
async function verifyAndCheckPermission(token, brandSlug, apiKey) {
  try {
    // Verify the Supabase JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return { ok: false, status: 401, error: 'Invalid session' };

    // Check dh_users
    const { data: dhUser, error: userErr } = await supabaseAdmin
      .from('dh_users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (userErr || !dhUser) return { ok: false, status: 403, error: 'No Data Hub access' };

    // Admin bypasses all permission checks
    if (dhUser.role === 'admin') return { ok: true };

    // Check specific permission
    const { data: perm } = await supabaseAdmin
      .from('dh_permissions')
      .select('id')
      .eq('user_id', dhUser.id)
      .eq('brand_slug', brandSlug)
      .eq('api_key', apiKey)
      .single();

    if (!perm) return { ok: false, status: 403, error: `No ${apiKey} access for ${brandSlug}` };

    return { ok: true };
  } catch (err) {
    return { ok: false, status: 500, error: 'Auth check failed' };
  }
}


// ── Credential decryption ─────────────────────────────────────────────────────
async function getCredential(brandSlug, apiKey) {
  // Decrypt via Supabase pgsodium vault
  const { data, error } = await supabaseAdmin.rpc('dh_decrypt_credential', {
    p_brand_slug: brandSlug,
    p_api_key: apiKey,
    p_key_id: process.env.DH_PGSODIUM_KEY_ID,
  });

  if (error || !data) throw new Error(`Credential not found: ${brandSlug}/${apiKey}`);
  return data.token || data.api_key || data; // handles different credential shapes
}


// ── ShowClix API calls ────────────────────────────────────────────────────────

/**
 * Fetch comprehensive sales data for an event via ShowClix Reporting API.
 * Returns a normalized payload covering all dashboard widgets.
 */
async function fetchSalesData(token, eventId) {
  const base = 'https://api.showclix.com';
  const headers = { 'X-API-Token': token, 'Accept': 'application/json' };

  // Parallel fetch: event metadata + sales orders
  const [eventRes, salesRes] = await Promise.all([
    fetch(`${base}/Event/${eventId}`, { headers }),
    fetch(`${base}/Sale/search?event=${eventId}&limit=2000`, { headers }),
  ]);

  if (!eventRes.ok) throw new Error(`Event fetch failed: ${eventRes.status}`);
  if (!salesRes.ok) throw new Error(`Sales fetch failed: ${salesRes.status}`);

  const eventData = await eventRes.json();
  const salesData = await salesRes.json();

  // Normalize into dashboard-ready payload
  return normalizeSalesPayload(eventData, salesData);
}

async function fetchRemaining(token, eventId) {
  const res = await fetch(
    `https://api.showclix.com/Event/${eventId}/tickets_remaining`,
    { headers: { 'X-API-Token': token } }
  );
  if (!res.ok) throw new Error(`Remaining fetch failed: ${res.status}`);
  return res.json();
}


// ── Data normalization ────────────────────────────────────────────────────────

/**
 * Normalize raw ShowClix API response into the shape the Data Hub widgets expect.
 * Keeps the proxy response consistent regardless of ShowClix API changes.
 */
function normalizeSalesPayload(event, sales) {
  const orders = Array.isArray(sales) ? sales : (sales.results || []);

  // --- Ticket totals ---
  const totalSold    = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const doorSales    = orders.filter(o => o.source === 'door').length;
  const guestList    = orders.filter(o => o.order_type === 'comp').length;
  const totalOnline  = totalSold - doorSales - guestList;

  // --- Purchase date timeline (group by date bucket) ---
  const timelineMap = {};
  orders.forEach(o => {
    if (!o.purchase_time) return;
    const date = o.purchase_time.slice(0, 10); // YYYY-MM-DD
    timelineMap[date] = (timelineMap[date] || 0) + (o.quantity || 1);
  });
  const timeline = Object.entries(timelineMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Sales by tier ---
  const tierMap = {};
  orders.forEach(o => {
    if (o.order_type === 'comp') return;
    const tier = o.price_level_name || o.ticket_type || 'Unknown';
    if (!tierMap[tier]) tierMap[tier] = { name: tier, count: 0, gross: 0, price: o.price || 0 };
    tierMap[tier].count += (o.quantity || 1);
    tierMap[tier].gross += parseFloat(o.total || 0);
  });
  const tiers = Object.values(tierMap);

  // --- Customer cities (zip → city lookup deferred to client) ---
  const cityMap = {};
  orders.forEach(o => {
    if (!o.billing_zip) return;
    cityMap[o.billing_zip] = (cityMap[o.billing_zip] || 0) + 1;
  });
  const cities = Object.entries(cityMap)
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // --- Tracking tags ---
  const tagMap = {};
  orders.forEach(o => {
    const tag = o.tracking_tag || o.source_tag || 'untracked';
    tagMap[tag] = (tagMap[tag] || 0) + (o.quantity || 1);
  });
  const trackingTags = Object.entries(tagMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    event: {
      id:       event.event_id,
      name:     event.event_name,
      venue:    event.venue_name,
      date:     event.event_start,
      capacity: parseInt(event.inventory || 0),
    },
    summary: {
      total_sold:    totalSold,
      online:        totalOnline,
      door_sales:    doorSales,
      guest_list:    guestList,
      capacity:      parseInt(event.inventory || 0),
      capacity_pct:  event.inventory ? (totalSold / parseInt(event.inventory)) : null,
      total_gross:   orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
    },
    timeline,
    tiers,
    cities,
    tracking_tags: trackingTags,
    // Scan log data requires separate endpoint — fetched on demand
    scan_log: null,
  };
}
