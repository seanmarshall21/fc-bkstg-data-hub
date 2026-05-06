/**
 * OpsHubHome.jsx
 * src/modules/ops-hub/screens/OpsHubHome.jsx
 *
 * Ops Hub (Gate Hub) landing. Event selector + four main sections.
 * Each section navigates to its own screen.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, fetchBrands } from '../../data-hub/api/dataHubClient';
import { BottomNav } from '../../data-hub/components/BottomNav';
import { color, font, space, radius, cardStyle, chipStyle } from '../../../styles/tokens';

const SECTIONS = [
  {
    id: 'price-levels',
    icon: '◈',
    label: 'Price Levels',
    desc: 'View and manage ticket tiers, pricing, and inventory',
    color: color.purple,
    bg: color.purpleLight,
  },
  {
    id: 'bundles',
    icon: '⊞',
    label: 'Bundles',
    desc: 'Create and edit ticket bundle packages',
    color: color.green,
    bg: color.greenLight,
  },
  {
    id: 'coupons',
    icon: '%',
    label: 'Coupons',
    desc: 'Look up, validate, and manage discount codes',
    color: color.amber,
    bg: color.amberLight,
  },
  {
    id: 'ticket-lookup',
    icon: '⊡',
    label: 'Ticket Lookup',
    desc: 'Find orders by name, email, or confirmation number',
    color: color.coral,
    bg: color.coralLight,
  },
];

export default function OpsHubHome() {
  const navigate = useNavigate();
  const [brands, setBrands]   = useState([]);
  const [events, setEvents]   = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    fetchBrands().then((b) => { setBrands(b); setActiveBrand(b[0]?.slug ?? null); });
  }, []);

  useEffect(() => {
    if (!activeBrand) return;
    fetchEvents(activeBrand).then((e) => {
      setEvents(e);
      setActiveEvent(e[0]?.id ?? null);
    });
  }, [activeBrand]);

  const selectedEvent = events.find((e) => e.id === activeEvent);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: color.bg,
      display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <div style={{ backgroundColor: color.navBg, padding: `48px ${space.lg}px ${space.md}px`,
        borderBottom: `1px solid ${color.navBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: space.md }}>
          <div>
            <h1 style={{ fontSize: font.lg, fontWeight: '700', color: color.textDark, margin: 0 }}>
              Gate Hub
            </h1>
            <div style={{ fontSize: font.xs, color: color.textSub }}>
              Ticketing &amp; Operations
            </div>
          </div>
          <button onClick={() => navigate('/')} style={{
            fontSize: font.sm, color: color.textLight, background: 'none',
            border: 'none', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Brand tabs */}
        <div style={{ display: 'flex', gap: space.sm, overflowX: 'auto',
          scrollbarWidth: 'none', marginBottom: space.sm }}>
          {brands.map((b) => (
            <button key={b.slug} onClick={() => setActiveBrand(b.slug)}
              style={{ ...chipStyle(activeBrand === b.slug), flexShrink: 0 }}>
              {b.name}
            </button>
          ))}
        </div>

        {/* Event selector */}
        <select
          value={activeEvent ?? ''}
          onChange={(e) => setActiveEvent(e.target.value)}
          style={{
            width: '100%', padding: `${space.sm}px ${space.md}px`,
            backgroundColor: color.bg, border: `1px solid ${color.cardBorder}`,
            borderRadius: radius.md, fontSize: font.sm, color: color.textDark,
            appearance: 'none',
          }}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {formatDate(e.date)}
            </option>
          ))}
        </select>
      </div>

      {/* Active event banner */}
      {selectedEvent && (
        <div style={{ margin: `${space.lg}px ${space.lg}px 0`,
          backgroundColor: color.purpleLight, borderRadius: radius.lg,
          padding: `${space.md}px ${space.lg}px`,
          border: `1px solid ${color.purple}`, opacity: 0.9 }}>
          <div style={{ fontSize: font.xs, color: color.purple, fontWeight: '600',
            marginBottom: 2 }}>
            ACTIVE EVENT
          </div>
          <div style={{ fontSize: font.base, fontWeight: '700', color: color.textDark }}>
            {selectedEvent.name}
          </div>
          <div style={{ fontSize: font.xs, color: color.textMid }}>
            {selectedEvent.venue} · {formatDate(selectedEvent.date)}
          </div>
        </div>
      )}

      {/* Section cards */}
      <div style={{ flex: 1, padding: space.lg, paddingBottom: 110,
        display: 'flex', flexDirection: 'column', gap: space.md, marginTop: space.md }}>
        {SECTIONS.map((sec) => (
          <button key={sec.id}
            onClick={() => navigate(`/ops/${sec.id}/${activeEvent ?? ''}`)}
            style={{
              ...cardStyle, width: '100%', textAlign: 'left', cursor: 'pointer',
              padding: `${space.md}px ${space.lg}px`,
              display: 'flex', alignItems: 'center', gap: space.lg,
              border: `1px solid ${color.cardBorder}`,
            }}>
            <div style={{ width: 44, height: 44, borderRadius: radius.md,
              backgroundColor: sec.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, color: sec.color, flexShrink: 0 }}>
              {sec.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: font.base, fontWeight: '600', color: color.textDark }}>
                {sec.label}
              </div>
              <div style={{ fontSize: font.xs, color: color.textSub, marginTop: 2 }}>
                {sec.desc}
              </div>
            </div>
            <span style={{ color: color.textLight, fontSize: font.lg }}>›</span>
          </button>
        ))}

        {/* Leap link */}
        <div style={{ textAlign: 'center', marginTop: space.md }}>
          <a href="https://www.showclix.com" target="_blank" rel="noreferrer"
            style={{ fontSize: font.xs, color: color.textSub }}>
            Open full ShowClix dashboard ↗
          </a>
        </div>
      </div>

      <BottomNav active="ops" />
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US',
    { month: 'short', day: 'numeric', year: 'numeric' });
}
