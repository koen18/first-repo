import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import type { MainTabParamList } from './types';

const ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: '🏠',
  Planner: '📅',
  Study: '📚',
  Coach: '🤖',
  Progress: '📊',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'Home',
  Planner: 'Planner',
  Study: 'Studeren',
  Coach: 'AI Coach',
  Progress: 'Voortgang',
};

export function Sidebar({ state, navigation }: BottomTabBarProps) {
  const { colors, spacing, radius, shadow, typography } = useTheme();
  const { profile } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? 76 : 232;

  const styles = StyleSheet.create({
    wrap: {
      width,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: width,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingVertical: spacing.lg,
      paddingHorizontal: collapsed ? spacing.sm : spacing.md,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'space-between',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xl,
    },
    brand: { fontSize: 20, fontWeight: '800', color: colors.text },
    collapseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 11,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
      marginBottom: 2,
    },
    itemActive: { backgroundColor: colors.primarySoft },
    itemIcon: { fontSize: 18, width: 22, textAlign: 'center' },
    itemLabel: { ...typography.body, fontWeight: '600' },
    itemLabelActive: { color: colors.primary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    footer: { marginTop: 'auto' },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  });

  return (
    <View style={[styles.wrap, shadow.soft]}>
      <View style={styles.brandRow}>
        {!collapsed && <Text style={styles.brand}>📚 Study Planner</Text>}
        <Pressable
          onPress={() => setCollapsed((c) => !c)}
          style={styles.collapseBtn}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Text style={{ fontSize: 14 }}>{collapsed ? '»' : '«'}</Text>
        </Pressable>
      </View>

      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const name = route.name as keyof MainTabParamList;
        return (
          <Pressable
            key={route.key}
            style={[styles.item, focused && styles.itemActive]}
            onPress={() => navigation.navigate(route.name)}
            accessibilityRole="button"
            accessibilityLabel={LABELS[name]}
            accessibilityState={{ selected: focused }}
          >
            <Text style={styles.itemIcon}>{ICONS[name]}</Text>
            {!collapsed && <Text style={[styles.itemLabel, focused && styles.itemLabelActive]}>{LABELS[name]}</Text>}
          </Pressable>
        );
      })}

      <View style={styles.divider} />
      <Pressable
        style={styles.item}
        onPress={() => navigation.getParent()?.navigate('FocusMode', undefined)}
        accessibilityRole="button"
        accessibilityLabel="Focus mode"
      >
        <Text style={styles.itemIcon}>⏱️</Text>
        {!collapsed && <Text style={styles.itemLabel}>Focus</Text>}
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => navigation.getParent()?.navigate('Achievements')}
        accessibilityRole="button"
        accessibilityLabel="Achievements"
      >
        <Text style={styles.itemIcon}>🏆</Text>
        {!collapsed && <Text style={styles.itemLabel}>Prestaties</Text>}
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <Pressable
          style={styles.item}
          onPress={() => navigation.getParent()?.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.itemIcon}>⚙️</Text>
          {!collapsed && <Text style={styles.itemLabel}>Instellingen</Text>}
        </Pressable>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile.name || '?')[0]?.toUpperCase()}</Text>
          </View>
          {!collapsed && <Text style={styles.itemLabel} numberOfLines={1}>{profile.name || 'Student'}</Text>}
        </View>
      </View>
    </View>
  );
}
