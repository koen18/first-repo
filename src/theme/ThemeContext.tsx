import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACCENTS,
  buildColors,
  buildGradients,
  buildShadow,
  subjectPalette,
  subjectPaletteDark,
  spacing,
  radius,
  font,
  type AccentKey,
  type ColorScheme,
  type ThemeMode,
} from './tokens';

const STORAGE_KEY = 'aisp:v1:theme';

interface ThemePreference {
  mode: ThemeMode;
  accent: AccentKey;
}

type Typography = Record<keyof typeof font, { fontSize: number; fontWeight: '400' | '500' | '600' | '700' | '800'; letterSpacing?: number; color: string }>;

interface ThemeContextValue {
  mode: ThemeMode;
  scheme: ColorScheme;
  accent: AccentKey;
  colors: ReturnType<typeof buildColors>;
  gradients: ReturnType<typeof buildGradients>;
  shadow: ReturnType<typeof buildShadow>;
  subjectPalette: typeof subjectPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof font;
  typography: Typography;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  accents: typeof ACCENTS;
}

function buildTypography(colors: ReturnType<typeof buildColors>): Typography {
  return {
    display: { ...font.display, color: colors.text },
    h1: { ...font.h1, color: colors.text },
    h2: { ...font.h2, color: colors.text },
    h3: { ...font.h3, color: colors.text },
    body: { ...font.body, color: colors.text },
    bodyMuted: { ...font.bodyMuted, color: colors.textMuted },
    caption: { ...font.caption, color: colors.textFaint },
    label: { ...font.label, color: colors.textMuted },
  };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [accent, setAccentState] = useState<AccentKey>('purple');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const pref = JSON.parse(raw) as ThemePreference;
          if (pref.mode) setModeState(pref.mode);
          if (pref.accent) setAccentState(pref.accent);
        } catch {
          // ignore malformed stored preference, keep defaults
        }
      }
    })();
  }, []);

  const persist = useCallback((next: ThemePreference) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      persist({ mode: next, accent });
    },
    [accent, persist]
  );

  const setAccent = useCallback(
    (next: AccentKey) => {
      setAccentState(next);
      persist({ mode, accent: next });
    },
    [mode, persist]
  );

  const scheme: ColorScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeContextValue>(() => {
    const colors = buildColors(scheme, accent);
    return {
      mode,
      scheme,
      accent,
      colors,
      gradients: buildGradients(scheme, accent),
      shadow: buildShadow(scheme, colors),
      subjectPalette: scheme === 'dark' ? subjectPaletteDark : subjectPalette,
      spacing,
      radius,
      font,
      typography: buildTypography(colors),
      setMode,
      setAccent,
      accents: ACCENTS,
    };
  }, [mode, scheme, accent, setMode, setAccent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
