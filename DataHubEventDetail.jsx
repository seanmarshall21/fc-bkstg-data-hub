/**
 * DataHubEventDetail.jsx
 * src/modules/data-hub/screens/DataHubEventDetail.jsx
 *
 * Per-event data dashboard. All widgets in a scrollable grid.
 * Users can toggle widget visibility. Preference saved to localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEventDashboardData } from '../api/dataHubClient';
import {
  TicketSalesWidget, PurchaseTimelineWidget, ScanInWidget,
  TrackingTagsWidget, CustomerCitiesWidget, FinancialWidget,
  PollWidget, AnnounceMetricsWidget,
} from '../widgets';
import { BottomNav } from '../components/BottomNav';
import { color, font, space, radius, chipStyle } from '../../../styles/tokens';

const ALL_WIDGETS = [
  { id: 'tickets',   label: 'Ticket Sales',      defaultOn: true  },
  { id: 'timeline',  label: 'Purchase Timeline', defaultOn: true  },
  { id: 'scan',      label: 'Scan-In',           defaultOn: true  },
  { id: 'tags',      label: 'Tracking Tags',     defaultOn: true  },
  { id: 'cities',    label: 'Cities',            defaultOn: true  },
  { id: 'financial', label: 'Financials',        defaultOn: true  },
  { id: 'poll',      label: 'Polling',           defaultOn: true  },
  { id: 'announce',  label: 'Announce Metrics',  defaultOn: false },
];

function getStoredWidgets(eventId) {
  try {
    const stored = localStorage.getItem(`dh_widgets_${eventId}`);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export default function DataHubEventDetail() {
  const { eventId } = useParams();
  const navigate    = useNavigate();

  const [data, setData]         = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [managing, setManaging] = useState(false);
  const [pollMergeOpen, setPollMergeOpen] = useState(false);

  const storedWidgets = getStoredWidgets(eventId);
  const [activeWidgets, setActiveWidgets] = useState(
    storedWidgets ??
    Object.fromEntries(ALL_WIDGETS.map((w) => [w.id, w.defaultOn]))
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEventDashboardData(eventId);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  function toggleWidget(id) {
    setActiveWidgets((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(`dh_widgets_${eventId}`, JSON.stringify(next));
      return next;
    });
  }

  const event = data.event;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: color.bg,
      display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <div style={{ backgroundColor: color.navBg, padding: `48px ${space.lg}px ${space.md}px`,
        borderBottom: `1px solid ${color.navBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.md,
          marginBottom: space.xs }}>
          <button onClick={() => navigate('/data-hub')} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: color.textLight, cursor: 'pointer', padding: 0, lineHeight: 1,
          }}>
            ←
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: font.base, fontWeight: '700',
              color: color.textDark, margin: 0 }}>
              {event?.name ?? 'Event Dashboard'}
            </h1>
            {event && (
              <div style={{ fontSize: font.xs, color: color.textSub }}>
                {formatDate(event.date)} · {event.venue}
              </div>
            )}
          </div>
          <button onClick={() => setManaging((p) => !p)} style={{
            fontSize: font.xs, fontWeight: '600', color: color.purple,
            background: 'none', border: `1px solid ${color.purple}`,
            borderRadius: radius.md, padding: '4px 10px', cursor: 'pointer',
          }}>
            {managing ? 'Done' : 'Manage'}
          </button>
        </div>

        {/* Widget manage strip */}
        {managing && (
          <div style={{ display: 'flex', gap: space.sm, overflowX: 'auto',
            paddingBottom: 4, scrollbarWidth: 'none', marginTop: space.sm }}>
            {ALL_WIDGETS.map((w) => (
              <button key={w.id} onClick={() => toggleWidget(w.id)}
                style={{ ...chipStyle(activeWidgets[w.id]), flexShrink: 0 }}>
                {activeWidgets[w.id] ? '✓ ' : ''}{w.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: space.lg, padding: space.md, backgroundColor: '#FFF0F0',
          border: `1px solid ${color.danger}`, borderRadius: radius.md,
          fontSize: font.sm, color: color.danger, textAlign: 'center' }}>
          {error}
          <button onClick={load} style={{ display: 'block', margin: `${space.sm}px auto 0`,
            color: color.purple, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: font.xs, fontWeight: '600' }}>
            Retry
          </button>
        </div>
      )}

      {/* Widget grid */}
      <div style={{ flex: 1, padding: space.lg, paddingBottom: 110,
        display: 'flex', flexDirection: 'column', gap: space.md }}>

        {activeWidgets.tickets && (
          <TicketSalesWidget data={data.ticketReport} loading={loading}
            onDrillDown={() => navigate(`/data-hub/event/${eventId}/tickets`)} />
        )}

        {/* 2-column row for timeline + scan */}
        {(activeWidgets.timeline || activeWidgets.scan) && (
          <div style={{ display: 'grid',
            gridTemplateColumns: activeWidgets.timeline && activeWidgets.scan
              ? '1fr 1fr' : '1fr',
            gap: space.md }}>
            {activeWidgets.timeline && (
              <PurchaseTimelineWidget data={data.ticketReport} loading={loading}
                onDrillDown={() => navigate(`/data-hub/event/${eventId}/timeline`)} />
            )}
            {activeWidgets.scan && (
              <ScanInWidget data={data.scanLog} loading={loading}
                onDrillDown={() => navigate(`/data-hub/event/${eventId}/scan`)} />
            )}
          </div>
        )}

        {activeWidgets.tags && (
          <TrackingTagsWidget data={data.ticketReport} loading={loading}
            onDrillDown={() => navigate(`/data-hub/event/${eventId}/tags`)} />
        )}

        {activeWidgets.cities && (
          <CustomerCitiesWidget data={data.ticketReport} loading={loading}
            onDrillDown={() => navigate(`/data-hub/event/${eventId}/cities`)} />
        )}

        {activeWidgets.financial && (
          <FinancialWidget data={data.ticketReport} loading={loading}
            onDrillDown={() => navigate(`/data-hub/event/${eventId}/financial`)} />
        )}

        {activeWidgets.poll && (
          <PollWidget data={data.pollData} loading={loading}
            onDrillDown={() => navigate(`/data-hub/event/${eventId}/poll`)}
            onMerge={() => setPollMergeOpen(true)} />
        )}

        {activeWidgets.announce && (
          <AnnounceMetricsWidget data={data.announceMetrics} loading={loading} />
        )}
      </div>

      {/* Poll normalization sheet */}
      {pollMergeOpen && (
        <PollNormalizationSheet
          pending={data.pollData?.pending_normalization ?? []}
          onClose={() => setPollMergeOpen(false)} />
      )}

      <BottomNav active="data" />
    </div>
  );
}

