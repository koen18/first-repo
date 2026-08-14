export const colors = {
  bg: '#F5F6FB',
  surface: '#FFFFFF',
  primary: '#5B3FE0',
  primaryDeep: '#4527C4',
  primarySoft: '#EEEAFF',
  secondary: '#00C88C',
  secondarySoft: '#E1FBF2',
  warning: '#FF9F1C',
  warningSoft: '#FFF0DC',
  danger: '#FF4D6D',
  dangerSoft: '#FFE5EA',
  text: '#14141F',
  textMuted: '#666B80',
  textFaint: '#9AA0B4',
  border: '#EBEDF6',
  white: '#FFFFFF',
};

export const gradients = {
  primary: ['#6C4CF0', '#4527C4'] as const,
  hero: ['#7A5CF5', '#4527C4'] as const,
  warm: ['#FFB84C', '#FF7A45'] as const,
};

export const subjectPalette = [
  { bg: '#EEEAFF', fg: '#5B3FE0' },
  { bg: '#E1FBF2', fg: '#00A377' },
  { bg: '#FFF0DC', fg: '#D97D06' },
  { bg: '#FFE5EA', fg: '#E23358' },
  { bg: '#E3F1FF', fg: '#0F72D1' },
  { bg: '#FBEAFF', fg: '#A62FDB' },
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#14141F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  soft: {
    shadowColor: '#14141F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  glow: {
    shadowColor: '#5B3FE0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 27, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 21, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.2 },
  h3: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textFaint },
  label: { fontSize: 12.5, fontWeight: '700' as const, color: colors.textMuted, letterSpacing: 0.2 },
};
