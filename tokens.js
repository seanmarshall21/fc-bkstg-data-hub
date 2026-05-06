/**
 * tokens.js
 * Design system tokens — matched exactly from UI Kit analysis.
 * All hub components import from here. Never hardcode colors anywhere else.
 */

export const color = {
  // App backgrounds
  bg:          '#F4F4F4',
  card:        '#FCFCFC',
  cardBorder:  '#ECECEC',
  navBg:       '#FCFCFC',
  navBorder:   '#BDBDBD',
  bottomNav:   '#1B112E',

  // Text
  textDark:    '#11181C',
  textMid:     '#555555',
  textLight:   '#979797',
  textSub:     '#A1A1AA',
  white:       '#FFFFFF',

  // Brand / accent
  purple:      '#6144CC',
  purpleLight: '#EEE9FF',
  purpleMid:   '#9B7FE8',
  coral:       '#EF7758',
  coralLight:  '#FFF0EB',
  amber:       '#E8950A',
  amberLight:  '#FFF8EB',

  // Data viz (from FNGRS CRSSD brand)
  lime:        '#B4FF00',
  limeDim:     '#3A4D00',
  limeMid:     '#78C800',
  teal:        '#00CCAA',
  orange:      '#FF8800',
  red:         '#FF4444',
  green:       '#18A349',
  greenLight:  '#E6F7EC',

  // UI surfaces
  separator:   '#E8E8E8',
  overlay:     'rgba(17, 24, 28, 0.5)',
  success:     '#18A349',
  warning:     '#E8950A',
  danger:      '#E03030',
};

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  pill: 99,
};

export const font = {
  xs:   9,
  sm:   10,
  md:   12,
  base: 14,
  lg:   16,
  xl:   20,
  xxl:  24,
  hero: 30,
};

export const space = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

// Reusable style fragments
export const cardStyle = {
  backgroundColor: color.card,
  borderRadius: radius.lg,
  border: `1px solid ${color.cardBorder}`,
};

export const sectionLabelStyle = {
  fontSize: font.xs,
  fontWeight: '600',
  color: color.textLight,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: space.sm,
};

export const chipStyle = (active = false) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: radius.pill,
  fontSize: font.xs,
  fontWeight: '600',
  backgroundColor: active ? color.purpleLight : color.bg,
  color: active ? color.purple : color.textLight,
  border: `1px solid ${active ? color.purple : color.cardBorder}`,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});
