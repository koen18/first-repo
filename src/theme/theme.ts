export const colors = {
  bg: '#F7F8FC',
  surface: '#FFFFFF',
  primary: '#6C5CE7',
  primarySoft: '#EFEBFF',
  secondary: '#00B894',
  secondarySoft: '#E3FBF4',
  warning: '#FDA22A',
  warningSoft: '#FFF1DE',
  danger: '#FF5C7A',
  dangerSoft: '#FFE7EC',
  text: '#1A1B25',
  textMuted: '#6B6F82',
  textFaint: '#9DA1B3',
  border: '#ECEEF5',
  white: '#FFFFFF',
};

export const subjectPalette = [
  { bg: '#EFEBFF', fg: '#6C5CE7' },
  { bg: '#E3FBF4', fg: '#00B894' },
  { bg: '#FFF1DE', fg: '#DB8B1B' },
  { bg: '#FFE7EC', fg: '#E23F63' },
  { bg: '#E6F3FF', fg: '#1E88E5' },
  { bg: '#FBEAFF', fg: '#B03FE2' },
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
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#1A1B25',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: '#1A1B25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textFaint },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
};
