import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { CoachScreen } from '../screens/CoachScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { colors, radius } from '../theme/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: '🏠',
  Planner: '📅',
  Study: '📚',
  Coach: '🤖',
  Progress: '📊',
};

function TabIcon({ name, focused }: { name: keyof MainTabParamList; focused: boolean }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Text style={{ fontSize: 18 }}>{ICONS[name]}</Text>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
          shadowColor: '#14141F',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name as keyof MainTabParamList} focused={focused} />,
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
  iconPill: {
    width: 44,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: colors.primarySoft,
  },
});
