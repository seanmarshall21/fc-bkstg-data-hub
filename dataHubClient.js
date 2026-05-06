/**
 * dataHubClient.js
 * src/modules/data-hub/api/dataHubClient.js
 *
 * Single source for all Data Hub data fetching.
 * Toggle VITE_USE_MOCK=true in .env.local → returns mock data instantly.
 * Toggle VITE_USE_MOCK=false               → calls real Netlify proxy functions.
 *
 * All functions return the same shape regardless of mode.
 * Nothing in the UI layer knows or cares which mode is active.
 */

import {
  MOCK_EVENTS,
  MOCK_BRANDS,
  MOCK_TICKET_REPORTS,
  MOCK_SCAN_LOGS,
  MOCK_POLL_DATA,
  MOCK_ANNOUNCE_METRICS,
  MOCK_BRAND_SUMMARY,
} from '../../../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // default true until API is ready
const MOCK_DELAY = 300; // ms — simulates network latency

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getToken() {
  const session = localStorage.getItem('dh_session');
  if (!session) return null;
  try { return JSON.parse(session)?.token; } catch { return null; }
}

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`/api/data/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.data ?? data;
}

// ─────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────
export async function fetchBrands() {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_BRANDS;
  }
  return apiFetch('brands');
}

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
export async function fetchEvents(brandSlug = null) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return brandSlug
      ? MOCK_EVENTS.filter((e) => e.brand === brandSlug)
      : MOCK_EVENTS;
  }
  return apiFetch(`events${brandSlug ? `?brand=${brandSlug}` : ''}`);
}

export async function fetchEvent(eventId) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_EVENTS.find((e) => e.id === eventId) ?? null;
  }
  return apiFetch(`events/${eventId}`);
}

// ─────────────────────────────────────────────────────────────
// TICKET REPORT
// ─────────────────────────────────────────────────────────────
export async function fetchTicketReport(eventId) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_TICKET_REPORTS[eventId] ?? null;
  }
  return apiFetch(`shx/${eventId}/ticket-report`);
}

// ─────────────────────────────────────────────────────────────
// SCAN LOG
// ─────────────────────────────────────────────────────────────
export async function fetchScanLog(eventId) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_SCAN_LOGS[eventId] ?? null;
  }
  return apiFetch(`shx/${eventId}/scan-log`);
}

// ─────────────────────────────────────────────────────────────
// POLL DATA
// ─────────────────────────────────────────────────────────────
export async function fetchPollData(eventId) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_POLL_DATA[eventId] ?? null;
  }
  return apiFetch(`shx/${eventId}/polls`);
}

// ─────────────────────────────────────────────────────────────
// ANNOUNCE METRICS
// ─────────────────────────────────────────────────────────────
export async function fetchAnnounceMetrics(eventId) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_ANNOUNCE_METRICS[eventId] ?? null;
  }
  return apiFetch(`ig/${eventId}/announce`);
}

// ─────────────────────────────────────────────────────────────
// BRAND SUMMARY (home dashboard overview)
// ─────────────────────────────────────────────────────────────
export async function fetchBrandSummary(brandSlug) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY);
    return MOCK_BRAND_SUMMARY[brandSlug] ?? null;
  }
  return apiFetch(`summary/${brandSlug}`);
}

// ─────────────────────────────────────────────────────────────
// FULL EVENT DATA (all reports bundled — used by DataHubEventDetail)
// ─────────────────────────────────────────────────────────────
export async function fetchEventDashboardData(eventId) {
  const [event, ticketReport, scanLog, pollData, announceMetrics] =
    await Promise.all([
      fetchEvent(eventId),
      fetchTicketReport(eventId),
      fetchScanLog(eventId),
      fetchPollData(eventId),
      fetchAnnounceMetrics(eventId),
    ]);
  return { event, ticketReport, scanLog, pollData, announceMetrics };
}
