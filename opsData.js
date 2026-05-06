/**
 * opsData.js
 * src/mock/opsData.js
 *
 * Mock data for the Ops Hub. Mirrors the exact shape returned
 * by the Leap Core API and Coupons API.
 */

// ─────────────────────────────────────────────────────────────
// PRICE LEVELS  (Core API · /price_levels)
// ─────────────────────────────────────────────────────────────
export const MOCK_PRICE_LEVELS = {
  'evt-003': [
    {
      id: 'pl-001', event_id: 'evt-003',
      name: 'Tier 1',
      price:        { amount: 1500, currency: 'USD', display: '$15.00' },
      service_fee:  { amount: 225,  currency: 'USD', display: '$2.25'  },
      bo_price:     { amount: 1500, currency: 'USD', display: '$15.00' },
      inventory: 50, sold: 50, remaining: 0,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-03-01T10:00:00', on_sale_end: null,
      status: 'sold_out',
    },
    {
      id: 'pl-002', event_id: 'evt-003',
      name: 'Tier 2',
      price:        { amount: 2000, currency: 'USD', display: '$20.00' },
      service_fee:  { amount: 300,  currency: 'USD', display: '$3.00'  },
      bo_price:     { amount: 2000, currency: 'USD', display: '$20.00' },
      inventory: 150, sold: 143, remaining: 7,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-03-15T10:00:00', on_sale_end: null,
      status: 'active',
    },
    {
      id: 'pl-003', event_id: 'evt-003',
      name: 'Tier 3',
      price:        { amount: 2500, currency: 'USD', display: '$25.00' },
      service_fee:  { amount: 375,  currency: 'USD', display: '$3.75'  },
      bo_price:     { amount: 2500, currency: 'USD', display: '$25.00' },
      inventory: 250, sold: 154, remaining: 96,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-04-01T10:00:00', on_sale_end: null,
      status: 'active',
    },
    {
      id: 'pl-004', event_id: 'evt-003',
      name: 'Door',
      price:        { amount: 3000, currency: 'USD', display: '$30.00' },
      service_fee:  { amount: 0,    currency: 'USD', display: '$0.00'  },
      bo_price:     { amount: 3000, currency: 'USD', display: '$30.00' },
      inventory: 50, sold: 0, remaining: 50,
      active: true, online_hide: true, bo_hide: false,
      on_sale_start: '2026-04-25T22:00:00', on_sale_end: null,
      status: 'scheduled',
    },
  ],
  'evt-004': [
    {
      id: 'pl-101', event_id: 'evt-004',
      name: 'Tier 1',
      price:        { amount: 4000, currency: 'USD', display: '$40.00' },
      service_fee:  { amount: 600,  currency: 'USD', display: '$6.00'  },
      bo_price:     { amount: 4000, currency: 'USD', display: '$40.00' },
      inventory: 600, sold: 600, remaining: 0,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-04-16T10:00:00', on_sale_end: null,
      status: 'sold_out',
    },
    {
      id: 'pl-102', event_id: 'evt-004',
      name: 'Tier 2',
      price:        { amount: 5000, currency: 'USD', display: '$50.00' },
      service_fee:  { amount: 750,  currency: 'USD', display: '$7.50'  },
      bo_price:     { amount: 5000, currency: 'USD', display: '$50.00' },
      inventory: 600, sold: 600, remaining: 0,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-04-16T10:00:00', on_sale_end: null,
      status: 'sold_out',
    },
    {
      id: 'pl-103', event_id: 'evt-004',
      name: 'Tier 3',
      price:        { amount: 6000, currency: 'USD', display: '$60.00' },
      service_fee:  { amount: 900,  currency: 'USD', display: '$9.00'  },
      bo_price:     { amount: 6000, currency: 'USD', display: '$60.00' },
      inventory: 600, sold: 45, remaining: 555,
      active: true, online_hide: false, bo_hide: false,
      on_sale_start: '2026-05-01T10:00:00', on_sale_end: null,
      status: 'active',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// BUNDLES  (Core API · /bundles)
// ─────────────────────────────────────────────────────────────
export const MOCK_BUNDLES = {
  'evt-004': [
    {
      id: 'bndl-001', event_id: 'evt-004',
      name: 'VIP Experience',
      description: 'Tier 3 GA + Early Entry + Complimentary Drink',
      price:        { amount: 9500, currency: 'USD', display: '$95.00' },
      service_fee:  { amount: 1425, currency: 'USD', display: '$14.25' },
      inventory: 100, sold: 62, remaining: 38,
      active: true,
      flex: false,
      settings: { online_hide: false, bo_hide: false, transaction_limit: 4 },
      price_levels: ['pl-103'],
      status: 'active',
    },
    {
      id: 'bndl-002', event_id: 'evt-004',
      name: 'Flex 2-Pack',
      description: 'Any 2 tickets at a 10% discount',
      price:        { amount: 9000, currency: 'USD', display: '$90.00' },
      service_fee:  { amount: 1350, currency: 'USD', display: '$13.50' },
      inventory: 200, sold: 88, remaining: 112,
      active: true,
      flex: true, flex_minimum: 2, flex_maximum: 2,
      flex_percent_discount: 10,
      settings: { online_hide: false, bo_hide: false, transaction_limit: 1 },
      price_levels: ['pl-101', 'pl-102', 'pl-103'],
      status: 'active',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// COUPONS  (Coupons API · /coupons)
// ─────────────────────────────────────────────────────────────
export const MOCK_COUPONS = [
  {
    id: 'cpn-001',
    name: 'Press & Media',
    type: 'Comp',
    code: 'PRESSCOMP26',
    amount: null, amount_type: null,
    used: 12, limit: 30,
    events: ['evt-003', 'evt-004'],
    valid_start: '2026-03-01', valid_end: '2026-06-07',
    active: true,
  },
  {
    id: 'cpn-002',
    name: 'Early Bird 20% Off',
    type: 'Discount',
    code: 'EARLY20',
    amount: 20, amount_type: 'percentage',
    used: 150, limit: 150,
    events: ['evt-004'],
    valid_start: '2026-04-01', valid_end: '2026-04-15',
    active: false,
    expired: true,
  },
  {
    id: 'cpn-003',
    name: 'Presale Access',
    type: 'Reserved',
    code: 'MATRODAPRE',
    amount: null, amount_type: null,
    used: 600, limit: 600,
    events: ['evt-004'],
    valid_start: '2026-04-14', valid_end: '2026-04-16',
    active: false,
    expired: true,
  },
  {
    id: 'cpn-004',
    name: 'Staff & Crew',
    type: 'Comp',
    code: 'STAFFCOMP',
    amount: null, amount_type: null,
    used: 8, limit: 40,
    events: ['evt-003', 'evt-004'],
    valid_start: '2026-03-01', valid_end: '2026-06-07',
    active: true,
  },
  {
    id: 'cpn-005',
    name: '$10 Flat Discount',
    type: 'Discount',
    code: 'SAVE10',
    amount: 10, amount_type: 'flat',
    used: 34, limit: 100,
    events: ['evt-003'],
    valid_start: '2026-03-15', valid_end: '2026-04-25',
    active: true,
  },
];

// ─────────────────────────────────────────────────────────────
// ORDERS / TICKET LOOKUP  (Sales API · /api/sales)
// ─────────────────────────────────────────────────────────────
export const MOCK_ORDERS = [
  {
    id: 'ord-9001',
    confirmation_number: 'CRSSD-A7K2P',
    event_id: 'evt-003',
    event_name: 'CESCO + The Librarian',
    sale_date: '2026-03-18T14:22:00',
    order_status: 'Completed',
    order_type: 'Standard',
    payment_method: 'Credit Card',
    capture_method: 'Online',
    delivery_type: 'Mobile',
    sale_tag: 'Instagram',
    name_on_order: 'Alex Rivera',
    order_email: 'alex.r@email.com',
    total_paid: { amount: 5000, display: '$50.00' },
    tickets: [
      {
        id: 'tkt-9001a', price_level_name: 'Tier 2',
        ticket_status: 'Live', cost: { display: '$20.00' },
        event_name: 'CESCO + The Librarian',
      },
      {
        id: 'tkt-9001b', price_level_name: 'Tier 2',
        ticket_status: 'Live', cost: { display: '$20.00' },
        event_name: 'CESCO + The Librarian',
      },
    ],
    answers: [{ question_name: 'Who do you want to see next?', answer: 'Matroda' }],
  },
  {
    id: 'ord-9002',
    confirmation_number: 'CRSSD-B2M8Q',
    event_id: 'evt-004',
    event_name: 'Matroda',
    sale_date: '2026-04-16T10:05:22',
    order_status: 'Completed',
    order_type: 'Standard',
    payment_method: 'Credit Card',
    capture_method: 'Online',
    delivery_type: 'Mobile',
    sale_tag: 'Laylo',
    name_on_order: 'Jordan Kim',
    order_email: 'jordan.k@email.com',
    total_paid: { amount: 9600, display: '$96.00' },
    tickets: [
      {
        id: 'tkt-9002a', price_level_name: 'Tier 1',
        ticket_status: 'Live', cost: { display: '$48.00' },
        event_name: 'Matroda',
      },
      {
        id: 'tkt-9002b', price_level_name: 'Tier 1',
        ticket_status: 'Live', cost: { display: '$48.00' },
        event_name: 'Matroda',
      },
    ],
    answers: [],
  },
  {
    id: 'ord-9003',
    confirmation_number: 'CRSSD-C4R9T',
    event_id: 'evt-003',
    event_name: 'CESCO + The Librarian',
    sale_date: '2026-04-10T09:11:00',
    order_status: 'Completed',
    order_type: 'Comp',
    payment_method: 'Comp',
    capture_method: 'Box Office',
    delivery_type: 'Print At Home',
    sale_tag: '',
    name_on_order: 'Morgan Lee',
    order_email: 'morgan.l@email.com',
    total_paid: { amount: 0, display: '$0.00' },
    tickets: [
      {
        id: 'tkt-9003a', price_level_name: 'Comp',
        ticket_status: 'Live', cost: { display: '$0.00' },
        event_name: 'CESCO + The Librarian',
      },
    ],
    answers: [],
  },
];
