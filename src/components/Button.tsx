import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow, spacing, typography } from '../theme/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />
  ) : (
    <Text style={[styles.label, textStyles[variant], size === 'sm' && styles.labelSm]}>
      {icon ? `${icon}  ` : ''}
      {label}
    </Text>
  );

  const sharedProps = {
    onPress,
    disabled: isDisabled,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityState: { disabled: isDisabled, busy: !!loading },
  };

  if (variant === 'primary') {
    return (
      <Pressable
        {...sharedProps}
        style={({ pressed }) => [
          styles.gradientWrap,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, size === 'sm' && styles.sm]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...sharedProps}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradientWrap: {
    borderRadius: radius.pill,
    ...shadow.glow,
  },
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  label: { ...typography.h3, fontSize: 15 },
  labelSm: { fontSize: 13 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.white },
});
