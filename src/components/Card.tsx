import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.card,
  },
});
