import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: { bg: string; fg: string };
}

export function Chip({ label, active, onPress, color }: ChipProps) {
  const { colors, radius, spacing } = useTheme();
  const bg = color ? color.bg : active ? colors.primary : colors.primarySoft;
  const fg = color ? color.fg : active ? colors.white : colors.primary;

  const styles = StyleSheet.create({
    chip: {
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    label: { fontSize: 12, fontWeight: '600' },
  });

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.chip, { backgroundColor: bg }]}
        accessibilityRole="button"
        accessibilityState={{ selected: !!active }}
        accessibilityLabel={label}
      >
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </Pressable>
    );
  }
  return <Text style={[styles.chip, styles.label, { backgroundColor: bg, color: fg }]}>{label}</Text>;
}
