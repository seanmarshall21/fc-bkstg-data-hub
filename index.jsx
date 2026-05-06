/**
 * widgets/index.jsx
 * src/modules/data-hub/widgets/index.jsx
 *
 * All Data Hub widgets in one file for simplicity.
 * Each is a self-contained component that receives pre-fetched data as props.
 * No fetching happens here — data flows in from DataHubEventDetail.jsx.
 */

import { WidgetShell, StatRow, MiniBar } from './WidgetShell';
import { color, font, space, radius } from '../../../styles/tokens';

// ─────────────────────────────────────────────────────────────
// TICKET SALES SUMMARY
// ─────────────────────────────────────────────────────────────
export function TicketSalesWidget({ data, loading, onDrillDown }) {
  const s = data?.summary;
  const empty = !s;

  return (
    <WidgetShell title="Ticket Sales" source="ShowClix"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {s && (
        <>
          {/* Hero KPI */}
          <div style={{ marginBottom: space.lg }}>
            <div style={{ fontSize: 32, fontWeight: '700', color: color.textDark,
              lineHeight: 1, letterSpacing: '-0.5px' }}>
              {s.total_sold.toLocaleString()}
            </div>
            <div style={{ fontSize: font.xs, color: color.textSub, marginTop: 2 }}>
              tickets sold
            </div>
            {/* Capacity bar */}
            <div style={{ marginTop: space.sm }}>
              <div style={{ height: 6, backgroundColor: color.cardBorder, borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(100, s.capacity_pct * 100).toFixed(1)}%`,
                  backgroundColor: s.capacity_pct >= 1 ? color.green : color.purple,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                marginTop: 3, fontSize: font.xs, color: color.textSub }}>
                <span>{(s.capacity_pct * 100).toFixed(1)}% capacity</span>
                <span>of {s.capacity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <StatRow label="Online" value={s.online.toLocaleString()} border />
          <StatRow label="Door Sales" value={s.door_sales} border />
          <StatRow label="Guest List" value={s.guest_list} border />
          <StatRow label="Total Attendees" value={s.total_attendees.toLocaleString()} border />
          <StatRow label="No-Show Rate"
            value={`${(s.no_show_rate * 100).toFixed(1)}%`}
            sub={`${s.no_show_count} no-shows`}
            valueColor={s.no_show_rate > 0.1 ? color.orange : color.textDark}
            border={false} />
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// PURCHASE TIMELINE
// ─────────────────────────────────────────────────────────────
export function PurchaseTimelineWidget({ data, loading, onDrillDown }) {
  const timeline = data?.timeline;
  const empty = !timeline?.length;

  const max = timeline ? Math.max(...timeline.map((t) => t.count)) : 0;
  const peakDay = timeline?.reduce((a, b) => (b.count > a.count ? b : a), { count: 0 });

  const formatDate = (d) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  return (
    <WidgetShell title="Purchase Timeline" source="ShowClix"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {timeline && (
        <>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {timeline.map((t, i) => {
              const h = max > 0 ? (t.count / max) * 72 : 0;
              const isPeak = t.date === peakDay?.date;
              return (
                <div key={i} style={{ flex: 1, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {isPeak && (
                    <span style={{ fontSize: 7, color: color.purple, fontWeight: '600' }}>
                      {t.count}
                    </span>
                  )}
                  <div style={{
                    width: '100%', height: Math.max(h, 2), borderRadius: '2px 2px 0 0',
                    backgroundColor: isPeak ? color.purple : color.cardBorder,
                    transition: 'height 0.3s ease',
                  }} />
                </div>
              );
            })}
          </div>
          {/* X axis labels — first and last */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginTop: 4, fontSize: 7, color: color.textSub }}>
            <span>{formatDate(timeline[0].date)}</span>
            <span>{formatDate(timeline[timeline.length - 1].date)}</span>
          </div>
          <div style={{ marginTop: space.md, fontSize: font.xs, color: color.textSub }}>
            Peak: <span style={{ color: color.textDark, fontWeight: '600' }}>
              {peakDay?.count} tickets
            </span> on {formatDate(peakDay?.date)}
          </div>
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// SCAN-IN TIMELINE
// ─────────────────────────────────────────────────────────────
export function ScanInWidget({ data, loading, onDrillDown }) {
  const hourly = data?.hourly;
  const empty = !hourly?.length;
  const maxScan = hourly ? Math.max(...hourly.map((h) => h.scanned)) : 0;

  return (
    <WidgetShell title="Scan-In Timeline" source="ShowClix · Scan Logs"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {hourly && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
            {hourly.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex',
                alignItems: 'flex-end', gap: 2 }}>
                {/* Scan bar */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    height: Math.max(maxScan > 0 ? (h.scanned / maxScan) * 64 : 0, 2),
                    backgroundColor: color.purple,
                  }} />
                </div>
                {/* Door bar */}
                {h.door > 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: '100%', borderRadius: '2px 2px 0 0',
                      height: Math.max((h.door / maxScan) * 64, 2),
                      backgroundColor: color.teal,
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginTop: 4, fontSize: 7, color: color.textSub }}>
            {hourly.map((h, i) => <span key={i}>{h.hour}</span>)}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: space.md, marginTop: space.sm }}>
            {[['Scanned In', color.purple], ['Door Sales', color.teal]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4,
                fontSize: font.xs, color: color.textSub }}>
                <div style={{ width: 10, height: 4, backgroundColor: c, borderRadius: 2 }} />
                {l}
              </div>
            ))}
          </div>
          <div style={{ marginTop: space.sm, fontSize: font.xs, color: color.textSub }}>
            Total scanned: <strong style={{ color: color.textDark }}>
              {data.total_scanned.toLocaleString()}
            </strong>
          </div>
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// TRACKING TAGS
// ─────────────────────────────────────────────────────────────
export function TrackingTagsWidget({ data, loading, onDrillDown }) {
  const tags = data?.tracking_tags?.filter((t) => t.tag !== 'Untracked');
  const untracked = data?.tracking_tags?.find((t) => t.tag === 'Untracked');
  const total = tags?.reduce((s, t) => s + t.count, 0) ?? 0;
  const empty = !tags?.length;

  return (
    <WidgetShell title="Tracking Tags" source="ShowClix"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {tags && (
        <>
          <div style={{ fontSize: font.xs, color: color.textSub, marginBottom: space.sm }}>
            {total} tracked · {untracked?.count ?? 0} untracked
          </div>
          {tags.map((t) => (
            <MiniBar key={t.tag} label={t.tag} value={t.count}
              max={tags[0].count} count={t.count} barColor={color.purple} />
          ))}
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER CITIES
// ─────────────────────────────────────────────────────────────
export function CustomerCitiesWidget({ data, loading, onDrillDown }) {
  const cities = data?.cities;
  const empty = !cities?.length;
  const topCity = cities?.[0];

  return (
    <WidgetShell title="Purchaser Cities" source="ShowClix · Customers"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {cities && (
        <>
          {/* Simple donut representation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: space.lg,
            marginBottom: space.md }}>
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" width="64" height="64">
                {buildDonutSegments(cities)}
                <text x="18" y="21" textAnchor="middle"
                  fontSize="6" fill={color.textDark} fontWeight="600">
                  {cities.reduce((s, c) => s + c.count, 0).toLocaleString()}
                </text>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              {cities.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: font.xs, padding: '2px 0',
                  borderBottom: i < 4 ? `1px solid ${color.cardBorder}` : 'none' }}>
                  <span style={{ color: color.textMid }}>{c.city}</span>
                  <span style={{ fontWeight: '600', color: color.textDark }}>
                    {(c.pct * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </WidgetShell>
  );
}

const DONUT_COLORS = [color.purple, color.purpleMid, '#C4AFFE', '#DDD3FF', color.cardBorder];
function buildDonutSegments(cities) {
  const r = 14; const cx = 18; const cy = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return cities.map((c, i) => {
    const dash = c.pct * circumference;
    const seg = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none"
        stroke={DONUT_COLORS[i] || color.cardBorder} strokeWidth="7"
        strokeDasharray={`${dash} ${circumference}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`} />
    );
    offset += dash;
    return seg;
  });
}

// ─────────────────────────────────────────────────────────────
// FINANCIAL SUMMARY
// ─────────────────────────────────────────────────────────────
export function FinancialWidget({ data, loading, onDrillDown }) {
  const fin = data?.financials;
  const empty = !fin;

  const fmt = (n) => n != null
    ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : '—';

  return (
    <WidgetShell title="Financial Summary" source="ShowClix · Financials"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {fin && (
        <>
          <div style={{ marginBottom: space.md }}>
            <div style={{ fontSize: 26, fontWeight: '700', color: color.green,
              letterSpacing: '-0.5px' }}>
              {fmt(fin.profit_estimate)}
            </div>
            <div style={{ fontSize: font.xs, color: color.textSub }}>estimated profit</div>
          </div>
          <StatRow label="Gross Revenue"    value={fmt(fin.gross_revenue)} border />
          <StatRow label="Service Fees"     value={fmt(fin.service_fees)}  border />
          <StatRow label="Net Revenue"      value={fmt(fin.net_revenue)}   border />
          <StatRow label="Bar Split"        value={fmt(fin.bar_split)}     border />
          <StatRow label="Total Revenue"    value={fmt(fin.total_revenue)} border />
          <StatRow label="Total Expenses"
            value={fmt(fin.total_expenses)}
            valueColor={color.danger} border={false} />
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// POLL RESPONSES
// ─────────────────────────────────────────────────────────────
export function PollWidget({ data, loading, onDrillDown, onMerge }) {
  const poll = data;
  const empty = !poll?.answers?.length;
  const pendingCount = poll?.pending_normalization?.length ?? 0;

  return (
    <WidgetShell title={poll?.question || 'Polling'} source="Sales API"
      loading={loading} empty={empty} onDrillDown={onDrillDown}>
      {poll && (
        <>
          {pendingCount > 0 && (
            <button onClick={onMerge} style={{
              width: '100%', marginBottom: space.md, padding: '6px 12px',
              backgroundColor: color.amberLight, color: color.amber,
              border: `1px solid ${color.amber}`, borderRadius: radius.md,
              fontSize: font.xs, fontWeight: '600', cursor: 'pointer', textAlign: 'left',
            }}>
              ⚠ {pendingCount} responses need normalization — tap to review
            </button>
          )}
          {poll.answers.map((a) => (
            <MiniBar key={a.answer} label={a.answer} value={a.count}
              max={poll.answers[0].count} count={a.count} barColor={color.purple} />
          ))}
          <div style={{ marginTop: space.sm, fontSize: font.xs, color: color.textSub }}>
            {poll.total_responses} total responses
          </div>
        </>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────────────────────────
// ANNOUNCE METRICS (Social)
// ─────────────────────────────────────────────────────────────
export function AnnounceMetricsWidget({ data, loading }) {
  const m = data;
  const empty = !m;
  const metrics = m
    ? [
        { label: 'Reach',    value: m.reach?.toLocaleString() },
        { label: 'Likes',    value: m.likes },
        { label: 'Comments', value: m.comments },
        { label: 'Shares',   value: m.shares },
        { label: 'Opt-Ins',  value: m.opt_ins },
      ]
    : [];

  return (
    <WidgetShell title="Announce Metrics" source="Instagram" loading={loading} empty={empty}>
      {m && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.sm }}>
          {metrics.map((mt) => (
            <div key={mt.label} style={{
              backgroundColor: color.bg, borderRadius: radius.md,
              padding: `${space.sm}px ${space.md}px`,
            }}>
              <div style={{ fontSize: font.xs, color: color.textSub }}>{mt.label}</div>
              <div style={{ fontSize: font.lg, fontWeight: '700', color: color.textDark }}>
                {mt.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
