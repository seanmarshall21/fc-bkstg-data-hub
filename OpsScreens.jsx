/**
 * PriceLevelsView.jsx + BundlesView.jsx + CouponManagerView.jsx + TicketLookupView.jsx
 * src/modules/ops-hub/screens/
 *
 * All four Ops Hub operational screens. Fully functional with mock data.
 * Writes (create/update) use opsHubClient which proxies to Leap Core API.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchPriceLevels, updatePriceLevel, createPriceLevel,
  fetchBundles, createBundle, updateBundle,
  fetchCoupons, fetchCouponByCode, validateCoupon,
  searchOrders,
} from '../api/opsHubClient';
import { BottomNav } from '../../data-hub/components/BottomNav';
import { color, font, space, radius, cardStyle } from '../../../styles/tokens';

// ── Shared screen shell ──────────────────────────────────────
function OpsScreen({ title, sub, children }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: color.bg,
      display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: color.navBg, padding: `48px ${space.lg}px ${space.md}px`,
        borderBottom: `1px solid ${color.navBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: color.textLight, cursor: 'pointer', padding: 0 }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: font.base, fontWeight: '700',
              color: color.textDark, margin: 0 }}>{title}</h1>
            {sub && <div style={{ fontSize: font.xs, color: color.textSub }}>{sub}</div>}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: space.lg, paddingBottom: 110 }}>
        {children}
      </div>
      <BottomNav active="ops" />
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────
const STATUS_STYLES = {
  active:    { bg: '#E6F7EC', text: color.green  },
  sold_out:  { bg: '#FFE9E9', text: color.danger  },
  scheduled: { bg: color.purpleLight, text: color.purple },
  inactive:  { bg: color.bg, text: color.textLight },
};
function StatusBadge({ status }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES.inactive;
  const labels = { active:'Active', sold_out:'Sold Out',
    scheduled:'Scheduled', inactive:'Inactive' };
  return (
    <span style={{ fontSize: font.xs, fontWeight: '600', padding: '3px 8px',
      borderRadius: radius.pill, backgroundColor: st.bg, color: st.text }}>
      {labels[status] ?? status}
    </span>
  );
}

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════
// PRICE LEVELS
// ═══════════════════════════════════════════════════════════
export function PriceLevelsView() {
  const { eventId } = useParams();
  const [levels, setLevels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // pl id being edited
  const [creating, setCreating] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    fetchPriceLevels(eventId).then((l) => { setLevels(l); setLoading(false); });
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function saveEdit(id) {
    await updatePriceLevel(id, editDraft);
    setEditing(null);
    load();
  }

  async function saveNew(data) {
    await createPriceLevel(eventId, data);
    setCreating(false);
    load();
  }

  const totalSold = levels.reduce((s, l) => s + l.sold, 0);
  const totalCap  = levels.reduce((s, l) => s + l.inventory, 0);

  return (
    <OpsScreen title="Price Levels" sub={`${totalSold} sold of ${totalCap} total`}>
      {/* Summary bar */}
      {!loading && levels.length > 0 && (
        <div style={{ ...cardStyle, padding: `${space.md}px ${space.lg}px`,
          marginBottom: space.md, display: 'flex', justifyContent: 'space-between' }}>
          {[
            { l: 'Total Sold', v: totalSold.toLocaleString() },
            { l: 'Remaining', v: (totalCap - totalSold).toLocaleString() },
            { l: 'Capacity', v: totalCap.toLocaleString() },
          ].map(({ l, v }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: font.xl, fontWeight: '700', color: color.textDark }}>{v}</div>
              <div style={{ fontSize: font.xs, color: color.textSub }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Price level cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {loading && [1,2,3].map((i) => (
          <div key={i} style={{ ...cardStyle, height: 100 }} />
        ))}

        {!loading && levels.map((pl) => (
          <div key={pl.id} style={{ ...cardStyle, overflow: 'hidden' }}>
            {/* Top row */}
            <div style={{ padding: `${space.md}px ${space.lg}px`,
              borderBottom: `1px solid ${color.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: font.base, fontWeight: '700', color: color.textDark }}>
                  {pl.name}
                </div>
                <div style={{ fontSize: font.xs, color: color.textSub }}>
                  {pl.price.display} + {pl.service_fee.display} fee
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                <StatusBadge status={pl.status} />
                {pl.status === 'active' && (
                  <button onClick={() => { setEditing(pl.id); setEditDraft({
                    inventory: pl.inventory, active: pl.active,
                    online_hide: pl.online_hide, bo_hide: pl.bo_hide,
                  }); }} style={{ background: 'none', border: 'none',
                    fontSize: font.xs, color: color.purple, cursor: 'pointer',
                    fontWeight: '600' }}>
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div style={{ padding: `${space.sm}px ${space.lg}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: font.xs, color: color.textSub, marginBottom: 4 }}>
                <span>{pl.sold} sold</span>
                <span>{pl.remaining} remaining of {pl.inventory}</span>
              </div>
              <div style={{ height: 5, backgroundColor: color.cardBorder, borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(100, (pl.sold / pl.inventory) * 100)}%`,
                  backgroundColor: pl.status === 'sold_out' ? color.danger : color.purple,
                }} />
              </div>
              <div style={{ display: 'flex', gap: space.sm, marginTop: space.sm }}>
                <Tag label={pl.online_hide ? 'Hidden Online' : 'Online'} />
                <Tag label={pl.bo_hide ? 'Hidden BO' : 'Box Office'} />
              </div>
            </div>

            {/* Inline edit form */}
            {editing === pl.id && (
              <EditForm
                draft={editDraft}
                onChange={setEditDraft}
                onSave={() => saveEdit(pl.id)}
                onCancel={() => setEditing(null)}
                fields={[
                  { key: 'inventory', label: 'Total Inventory', type: 'number' },
                  { key: 'online_hide', label: 'Hide Online', type: 'toggle' },
                  { key: 'bo_hide', label: 'Hide Box Office', type: 'toggle' },
                  { key: 'active', label: 'Active', type: 'toggle' },
                ]}
              />
            )}
          </div>
        ))}
      </div>

      {/* Create new button */}
      <button onClick={() => setCreating(true)} style={{
        width: '100%', marginTop: space.lg, padding: space.md,
        backgroundColor: color.purple, color: color.white, border: 'none',
        borderRadius: radius.lg, fontSize: font.sm, fontWeight: '600', cursor: 'pointer',
      }}>
        + Add Price Level
      </button>

      {creating && (
        <CreatePriceLevelSheet onSave={saveNew} onClose={() => setCreating(false)} />
      )}
    </OpsScreen>
  );
}

// ═══════════════════════════════════════════════════════════
// BUNDLES
// ═══════════════════════════════════════════════════════════
export function BundlesView() {
  const { eventId } = useParams();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBundles(eventId).then((b) => { setBundles(b); setLoading(false); });
  }, [eventId]);

  return (
    <OpsScreen title="Bundles" sub="Ticket packages and multi-ticket offers">
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {loading && [1,2].map((i) => <div key={i} style={{ ...cardStyle, height: 120 }} />)}

        {!loading && bundles.length === 0 && (
          <div style={{ textAlign: 'center', padding: `${space.xxl}px 0`,
            color: color.textSub, fontSize: font.sm }}>
            No bundles for this event yet
          </div>
        )}

        {!loading && bundles.map((b) => (
          <div key={b.id} style={cardStyle}>
            <div style={{ padding: `${space.md}px ${space.lg}px`,
              borderBottom: `1px solid ${color.cardBorder}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: font.base, fontWeight: '700', color: color.textDark }}>
                  {b.name}
                </div>
                <div style={{ fontSize: font.xs, color: color.textSub }}>{b.description}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                gap: 4 }}>
                <StatusBadge status={b.status} />
                {b.flex && <Tag label="Flex Bundle" />}
              </div>
            </div>
            <div style={{ padding: `${space.sm}px ${space.lg}px`,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.sm }}>
              {[
                { l: 'Price', v: b.price.display },
                { l: 'Sold', v: `${b.sold} / ${b.inventory}` },
                { l: 'Remaining', v: b.remaining },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize: font.xs, color: color.textSub }}>{l}</div>
                  <div style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            {b.flex && (
              <div style={{ padding: `0 ${space.lg}px ${space.sm}px`,
                fontSize: font.xs, color: color.textSub }}>
                Flex: {b.flex_minimum}–{b.flex_maximum} tickets · {b.flex_percent_discount}% off
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => setCreating(true)} style={{
        width: '100%', marginTop: space.lg, padding: space.md,
        backgroundColor: color.green, color: color.white, border: 'none',
        borderRadius: radius.lg, fontSize: font.sm, fontWeight: '600', cursor: 'pointer',
      }}>
        + Create Bundle
      </button>

      {creating && <CreateBundleSheet onClose={() => setCreating(false)}
        onSave={async (data) => {
          await createBundle(eventId, data);
          setCreating(false);
          fetchBundles(eventId).then(setBundles);
        }} />}
    </OpsScreen>
  );
}

// ═══════════════════════════════════════════════════════════
// COUPON MANAGER
// ═══════════════════════════════════════════════════════════
export function CouponManagerView() {
  const { eventId } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  useEffect(() => {
    fetchCoupons(eventId).then((c) => { setCoupons(c); setLoading(false); });
  }, [eventId]);

  async function handleLookup() {
    if (!lookupCode.trim()) return;
    setLookupLoading(true); setLookupError(null); setLookupResult(null);
    try {
      const result = await validateCoupon(lookupCode.trim(), eventId);
      setLookupResult(result);
    } catch (e) {
      setLookupError(e.message);
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <OpsScreen title="Coupons" sub="Discount, presale, comp, and access codes">
      {/* Code lookup */}
      <div style={{ ...cardStyle, padding: space.lg, marginBottom: space.lg }}>
        <div style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark,
          marginBottom: space.sm }}>
          Validate a Code
        </div>
        <div style={{ display: 'flex', gap: space.sm }}>
          <input value={lookupCode} onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter coupon code…"
            style={{ flex: 1, padding: `${space.sm}px ${space.md}px`,
              border: `1px solid ${color.cardBorder}`, borderRadius: radius.md,
              fontSize: font.sm, color: color.textDark, backgroundColor: color.bg }} />
          <button onClick={handleLookup} disabled={lookupLoading} style={{
            padding: `${space.sm}px ${space.lg}px`, backgroundColor: color.purple,
            color: color.white, border: 'none', borderRadius: radius.md,
            fontSize: font.sm, fontWeight: '600', cursor: 'pointer',
            opacity: lookupLoading ? 0.6 : 1,
          }}>
            {lookupLoading ? '…' : 'Check'}
          </button>
        </div>
        {lookupError && (
          <div style={{ marginTop: space.sm, fontSize: font.xs,
            color: color.danger, fontWeight: '600' }}>
            ✗ {lookupError}
          </div>
        )}
        {lookupResult && (
          <div style={{ marginTop: space.sm, padding: space.md, borderRadius: radius.md,
            backgroundColor: lookupResult.valid ? '#E6F7EC' : '#FFE9E9',
            border: `1px solid ${lookupResult.valid ? color.green : color.danger}` }}>
            <div style={{ fontSize: font.sm, fontWeight: '700',
              color: lookupResult.valid ? color.green : color.danger }}>
              {lookupResult.valid ? '✓ Valid' : '✗ Invalid'}
            </div>
            {lookupResult.reason && (
              <div style={{ fontSize: font.xs, color: color.textMid, marginTop: 2 }}>
                {lookupResult.reason}
              </div>
            )}
            {lookupResult.coupon && (
              <div style={{ fontSize: font.xs, color: color.textMid, marginTop: 4 }}>
                {lookupResult.coupon.name} · {lookupResult.coupon.type}
                {lookupResult.coupon.amount != null && (
                  ` · ${lookupResult.coupon.amount}${lookupResult.coupon.amount_type === 'percentage' ? '%' : '$'} off`
                )}
                {' · '}{lookupResult.coupon.used} / {lookupResult.coupon.limit} used
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coupon list */}
      <div style={{ fontSize: font.xs, color: color.textSub, fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: space.sm }}>
        Active Coupons
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {loading && [1,2,3].map((i) => <div key={i} style={{ ...cardStyle, height: 72 }} />)}
        {!loading && coupons.filter((c) => c.active).map((c) => (
          <CouponCard key={c.id} coupon={c} />
        ))}
      </div>

      {coupons.some((c) => !c.active) && (
        <>
          <div style={{ fontSize: font.xs, color: color.textSub, fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginTop: space.lg, marginBottom: space.sm }}>
            Expired / Inactive
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
            {coupons.filter((c) => !c.active).map((c) => (
              <CouponCard key={c.id} coupon={c} dimmed />
            ))}
          </div>
        </>
      )}
    </OpsScreen>
  );
}

function CouponCard({ coupon, dimmed }) {
  const typeColors = {
    Discount: { bg: color.greenLight, text: color.green },
    Comp:     { bg: color.purpleLight, text: color.purple },
    Reserved: { bg: color.amberLight, text: color.amber },
    Access:   { bg: '#E3F2FF', text: '#1A6FBF' },
  };
  const tc = typeColors[coupon.type] || typeColors.Access;

  return (
    <div style={{ ...cardStyle, padding: `${space.md}px ${space.lg}px`,
      opacity: dimmed ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: font.sm, fontWeight: '600', color: color.textDark }}>
            {coupon.name}
          </div>
          <div style={{ fontSize: font.xs, color: color.textSub,
            fontFamily: 'monospace', marginTop: 2 }}>
            {coupon.code}
            {coupon.amount != null && (
              <span style={{ marginLeft: space.sm, color: color.textMid }}>
                · {coupon.amount}{coupon.amount_type === 'percentage' ? '%' : '$'} off
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: font.xs, fontWeight: '600', padding: '2px 8px',
            borderRadius: radius.pill, backgroundColor: tc.bg, color: tc.text }}>
            {coupon.type}
          </span>
          <span style={{ fontSize: font.xs, color: color.textSub }}>
            {coupon.used} / {coupon.limit} used
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TICKET LOOKUP
// ═══════════════════════════════════════════════════════════
export function TicketLookupView() {
  const { eventId } = useParams();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await searchOrders({ query: query.trim(), eventId: eventId || null });
      setResults(res);
    } catch (e) { setResults([]); }
    setLoading(false);
  }

  return (
    <OpsScreen title="Ticket Lookup" sub="Find orders by name, email, or confirmation #">
      {/* Search input */}
      <div style={{ display: 'flex', gap: space.sm, marginBottom: space.lg }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Name, email, or confirmation #"
          style={{ flex: 1, padding: `${space.sm}px ${space.md}px`,
            border: `1px solid ${color.cardBorder}`, borderRadius: radius.md,
            fontSize: font.sm, color: color.textDark, backgroundColor: color.bg }} />
        <button onClick={handleSearch} disabled={loading} style={{
          padding: `${space.sm}px ${space.lg}px`, backgroundColor: color.coral,
          color: color.white, border: 'none', borderRadius: radius.md,
          fontSize: font.sm, fontWeight: '600', cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: `${space.xxl}px 0`,
          color: color.textSub, fontSize: font.sm }}>
          Search by name, email address, or confirmation number
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: `${space.xl}px 0`,
          color: color.textSub, fontSize: font.sm }}>
          No orders found for "{query}"
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {results.map((order) => (
          <OrderCard key={order.id} order={order}
            expanded={expanded === order.id}
            onToggle={() => setExpanded(expanded === order.id ? null : order.id)} />
        ))}
      </div>
    </OpsScreen>
  );
}

function OrderCard({ order, expanded, onToggle }) {
  const statusColors = {
    Completed: { bg: '#E6F7EC', text: color.green },
    Pending:   { bg: color.amberLight, text: color.amber },
    Refunded:  { bg: '#FFE9E9', text: color.danger },
  };
  const sc = statusColors[order.order_status] || statusColors.Pending;

  return (
    <div style={{ ...cardStyle, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', padding: `${space.md}px ${space.lg}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: font.base, fontWeight: '700', color: color.textDark }}>
              {order.name_on_order}
            </div>
            <div style={{ fontSize: font.xs, color: color.textSub }}>{order.order_email}</div>
            <div style={{ fontSize: font.xs, color: color.textSub, fontFamily: 'monospace',
              marginTop: 2 }}>
              #{order.confirmation_number}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: font.xs, fontWeight: '600', padding: '2px 8px',
              borderRadius: radius.pill, backgroundColor: sc.bg, color: sc.text }}>
              {order.order_status}
            </span>
            <span style={{ fontSize: font.xs, color: color.textMid, fontWeight: '600' }}>
              {order.total_paid.display}
            </span>
            <span style={{ color: color.textLight, fontSize: 10 }}>{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${color.cardBorder}`,
          padding: `${space.md}px ${space.lg}px` }}>
          {/* Order meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: space.sm, marginBottom: space.md }}>
            {[
              { l: 'Event', v: order.event_name },
              { l: 'Sale Date', v: formatDateTime(order.sale_date) },
              { l: 'Payment', v: order.payment_method },
              { l: 'Delivery', v: order.delivery_type },
              { l: 'Capture', v: order.capture_method },
              { l: 'Source Tag', v: order.sale_tag || '—' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontSize: font.xs, color: color.textSub }}>{l}</div>
                <div style={{ fontSize: font.xs, fontWeight: '600', color: color.textDark }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Tickets */}
          <div style={{ fontSize: font.xs, color: color.textSub, fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: space.xs }}>
            Tickets ({order.tickets.length})
          </div>
          {order.tickets.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between',
              padding: `${space.xs}px 0`, borderBottom: `1px solid ${color.cardBorder}`,
              fontSize: font.xs }}>
              <span style={{ color: color.textMid }}>
                {t.price_level_name} · {t.id}
              </span>
              <div style={{ display: 'flex', gap: space.sm, alignItems: 'center' }}>
                <span style={{ color: color.textDark, fontWeight: '600' }}>
                  {t.cost.display}
                </span>
                <span style={{
                  padding: '1px 6px', borderRadius: radius.pill,
                  backgroundColor: t.ticket_status === 'Live' ? '#E6F7EC' : '#FFE9E9',
                  color: t.ticket_status === 'Live' ? color.green : color.danger,
                  fontWeight: '600', fontSize: 8,
                }}>
                  {t.ticket_status}
                </span>
              </div>
            </div>
          ))}

          {/* Poll answers */}
          {order.answers?.length > 0 && (
            <>
              <div style={{ fontSize: font.xs, color: color.textSub, fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginTop: space.md, marginBottom: space.xs }}>
                Survey Responses
              </div>
              {order.answers.map((a, i) => (
                <div key={i} style={{ fontSize: font.xs, color: color.textMid, padding: '2px 0' }}>
                  <span style={{ color: color.textSub }}>{a.question_name}: </span>
                  <span style={{ fontWeight: '600', color: color.textDark }}>{a.answer}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared mini components ───────────────────────────────────
function Tag({ label }) {
  return (
    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: radius.sm,
      backgroundColor: color.bg, color: color.textSub,
      border: `1px solid ${color.cardBorder}` }}>
      {label}
    </span>
  );
}

function EditForm({ draft, onChange, onSave, onCancel, fields }) {
  return (
    <div style={{ borderTop: `1px solid ${color.cardBorder}`,
      backgroundColor: color.bg, padding: `${space.md}px ${space.lg}px` }}>
      {fields.map((f) => (
        <div key={f.key} style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: `${space.xs}px 0` }}>
          <label style={{ fontSize: font.xs, color: color.textMid }}>{f.label}</label>
          {f.type === 'toggle' ? (
            <button onClick={() => onChange((p) => ({ ...p, [f.key]: !p[f.key] }))}
              style={{ padding: '4px 12px', borderRadius: radius.pill,
                backgroundColor: draft[f.key] ? color.purple : color.bg,
                color: draft[f.key] ? color.white : color.textMid,
                border: `1px solid ${draft[f.key] ? color.purple : color.cardBorder}`,
                fontSize: font.xs, fontWeight: '600', cursor: 'pointer' }}>
              {draft[f.key] ? 'On' : 'Off'}
            </button>
          ) : (
            <input type={f.type || 'text'} value={draft[f.key] ?? ''}
              onChange={(e) => onChange((p) => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: 80, padding: '4px 8px', border: `1px solid ${color.cardBorder}`,
                borderRadius: radius.sm, fontSize: font.xs, textAlign: 'right' }} />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: space.sm, marginTop: space.sm }}>
        <button onClick={onSave} style={{ flex: 1, padding: '6px',
          backgroundColor: color.purple, color: color.white, border: 'none',
          borderRadius: radius.md, fontSize: font.xs, fontWeight: '600', cursor: 'pointer' }}>
          Save
        </button>
        <button onClick={onCancel} style={{ flex: 1, padding: '6px',
          backgroundColor: color.bg, color: color.textMid,
          border: `1px solid ${color.cardBorder}`,
          borderRadius: radius.md, fontSize: font.xs, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function CreatePriceLevelSheet({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', price: '', inventory: '', online_hide: false, bo_hide: false
  });
  function field(k) { return (e) => setForm((p) => ({ ...p, [k]: e.target.value })); }

  return (
    <Sheet title="New Price Level" onClose={onClose}
      onSave={() => onSave({
        name: form.name,
        price: { amount: Math.round(parseFloat(form.price) * 100),
          display: `$${form.price}`, currency: 'USD' },
        service_fee: { amount: 0, display: '$0.00', currency: 'USD' },
        inventory: parseInt(form.inventory),
        sold: 0, remaining: parseInt(form.inventory),
        active: true, online_hide: form.online_hide, bo_hide: form.bo_hide,
        status: 'active',
      })}>
      <FormField label="Name" value={form.name} onChange={field('name')} placeholder="e.g. Tier 2" />
      <FormField label="Price ($)" value={form.price} onChange={field('price')}
        type="number" placeholder="25.00" />
      <FormField label="Inventory" value={form.inventory} onChange={field('inventory')}
        type="number" placeholder="200" />
    </Sheet>
  );
}

function CreateBundleSheet({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', inventory: '' });
  function field(k) { return (e) => setForm((p) => ({ ...p, [k]: e.target.value })); }
  return (
    <Sheet title="New Bundle" onClose={onClose}
      onSave={() => onSave({
        name: form.name, description: form.description,
        price: { amount: Math.round(parseFloat(form.price) * 100),
          display: `$${form.price}`, currency: 'USD' },
        service_fee: { amount: 0, display: '$0.00', currency: 'USD' },
        inventory: parseInt(form.inventory),
        sold: 0, remaining: parseInt(form.inventory),
        active: true, flex: false,
        settings: { online_hide: false, bo_hide: false, transaction_limit: 4 },
      })}>
      <FormField label="Name" value={form.name} onChange={field('name')} placeholder="VIP Package" />
      <FormField label="Description" value={form.description} onChange={field('description')}
        placeholder="What's included?" />
      <FormField label="Price ($)" value={form.price} onChange={field('price')}
        type="number" placeholder="95.00" />
      <FormField label="Inventory" value={form.inventory} onChange={field('inventory')}
        type="number" placeholder="100" />
    </Sheet>
  );
}

function Sheet({ title, onClose, onSave, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: color.overlay,
      zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', backgroundColor: color.card,
        borderRadius: `${radius.xl}px ${radius.xl}px 0 0`, padding: space.xl,
        maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: space.lg }}>
          <h2 style={{ fontSize: font.base, fontWeight: '700', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            fontSize: font.base, cursor: 'pointer', color: color.textLight }}>✕</button>
        </div>
        {children}
        <button onClick={onSave} style={{ width: '100%', marginTop: space.lg, padding: space.md,
          backgroundColor: color.purple, color: color.white, border: 'none',
          borderRadius: radius.lg, fontSize: font.sm, fontWeight: '600', cursor: 'pointer' }}>
          Create
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: space.md }}>
      <label style={{ display: 'block', fontSize: font.xs, color: color.textMid,
        fontWeight: '600', marginBottom: space.xs }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', padding: `${space.sm}px ${space.md}px`,
          border: `1px solid ${color.cardBorder}`, borderRadius: radius.md,
          fontSize: font.sm, color: color.textDark, backgroundColor: color.bg,
          boxSizing: 'border-box' }} />
    </div>
  );
}

function formatDateTime(d) {
  return new Date(d).toLocaleDateString('en-US',
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
