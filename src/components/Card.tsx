import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Card({ style, ...props }: ViewProps) {
  const { colors, radius, shadow, spacing } = useTheme();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      ...shadow.card,
    },
  });
  return <View style={[styles.card, style]} {...props} />;
}
