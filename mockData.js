/**
 * mockData.js
 * src/mock/mockData.js
 *
 * Mock data for the Data Hub. Every object here matches the exact shape
 * that dataHubClient.js will return from the real Leap API.
 * Swap VITE_USE_MOCK=false in .env.local to switch to live data.
 *
 * Brands and events are based on real FNGRS CRSSD shows.
 */

// ─────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────
export const MOCK_BRANDS = [
  { slug: 'fngrs-crssd', name: 'FNGRS CRSSD', color: '#B4FF00' },
  { slug: 'led-presents', name: 'LED Presents', color: '#9B7FE8' },
  { slug: 'proper-nye',   name: 'Proper NYE',   color: '#00CCAA' },
  { slug: 'outriders',    name: 'Outriders',    color: '#FF8800' },
];

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
export const MOCK_EVENTS = [
  {
    id: 'evt-001',
    brand: 'fngrs-crssd',
    name: 'Claptone',
    subtitle: 'Phantoms · Escobar',
    venue: 'Fit Social // SD',
    date: '2025-10-17',
    status: 'post_event',
    capacity: 1800,
    leapEventId: '78234',
  },
  {
    id: 'evt-002',
    brand: 'fngrs-crssd',
    name: 'Mark Knight',
    subtitle: '',
    venue: 'EQ // SD',
    date: '2025-11-22',
    status: 'post_event',
    capacity: 500,
    leapEventId: '78890',
  },
  {
    id: 'evt-003',
    brand: 'fngrs-crssd',
    name: 'CESCO + The Librarian',
    subtitle: '',
    venue: 'EQ // SD',
    date: '2026-04-25',
    status: 'on_sale',
    capacity: 500,
    leapEventId: '79102',
  },
  {
    id: 'evt-004',
    brand: 'fngrs-crssd',
    name: 'Matroda',
    subtitle: '',
    venue: 'Beach House // SD',
    date: '2026-06-06',
    status: 'presale',
    capacity: 1800,
    leapEventId: '79344',
  },
  {
    id: 'evt-005',
    brand: 'led-presents',
    name: 'Odd Mob',
    subtitle: 'at Gallagher Square',
    venue: 'Gallagher Square · Petco Park',
    date: '2026-04-19',
    status: 'post_event',
    capacity: 8000,
    leapEventId: '79500',
  },
];

