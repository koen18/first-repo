import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from './types';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MainTabs } from './MainTabs';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { AddExamScreen } from '../screens/AddExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { ExamDetailScreen } from '../screens/ExamDetailScreen';
import { SummaryToolScreen } from '../screens/SummaryToolScreen';
import { QuizToolScreen } from '../screens/QuizToolScreen';
import { FlashcardToolScreen } from '../screens/FlashcardToolScreen';
import { ExplainScreen } from '../screens/ExplainScreen';
import { GlossaryToolScreen } from '../screens/GlossaryToolScreen';
import { QuizPlayScreen } from '../screens/QuizPlayScreen';
import { DeckReviewScreen } from '../screens/DeckReviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function RootNavigator() {
  const { profile, loading, needsAuth } = useApp();

  if (loading) return <LoadingScreen />;

  if (needsAuth) {
    return (
      <NavigationContainer>
        <AuthScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!profile.onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'modal', headerShown: true, title: '' }} />
            <Stack.Screen name="AddExam" component={AddExamScreen} options={{ presentation: 'modal', headerShown: true, title: '' }} />
            <Stack.Screen name="Exams" component={ExamsScreen} />
            <Stack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="SummaryTool" component={SummaryToolScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="QuizTool" component={QuizToolScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="FlashcardTool" component={FlashcardToolScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="ExplainTool" component={ExplainScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="GlossaryTool" component={GlossaryToolScreen} options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="QuizPlay" component={QuizPlayScreen} options={{ headerShown: true, title: 'Practice test' }} />
            <Stack.Screen name="DeckReview" component={DeckReviewScreen} options={{ headerShown: true, title: 'Flashcards' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: '' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
