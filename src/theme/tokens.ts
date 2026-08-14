export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';
export type AccentKey = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red' | 'teal';

export const ACCENTS: Record<AccentKey, { label: string; primary: string; deep: string; soft: string; softDark: string; gradient: readonly [string, string] }> = {
  purple: { label: 'Purple', primary: '#5B3FE0', deep: '#4527C4', soft: '#EEEAFF', softDark: '#2A2154', gradient: ['#6C4CF0', '#4527C4'] },
  blue: { label: 'Blue', primary: '#0F72D1', deep: '#0B5AA8', soft: '#E3F1FF', softDark: '#123152', gradient: ['#2E97F5', '#0B5AA8'] },
  green: { label: 'Green', primary: '#00A377', deep: '#00805D', soft: '#E1FBF2', softDark: '#0E3A2C', gradient: ['#1FCB99', '#00805D'] },
  orange: { label: 'Orange', primary: '#E27317', deep: '#B85A0E', soft: '#FFF0DC', softDark: '#4A2F10', gradient: ['#FFA84C', '#B85A0E'] },
  pink: { label: 'Pink', primary: '#D6339B', deep: '#AD1E7A', soft: '#FDEAF6', softDark: '#4A1836', gradient: ['#F15CC1', '#AD1E7A'] },
  red: { label: 'Red', primary: '#E23358', deep: '#B81F41', soft: '#FFE5EA', softDark: '#4A1620', gradient: ['#FF6B85', '#B81F41'] },
  teal: { label: 'Teal', primary: '#0E9AA3', deep: '#0B7980', soft: '#E0F7F8', softDark: '#0E3538', gradient: ['#2CC5CE', '#0B7980'] },
};

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

// Font specs only - color is applied separately from the active theme.
export const font = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 27, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 21, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 12.5, fontWeight: '700' as const, letterSpacing: 0.2 },
};

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceRaised: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  white: string;
  shadowColor: string;
}

export function buildColors(scheme: ColorScheme, accentKey: AccentKey): ThemeColors {
  const accent = ACCENTS[accentKey];
  if (scheme === 'dark') {
    return {
      bg: '#0E0E14',
      surface: '#1A1B24',
      surfaceRaised: '#22232E',
      primary: accent.primary,
      primaryDeep: accent.deep,
      primarySoft: accent.softDark,
      secondary: '#22D3A0',
      secondarySoft: '#0E3A2C',
      warning: '#FFB454',
      warningSoft: '#4A2F10',
      danger: '#FF6B85',
      dangerSoft: '#4A1620',
      text: '#F3F4FA',
      textMuted: '#A6ABC2',
      textFaint: '#6B7089',
      border: '#2A2C3A',
      white: '#FFFFFF',
      shadowColor: '#000000',
    };
  }
  return {
    bg: '#F5F6FB',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    primary: accent.primary,
    primaryDeep: accent.deep,
    primarySoft: accent.soft,
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
    shadowColor: '#14141F',
  };
}

export function buildGradients(scheme: ColorScheme, accentKey: AccentKey) {
  const accent = ACCENTS[accentKey];
  return {
    primary: accent.gradient,
    hero: scheme === 'dark' ? ([accent.deep, '#0E0E14'] as const) : accent.gradient,
  };
}

export function buildShadow(scheme: ColorScheme, colors: ThemeColors) {
  const opacityScale = scheme === 'dark' ? 1.6 : 1;
  return {
    card: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05 * opacityScale,
      shadowRadius: 20,
      elevation: 3,
    },
    soft: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04 * opacityScale,
      shadowRadius: 8,
      elevation: 1,
    },
    glow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: scheme === 'dark' ? 0.35 : 0.22,
      shadowRadius: 20,
      elevation: 6,
    },
  };
}

export const subjectPalette = [
  { bg: '#EEEAFF', fg: '#5B3FE0' },
  { bg: '#E1FBF2', fg: '#00A377' },
  { bg: '#FFF0DC', fg: '#D97D06' },
  { bg: '#FFE5EA', fg: '#E23358' },
  { bg: '#E3F1FF', fg: '#0F72D1' },
  { bg: '#FBEAFF', fg: '#A62FDB' },
];

export const subjectPaletteDark = [
  { bg: '#2A2154', fg: '#9C8CFF' },
  { bg: '#0E3A2C', fg: '#4FE0B3' },
  { bg: '#4A2F10', fg: '#FFB454' },
  { bg: '#4A1620', fg: '#FF8AA0' },
  { bg: '#123152', fg: '#6CB6FF' },
  { bg: '#3A1B47', fg: '#E29BFF' },
];