// ─────────────────────────────────────────────────────────────
// TICKET REPORT  (shape from Reporting API · TicketReport)
// ─────────────────────────────────────────────────────────────
export const MOCK_TICKET_REPORTS = {
  'evt-001': {
    event_id:     'evt-001',
    event_name:   'Claptone',
    summary: {
      total_sold:     847,
      online:         827,
      door_sales:      20,
      guest_list:      57,
      capacity:      1800,
      capacity_pct:  0.459,
      total_gross:   13900,
      no_show_count:   61,
      no_show_rate:  0.0738,
      total_attendees: 222,
    },
    tiers: [
      { name: 'Tier 1', price: 15.00, fee_price: 19.25, sold: 50,  gross: 962.50,  pct_of_total: 0.059 },
      { name: 'Tier 2', price: 20.00, fee_price: 25.00, sold: 150, gross: 3750.00, pct_of_total: 0.177 },
      { name: 'Tier 3', price: 25.00, fee_price: 30.75, sold: 250, gross: 7687.50, pct_of_total: 0.295 },
      { name: 'Door',   price: 30.00, fee_price: 30.00, sold: 20,  gross: 600.00,  pct_of_total: 0.024 },
      { name: 'Comp',   price: 0,     fee_price: 0,     sold: 57,  gross: 0,       pct_of_total: 0.067 },
    ],
    timeline: [
      { date: '2025-08-01', count: 123 },
      { date: '2025-08-23', count: 42  },
      { date: '2025-09-01', count: 55  },
      { date: '2025-09-14', count: 96  },
      { date: '2025-10-01', count: 115 },
      { date: '2025-10-13', count: 56  },
      { date: '2025-10-14', count: 52  },
      { date: '2025-10-15', count: 44  },
      { date: '2025-10-16', count: 74  },
      { date: '2025-10-17', count: 170 },
    ],
    tracking_tags: [
      { tag: 'Instagram',   count: 76 },
      { tag: 'Laylo',       count: 60 },
      { tag: 'Ads',         count: 54 },
      { tag: 'CRSSD.com',   count: 36 },
      { tag: 'Venue',       count: 21 },
      { tag: 'RA',          count: 10 },
      { tag: 'Artist',      count:  7 },
      { tag: 'Facebook',    count:  2 },
      { tag: 'Untracked',   count: 511 },
    ],
    cities: [
      { city: 'San Diego',   state: 'CA', count: 404, pct: 0.561 },
      { city: 'Chula Vista', state: 'CA', count:  54, pct: 0.075 },
      { city: 'La Jolla',    state: 'CA', count:  25, pct: 0.035 },
      { city: 'Las Vegas',   state: 'NV', count:  13, pct: 0.018 },
      { city: 'Carlsbad',    state: 'CA', count:  14, pct: 0.019 },
      { city: 'Encinitas',   state: 'CA', count:  13, pct: 0.018 },
      { city: 'Other',       state: '',   count: 243, pct: 0.337 },
    ],
    financials: {
      gross_revenue:    13900.00,
      service_fees:      2080.00,
      net_revenue:      11820.00,
      door_revenue:       600.00,
      comp_value:           0,
      bar_split:          500.00,
      total_revenue:    14400.00,
      total_expenses:    5220.00,
      profit_estimate:   9180.00,
    },
  },

  'evt-002': {
    event_id:   'evt-002',
    event_name: 'Mark Knight',
    summary: {
      total_sold:      514,
      online:          458,
      door_sales:       56,
      guest_list:       19,
      capacity:        500,
      capacity_pct:   1.028,
      total_gross:   18200,
      no_show_count:    57,
      no_show_rate:   0.124,
      total_attendees: 476,
    },
    tiers: [
      { name: 'Tier 1', price: 20, fee_price: 25.00, sold: 100, gross: 2500, pct_of_total: 0.195 },
      { name: 'Tier 2', price: 25, fee_price: 30.75, sold: 150, gross: 4612, pct_of_total: 0.292 },
      { name: 'Tier 3', price: 30, fee_price: 36.50, sold: 200, gross: 7300, pct_of_total: 0.389 },
      { name: 'Door',   price: 35, fee_price: 35.00, sold: 56,  gross: 1960, pct_of_total: 0.109 },
      { name: 'Comp',   price: 0,  fee_price: 0,     sold: 19,  gross: 0,    pct_of_total: 0.037 },
    ],
    timeline: [
      { date: '2025-09-19', count: 28 },
      { date: '2025-09-20', count: 13 },
      { date: '2025-10-01', count: 10 },
      { date: '2025-10-16', count: 32 },
      { date: '2025-11-01', count: 69 },
      { date: '2025-11-17', count: 8  },
      { date: '2025-11-18', count: 16 },
      { date: '2025-11-19', count: 27 },
      { date: '2025-11-20', count: 36 },
      { date: '2025-11-21', count: 38 },
      { date: '2025-11-22', count: 171 },
    ],
    tracking_tags: [
      { tag: 'CRSSD.com',  count: 40 },
      { tag: 'Instagram',  count: 29 },
      { tag: 'Ads',        count: 16 },
      { tag: 'Laylo',      count: 9  },
      { tag: 'Mailchimp',  count: 4  },
      { tag: 'RA',         count: 3  },
      { tag: 'Facebook',   count: 3  },
      { tag: 'Venue',      count: 1  },
      { tag: 'Untracked',  count: 409 },
    ],
    cities: [
      { city: 'San Diego',    state: 'CA', count: 221, pct: 0.483 },
      { city: 'North County', state: 'CA', count: 21,  pct: 0.046 },
      { city: 'Chula Vista',  state: 'CA', count: 33,  pct: 0.072 },
      { city: 'Los Angeles',  state: 'CA', count: 12,  pct: 0.026 },
      { city: 'Anaheim',      state: 'CA', count: 10,  pct: 0.022 },
      { city: 'Other',        state: '',   count: 161, pct: 0.352 },
    ],
    financials: {
      gross_revenue:   18200.00,
      service_fees:     2730.00,
      net_revenue:     15470.00,
      door_revenue:     1960.00,
      comp_value:          0,
      bar_split:         500.00,
      total_revenue:   18700.00,
      total_expenses:   6100.00,
      profit_estimate: 12600.00,
    },
  },

  'evt-004': {
    event_id:   'evt-004',
    event_name: 'Matroda',
    summary: {
      total_sold:     1245,
      online:         1245,
      door_sales:         0,
      guest_list:         0,
      capacity:        1800,
      capacity_pct:   0.692,
      total_gross:   62250,
      no_show_count:      0,
      no_show_rate:       0,
      total_attendees:    0,
    },
    tiers: [
      { name: 'Tier 1', price: 40, fee_price: 48.00, sold: 600, gross: 28800, pct_of_total: 0.482 },
      { name: 'Tier 2', price: 50, fee_price: 59.50, sold: 600, gross: 35700, pct_of_total: 0.482 },
      { name: 'Tier 3', price: 60, fee_price: 71.00, sold: 45,  gross: 3195,  pct_of_total: 0.036 },
    ],
    timeline: [
      { date: '2026-04-01', count: 44  },
      { date: '2026-04-08', count: 180 },
      { date: '2026-04-15', count: 380 },
      { date: '2026-04-22', count: 620 },
      { date: '2026-04-29', count: 890 },
      { date: '2026-05-06', count: 1050 },
      { date: '2026-05-10', count: 1245 },
    ],
    tracking_tags: [
      { tag: 'Instagram',  count: 210 },
      { tag: 'Laylo',      count: 180 },
      { tag: 'Ads',        count: 145 },
      { tag: 'CRSSD.com',  count: 98  },
      { tag: 'RA',         count: 44  },
      { tag: 'Artist',     count: 28  },
      { tag: 'Mailchimp',  count: 22  },
      { tag: 'Facebook',   count: 8   },
      { tag: 'Untracked',  count: 510 },
    ],
    cities: [
      { city: 'San Diego',   state: 'CA', count: 640, pct: 0.514 },
      { city: 'Los Angeles', state: 'CA', count: 188, pct: 0.151 },
      { city: 'Chula Vista', state: 'CA', count: 72,  pct: 0.058 },
      { city: 'Las Vegas',   state: 'NV', count: 58,  pct: 0.047 },
      { city: 'Other',       state: '',   count: 287, pct: 0.230 },
    ],
    financials: {
      gross_revenue:    62250.00,
      service_fees:      9337.50,
      net_revenue:      52912.50,
      door_revenue:          0,
      comp_value:            0,
      bar_split:           500,
      total_revenue:    62750.00,
      total_expenses:   42757.00,
      profit_estimate:  19993.00,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// SCAN LOG  (shape from Reporting API · ScanLogReport)
// ─────────────────────────────────────────────────────────────
export const MOCK_SCAN_LOGS = {
  'evt-001': {
    event_id: 'evt-001',
    total_scanned: 222,
    hourly: [
      { hour: '6:00 PM',  scanned: 3,   door: 67  },
      { hour: '7:00 PM',  scanned: 5,   door: 0   },
      { hour: '8:00 PM',  scanned: 363, door: 11  },
      { hour: '9:00 PM',  scanned: 764, door: 19  },
      { hour: '9:30 PM',  scanned: 766, door: 20  },
    ],
  },
  'evt-002': {
    event_id: 'evt-002',
    total_scanned: 476,
    hourly: [
      { hour: '11:00 PM', scanned: 42,  door: 10 },
      { hour: '12:00 AM', scanned: 325, door: 35 },
      { hour: '1:00 AM',  scanned: 387, door: 45 },
      { hour: '2:00 AM',  scanned: 401, door: 56 },
      { hour: '2:30 AM',  scanned: 401, door: 56 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// POLL RESPONSES  (shape from Sales API · answers array, normalized)
// ─────────────────────────────────────────────────────────────
export const MOCK_POLL_DATA = {
  'evt-001': {
    event_id:  'evt-001',
    question:  'Who do you want to see next?',
    total_responses: 89,
    answers: [
      { answer: 'Dixon',      count: 8, normalized: true  },
      { answer: 'Ben Klock',  count: 5, normalized: true  },
      { answer: 'HAAi',       count: 4, normalized: true  },
      { answer: 'Nina Kraviz',count: 3, normalized: false },
      { answer: 'Jimi Jules', count: 2, normalized: false },
      { answer: 'Trikk',      count: 2, normalized: false },
      { answer: 'Ame',        count: 2, normalized: false },
      { answer: 'Stin',       count: 2, normalized: false },
    ],
    pending_normalization: [
      { raw: 'ben klock',  suggested: 'Ben Klock',  count: 2 },
      { raw: 'Ben Clock',  suggested: 'Ben Klock',  count: 1 },
      { raw: 'nina k',     suggested: 'Nina Kraviz',count: 1 },
    ],
  },
  'evt-002': {
    event_id: 'evt-002',
    question: 'Who do you want to see next?',
    total_responses: 62,
    answers: [
      { answer: 'MK',          count: 4, normalized: false },
      { answer: 'Anotr',       count: 3, normalized: false },
      { answer: 'Black Coffee', count: 3, normalized: true },
      { answer: 'Chris Lake',  count: 3, normalized: false },
      { answer: 'Green Velvet',count: 3, normalized: true  },
      { answer: 'Hot Since 82',count: 3, normalized: false },
      { answer: 'Loco Dice',   count: 2, normalized: false },
      { answer: 'Eli Brown',   count: 2, normalized: false },
    ],
    pending_normalization: [],
  },
};

// ─────────────────────────────────────────────────────────────
// ANNOUNCE METRICS  (from Instagram Graph API — stub for now)
// ─────────────────────────────────────────────────────────────
export const MOCK_ANNOUNCE_METRICS = {
  'evt-001': { likes: 126, comments: 27, shares: 81, opt_ins: 11, reach: 14200 },
  'evt-002': { likes: 98,  comments: 14, shares: 44, opt_ins: 6,  reach: 9800  },
  'evt-004': { likes: 844, comments: 192, shares: 310, opt_ins: 88, reach: 94000 },
};

// ─────────────────────────────────────────────────────────────
// CROSS-EVENT SUMMARY  (used on Data Hub home)
// ─────────────────────────────────────────────────────────────
export const MOCK_BRAND_SUMMARY = {
  'fngrs-crssd': {
    total_events:    5,
    total_tickets:   9551,
    total_revenue:   '~$146k',
    avg_capacity_pct: 0.71,
    top_tag:         'Instagram',
    top_city:        'San Diego',
  },
  'led-presents': {
    total_events:    2,
    total_tickets:   5588,
    total_revenue:   '~$280k',
    avg_capacity_pct: 0.699,
    top_tag:         'Laylo',
    top_city:        'San Diego',
  },
};