function PollNormalizationSheet({ pending, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: color.overlay, zIndex: 50,
      display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', backgroundColor: color.card, borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
        padding: space.xl, maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: space.lg }}>
          <h2 style={{ fontSize: font.base, fontWeight: '700', margin: 0, color: color.textDark }}>
            Normalize Poll Responses
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            fontSize: font.base, cursor: 'pointer', color: color.textLight }}>✕</button>
        </div>
        <p style={{ fontSize: font.sm, color: color.textSub, margin: `0 0 ${space.lg}px` }}>
          These responses are likely duplicates. Approve each merge to combine them.
        </p>
        {pending.map((p, i) => (
          <div key={i} style={{ backgroundColor: color.bg, borderRadius: radius.md,
            padding: space.md, marginBottom: space.sm }}>
            <div style={{ fontSize: font.xs, color: color.textSub, marginBottom: 4 }}>
              "{p.raw}" × {p.count} → merge into
            </div>
            <div style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark,
              marginBottom: space.sm }}>
              "{p.suggested}"
            </div>
            <div style={{ display: 'flex', gap: space.sm }}>
              <button style={{ flex: 1, padding: '6px', backgroundColor: color.purple,
                color: color.white, border: 'none', borderRadius: radius.md,
                fontSize: font.xs, fontWeight: '600', cursor: 'pointer' }}>
                Merge
              </button>
              <button style={{ flex: 1, padding: '6px', backgroundColor: color.bg,
                color: color.textMid, border: `1px solid ${color.cardBorder}`,
                borderRadius: radius.md, fontSize: font.xs, cursor: 'pointer' }}>
                Keep Separate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US',
    { month: 'short', day: 'numeric', year: 'numeric' });
}
