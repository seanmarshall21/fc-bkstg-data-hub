# Data Hub + Ops Hub (Gate Hub)
## BKSTG — Phase 3 Build Package

**Status:** Ready to integrate. All screens functional with mock data.
**Mock toggle:** `VITE_USE_MOCK=true` in `.env.local` (default: true)

---

## File Map

```
src/
  styles/
    tokens.js                       ← Design system tokens. Import from here, never hardcode colors.

  mock/
    mockData.js                     ← All Data Hub mock data (events, ticket reports, scan logs, polls)
    opsData.js                      ← All Ops Hub mock data (price levels, bundles, coupons, orders)

  modules/
    data-hub/
      api/
        dataHubClient.js            ← TOGGLE POINT. Mock vs real API. One env var switches all data.
      auth/
        DataHubAuthContext.jsx      ← Separate auth context (from Phase 1+2)
      components/
        BottomNav.jsx               ← Shared bottom nav — matches app home exactly
      screens/
        DataHubLogin.jsx            ← Login screen at /data-hub/login (from Phase 1+2)
        DataHubHome.jsx             ← Event list, brand filter tabs
        DataHubEventDetail.jsx      ← Per-event widget dashboard with manage/toggle
      widgets/
        WidgetShell.jsx             ← Shared widget wrapper (loading, error, empty states)
        index.jsx                   ← All widgets: TicketSales, Timeline, ScanIn, Tags, Cities, Financial, Poll, Announce

    ops-hub/
      api/
        opsHubClient.js             ← TOGGLE POINT. Mock vs real Leap Core + Coupons API.
      screens/
        OpsHubHome.jsx              ← Landing: event selector + four section cards
        OpsScreens.jsx              ← PriceLevelsView, BundlesView, CouponManagerView, TicketLookupView

  hubRoutes.jsx                     ← Route config + auth guards. Paste into existing <Routes>.
```

---

## Switching from Mock to Live

1. Get Leap API token for the user (via Authentication API)
2. Store encrypted in Supabase `dh_credentials` (see Phase 2 SQL migration)
3. Deploy the `shx-proxy` Netlify function (see Phase 2 handoff)
4. In `.env.local`: set `VITE_USE_MOCK=false`
5. Done. All data flows through the real API. No component changes needed.

The mock data objects in `mockData.js` and `opsData.js` use the exact same shape as
the real API responses. `dataHubClient.js` and `opsHubClient.js` are the only files
that know the difference.

---

## What's Built

### Data Hub

| Screen | Route | Status |
|---|---|---|
| Events List | `/data-hub` | ✅ Built |
| Event Dashboard | `/data-hub/event/:id` | ✅ Built |
| Ticket Lookup | via widget drill-down | 🔜 Stub route |
| Metric Detail | `/data-hub/event/:id/:metric` | 🔜 Stub route |

**Widgets (all on EventDetail):**
- Ticket Sales — hero KPI, capacity bar, door/guest/no-show breakdown
- Purchase Timeline — bar chart, peak day callout
- Scan-In Timeline — dual bars (scanned vs door), hourly
- Tracking Tags — ranked bar list, untracked count
- Customer Cities — donut + ranked list
- Financial Summary — gross, fees, net, profit estimate
- Poll Responses — ranked list + normalization review sheet
- Announce Metrics — social reach/engagement (stub until IG API)

**Widget management:**
- Per-user toggle (on/off per widget, saved to localStorage)
- Tap "Manage" in nav to show toggle strip

### Ops Hub (Gate Hub)

| Screen | Route | Status |
|---|---|---|
| Hub Home | `/ops` | ✅ Built |
| Price Levels | `/ops/price-levels/:eventId` | ✅ Built |
| Bundles | `/ops/bundles/:eventId` | ✅ Built |
| Coupon Manager | `/ops/coupons/:eventId` | ✅ Built |
| Ticket Lookup | `/ops/ticket-lookup/:eventId` | ✅ Built |

**Price Levels:** View all tiers with sold/remaining progress bars, inline edit form (inventory, visibility toggles), create new price level sheet.

**Bundles:** View all bundles with sold/remaining, flex bundle details, create new bundle sheet.

**Coupon Manager:** Code validator (type + confirm number = valid/invalid), active coupon list with type badge, expired section. Supports Discount, Comp, Reserved, Access types.

**Ticket Lookup:** Search by name, email, or confirmation number. Expandable order cards showing all tickets, payment method, sale tag, and poll/survey answers per order.

---

## Integration Notes

- All screens import from `../../../styles/tokens` for colors/spacing — consistent with existing app
- `BottomNav.jsx` matches the exact nav from the app home screenshot
- Auth guards (`DataHubGuard`, `OpsGuard`) in `hubRoutes.jsx` use `DataHubAuthContext` — separate from existing WP auth
- No existing files are modified. All routes are additive.
- Event selector in Ops Hub uses `fetchEvents` from `dataHubClient` — same data layer, no duplication

---

## .env.local additions needed

```
VITE_USE_MOCK=true          # set false when real API is ready
VITE_SUPABASE_URL=...       # already in project for existing auth
VITE_SUPABASE_ANON_KEY=...  # already in project
```
