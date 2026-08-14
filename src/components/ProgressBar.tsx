import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function ProgressBar({ progress, color }: { progress: number; color?: string }) {
  const { colors, radius } = useTheme();
  const pct = Math.max(0, Math.min(1, progress));
  const styles = StyleSheet.create({
    track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill },
  });
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}
