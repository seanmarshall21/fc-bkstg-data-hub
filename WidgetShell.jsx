/**
 * WidgetShell.jsx
 * src/modules/data-hub/widgets/WidgetShell.jsx
 *
 * Wrapper for every dashboard widget. Handles:
 *   - Loading skeleton
 *   - Error state with retry
 *   - Empty / no-data state
 *   - Consistent card chrome (title, source badge, drill-down arrow)
 *
 * Usage:
 *   <WidgetShell title="Ticket Sales" source="ShowClix" loading={loading}
 *                onDrillDown={() => navigate('/data-hub/event/123/sales')}>
 *     <YourChartOrTable />
 *   </WidgetShell>
 */

import { color, radius, font, space, cardStyle } from '../../../styles/tokens';

export function WidgetShell({
  title,
  source,
  loading = false,
  error = null,
  empty = false,
  onDrillDown,
  onRetry,
  children,
  style = {},
  compact = false,
}) {
  const pad = compact ? space.md : space.lg;

  return (
    <div style={{ ...cardStyle, overflow: 'hidden', ...style }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${space.md}px ${pad}px`,
        borderBottom: `1px solid ${color.cardBorder}`,
      }}>
        <span style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          {source && (
            <span style={{
              fontSize: font.xs, color: color.textSub,
              backgroundColor: color.bg, borderRadius: radius.sm,
              padding: '2px 6px', border: `1px solid ${color.cardBorder}`,
            }}>
              {source}
            </span>
          )}
          {onDrillDown && (
            <button onClick={onDrillDown} style={{
              background: 'none', border: 'none', padding: '2px 4px',
              cursor: 'pointer', color: color.purple, fontSize: font.sm,
              fontWeight: '600', display: 'flex', alignItems: 'center',
            }}>
              ›
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `${pad}px` }}>
        {loading && <SkeletonBody />}
        {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
        {!loading && !error && empty && <EmptyState title={title} />}
        {!loading && !error && !empty && children}
      </div>
    </div>
  );
}

function SkeletonBody() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
      {[80, 100, 60, 90].map((w, i) => (
        <div key={i} style={{
          height: 12, width: `${w}%`,
          backgroundColor: color.cardBorder,
          borderRadius: radius.sm,
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: `${space.lg}px 0` }}>
      <div style={{ fontSize: font.sm, color: color.danger, marginBottom: space.sm }}>
        {message || 'Failed to load data'}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          fontSize: font.xs, color: color.purple, background: 'none',
          border: `1px solid ${color.purple}`, borderRadius: radius.md,
          padding: '4px 12px', cursor: 'pointer',
        }}>
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: `${space.xl}px 0`, color: color.textSub }}>
      <div style={{ fontSize: 24, marginBottom: space.sm }}>—</div>
      <div style={{ fontSize: font.sm }}>No data yet for {title}</div>
    </div>
  );
}

// ── Stat Row — reusable KPI line used inside widgets ──────────
export function StatRow({ label, value, sub, valueColor, border = true }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: space.sm, paddingBottom: space.sm,
      borderBottom: border ? `1px solid ${color.cardBorder}` : 'none',
    }}>
      <span style={{ fontSize: font.sm, color: color.textMid }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: font.sm, fontWeight: '600',
          color: valueColor || color.textDark }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: font.xs, color: color.textSub }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Mini Bar — inline bar chart row ──────────────────────────
export function MiniBar({ label, value, max, count, barColor }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.sm,
      paddingTop: 5, paddingBottom: 5 }}>
      <span style={{ fontSize: font.xs, color: color.textMid,
        width: 90, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 5, backgroundColor: color.cardBorder, borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor || color.purple,
          borderRadius: 3, minWidth: pct > 0 ? 3 : 0 }} />
      </div>
      <span style={{ fontSize: font.xs, color: color.textDark, fontWeight: '600',
        width: 28, textAlign: 'right', flexShrink: 0 }}>
        {count}
      </span>
    </div>
  );
}
