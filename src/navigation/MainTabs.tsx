import React from 'react';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { CoachScreen } from '../screens/CoachScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { useTheme } from '../theme/ThemeContext';
import { Sidebar } from './Sidebar';

export const DESKTOP_BREAKPOINT = 900;

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: '🏠',
  Planner: '📅',
  Study: '📚',
  Coach: '🤖',
  Progress: '📊',
};

function TabIcon({ name, focused, activeBg }: { name: keyof MainTabParamList; focused: boolean; activeBg: string }) {
  return (
    <View style={[styles.iconPill, focused && { backgroundColor: activeBg }]}>
      <Text style={{ fontSize: 18 }}>{ICONS[name]}</Text>
    </View>
  );
}

export function MainTabs() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <Tab.Navigator
      tabBar={isDesktop ? (props) => <Sidebar {...props} /> : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          height: 68,
          paddingBottom: 12,
          paddingTop: 10,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.surface,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as keyof MainTabParamList} focused={focused} activeBg={colors.primarySoft} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarAccessibilityLabel: 'Dashboard' }} />
      <Tab.Screen name="Planner" component={PlannerScreen} options={{ tabBarAccessibilityLabel: 'Planner' }} />
      <Tab.Screen name="Study" component={StudyScreen} options={{ tabBarAccessibilityLabel: 'Study' }} />
      <Tab.Screen name="Coach" component={CoachScreen} options={{ tabBarAccessibilityLabel: 'Coach' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarAccessibilityLabel: 'Progress' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: { width: 44, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
