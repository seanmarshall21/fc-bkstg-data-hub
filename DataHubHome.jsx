/**
 * DataHubHome.jsx
 * src/modules/data-hub/screens/DataHubHome.jsx
 *
 * Data Hub landing page. Shows:
 *   - Brand filter tabs
 *   - Event cards with key stats
 *   - Tap event → DataHubEventDetail
 *
 * Matches the app's design system: F4F4F4 bg, FCFCFC cards, 1B112E bottom nav.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, fetchBrands } from '../api/dataHubClient';
import { color, font, space, radius, cardStyle, chipStyle } from '../../../styles/tokens';
import { BottomNav } from '../components/BottomNav';

const STATUS_LABELS = {
  post_event: { label: 'Post Event', bg: color.bg, text: color.textLight },
  on_sale:    { label: 'On Sale',    bg: '#E6F7EC', text: color.green },
  presale:    { label: 'Presale',    bg: color.purpleLight, text: color.purple },
  planning:   { label: 'Planning',   bg: color.amberLight, text: color.amber },
};

export default function DataHubHome() {
  const navigate = useNavigate();
  const [brands, setBrands]       = useState([]);
  const [events, setEvents]       = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchBrands().then((b) => {
      setBrands(b);
      setActiveBrand(b[0]?.slug ?? null);
    });
  }, []);

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetchEvents(activeBrand).then((e) => { setEvents(e); setLoading(false); });
  }, [activeBrand]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: color.bg,
      display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <div style={{ backgroundColor: color.navBg, padding: `48px ${space.lg}px ${space.md}px`,
        borderBottom: `1px solid ${color.navBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: space.md }}>
          <h1 style={{ fontSize: font.lg, fontWeight: '700', color: color.textDark, margin: 0 }}>
            Data Hub
          </h1>
          <button onClick={() => navigate('/')} style={{
            fontSize: font.sm, color: color.textLight, background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        {/* Brand tabs */}
        <div style={{ display: 'flex', gap: space.sm, overflowX: 'auto',
          paddingBottom: 2, scrollbarWidth: 'none' }}>
          {brands.map((b) => (
            <button key={b.slug} onClick={() => setActiveBrand(b.slug)}
              style={{ ...chipStyle(activeBrand === b.slug), flexShrink: 0 }}>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div style={{ flex: 1, padding: space.lg, paddingBottom: 100,
        display: 'flex', flexDirection: 'column', gap: space.md }}>

        {loading && [1, 2, 3].map((i) => (
          <div key={i} style={{ ...cardStyle, height: 110,
            backgroundColor: color.card }} />
        ))}

        {!loading && events.map((event) => (
          <EventCard key={event.id} event={event}
            onClick={() => navigate(`/data-hub/event/${event.id}`)} />
        ))}

        {!loading && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: `${space.xxl}px 0`,
            color: color.textSub, fontSize: font.sm }}>
            No events found for this brand
          </div>
        )}
      </div>

      <BottomNav active="data" />
    </div>
  );
}

function EventCard({ event, onClick }) {
  const status = STATUS_LABELS[event.status] || STATUS_LABELS.planning;

  return (
    <button onClick={onClick} style={{
      ...cardStyle, width: '100%', textAlign: 'left',
      padding: `${space.md}px ${space.lg}px`,
      display: 'flex', flexDirection: 'column', gap: space.sm,
      cursor: 'pointer', border: `1px solid ${color.cardBorder}`,
      transition: 'border-color 0.15s',
    }}>
      {/* Row 1: name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: space.sm }}>
        <div>
          <div style={{ fontSize: font.base, fontWeight: '700', color: color.textDark }}>
            {event.name}
          </div>
          {event.subtitle && (
            <div style={{ fontSize: font.xs, color: color.textLight }}>{event.subtitle}</div>
          )}
          <div style={{ fontSize: font.xs, color: color.textSub, marginTop: 2 }}>
            {formatDate(event.date)} · {event.venue}
          </div>
        </div>
        <span style={{
          fontSize: font.xs, fontWeight: '600', whiteSpace: 'nowrap',
          backgroundColor: status.bg, color: status.text,
          padding: '3px 8px', borderRadius: radius.pill,
          flexShrink: 0,
        }}>
          {status.label}
        </span>
      </div>

      {/* Row 2: mini stats */}
      <div style={{ display: 'flex', gap: space.xl }}>
        <MiniStat label="Capacity" value={`${event.capacity.toLocaleString()}`} />
        <div style={{ height: 28, width: 1, backgroundColor: color.cardBorder }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', color: color.purple, fontSize: font.xs,
          fontWeight: '600', gap: 4 }}>
          View Dashboard ›
        </div>
      </div>
    </button>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: font.xs, color: color.textSub }}>{label}</div>
      <div style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark }}>{value}</div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
