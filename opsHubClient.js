/**
 * opsHubClient.js
 * src/modules/ops-hub/api/opsHubClient.js
 *
 * All Ops Hub data — price levels, bundles, coupons, ticket lookup.
 * Mock vs live toggled by VITE_USE_MOCK env var. Same shape either way.
 */

import {
  MOCK_PRICE_LEVELS,
  MOCK_BUNDLES,
  MOCK_COUPONS,
  MOCK_ORDERS,
} from '../../../mock/opsData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getToken() {
  try { return JSON.parse(localStorage.getItem('dh_session'))?.token; }
  catch { return null; }
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`/api/ops/${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`Ops API error ${res.status}`);
  return res.json();
}

// ── PRICE LEVELS ──────────────────────────────────────────────
export async function fetchPriceLevels(eventId) {
  if (USE_MOCK) { await delay(300); return MOCK_PRICE_LEVELS[eventId] ?? []; }
  return apiFetch(`price-levels?event_id=${eventId}`);
}

export async function updatePriceLevel(id, patch) {
  if (USE_MOCK) {
    await delay(400);
    // Find and update in mock (mutates in memory — resets on page refresh)
    for (const eventLevels of Object.values(MOCK_PRICE_LEVELS)) {
      const pl = eventLevels.find((p) => p.id === id);
      if (pl) { Object.assign(pl, patch); return pl; }
    }
    throw new Error('Price level not found');
  }
  return apiFetch(`price-levels/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function createPriceLevel(eventId, data) {
  if (USE_MOCK) {
    await delay(400);
    const newPl = { id: `pl-${Date.now()}`, event_id: eventId, ...data, sold: 0, status: 'scheduled' };
    if (!MOCK_PRICE_LEVELS[eventId]) MOCK_PRICE_LEVELS[eventId] = [];
    MOCK_PRICE_LEVELS[eventId].push(newPl);
    return newPl;
  }
  return apiFetch('price-levels', { method: 'POST', body: JSON.stringify({ event_id: eventId, ...data }) });
}

// ── BUNDLES ───────────────────────────────────────────────────
export async function fetchBundles(eventId) {
  if (USE_MOCK) { await delay(300); return MOCK_BUNDLES[eventId] ?? []; }
  return apiFetch(`bundles?event_id=${eventId}`);
}

export async function createBundle(eventId, data) {
  if (USE_MOCK) {
    await delay(400);
    const nb = { id: `bndl-${Date.now()}`, event_id: eventId, ...data, sold: 0, status: 'active' };
    if (!MOCK_BUNDLES[eventId]) MOCK_BUNDLES[eventId] = [];
    MOCK_BUNDLES[eventId].push(nb);
    return nb;
  }
  return apiFetch('bundles', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBundle(id, patch) {
  if (USE_MOCK) {
    await delay(400);
    for (const arr of Object.values(MOCK_BUNDLES)) {
      const b = arr.find((x) => x.id === id);
      if (b) { Object.assign(b, patch); return b; }
    }
  }
  return apiFetch(`bundles/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

// ── COUPONS ───────────────────────────────────────────────────
export async function fetchCoupons(eventId = null) {
  if (USE_MOCK) {
    await delay(300);
    return eventId
      ? MOCK_COUPONS.filter((c) => c.events.includes(eventId))
      : MOCK_COUPONS;
  }
  return apiFetch(`coupons${eventId ? `?event_id=${eventId}` : ''}`);
}

export async function fetchCouponByCode(code) {
  if (USE_MOCK) {
    await delay(500);
    const coupon = MOCK_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (!coupon) throw new Error('Coupon not found');
    return coupon;
  }
  return apiFetch(`coupons/code/${encodeURIComponent(code)}`);
}

export async function validateCoupon(code, eventId) {
  if (USE_MOCK) {
    await delay(400);
    const coupon = MOCK_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (!coupon) return { valid: false, reason: 'Code not found' };
    if (!coupon.active || coupon.expired)
      return { valid: false, reason: 'Code is expired or inactive' };
    if (eventId && !coupon.events.includes(eventId))
      return { valid: false, reason: 'Code not valid for this event' };
    if (coupon.limit && coupon.used >= coupon.limit)
      return { valid: false, reason: 'Code limit reached' };
    return { valid: true, coupon };
  }
  return apiFetch(`coupons/${code}/validate?event_id=${eventId}`);
}

// ── TICKET LOOKUP ─────────────────────────────────────────────
export async function searchOrders({ query, eventId, dateFrom, dateTo }) {
  if (USE_MOCK) {
    await delay(600);
    const q = query?.toLowerCase() ?? '';
    return MOCK_ORDERS.filter((o) => {
      if (eventId && o.event_id !== eventId) return false;
      if (!q) return true;
      return (
        o.confirmation_number.toLowerCase().includes(q) ||
        o.name_on_order.toLowerCase().includes(q) ||
        o.order_email.toLowerCase().includes(q) ||
        o.tickets.some((t) => t.id.toLowerCase().includes(q))
      );
    });
  }
  const params = new URLSearchParams();
  if (query)    params.set('q',        query);
  if (eventId)  params.set('event_id', eventId);
  if (dateFrom) params.set('from',     dateFrom);
  if (dateTo)   params.set('to',       dateTo);
  return apiFetch(`orders/search?${params}`);
}

export async function fetchOrder(orderId) {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_ORDERS.find((o) => o.id === orderId) ?? null;
  }
  return apiFetch(`orders/${orderId}`);
}
