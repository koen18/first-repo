import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday, parseISO, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Chip } from '../components/Chip';
import { useTheme } from '../theme/ThemeContext';
import { subjectColor, subjectName } from '../utils/subjects';
import { computeInsight } from '../utils/insights';
import { computeStreak } from '../utils/gamification';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { profile, tasks, exams, subjects, quizzes, progress, toggleTask } = useApp();
  const navigation = useNavigation<Nav>();
  const { colors, gradients, radius, shadow, spacing, typography, subjectPalette } = useTheme();
  const styles = getStyles(colors, spacing, radius, shadow);

  const todayTasks = tasks
    .filter((t) => isToday(parseISO(t.date)) && t.kind !== 'study_session')
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));

  const todaySessions = tasks.filter((t) => isToday(parseISO(t.date)) && t.kind === 'study_session');

  const nextExam = [...exams]
    .filter((e) => differenceInCalendarDays(parseISO(e.date), new Date()) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const pct = progress.tasksTotal ? progress.tasksCompleted / progress.tasksTotal : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const insight = computeInsight(quizzes, subjects);
  const streak = computeStreak(tasks);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {profile.name || 'there'} 👋</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE d MMMM')}</Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsBtn}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {nextExam && (
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, styles.examCard]}>
          <Text style={styles.examEyebrow}>NEXT EXAM</Text>
          <Text style={styles.examTitle}>{subjectName(subjects, nextExam.subjectId)} · {nextExam.topic}</Text>
          <Text style={styles.examMeta}>
            {format(parseISO(nextExam.date), 'EEEE d MMMM')} · in {differenceInCalendarDays(parseISO(nextExam.date), new Date())} days
          </Text>
        </LinearGradient>
      )}

      {insight && (
        <Card style={[styles.card, styles.insightCard]}>
          <Text style={styles.insightEyebrow}>🧠 AI INSIGHT</Text>
          <Text style={styles.insightText}>{insight}</Text>
        </Card>
      )}

      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={typography.h3}>Today's tasks</Text>
          <Text style={styles.muted}>{todayTasks.filter((t) => t.done).length}/{todayTasks.length}</Text>
        </View>
        {todayTasks.length === 0 ? (
          <Text style={styles.emptyText}>Nothing planned for today. Enjoy it, or add something.</Text>
        ) : (
          todayTasks.map((t) => {
            const color = subjectColor(subjects.find((s) => s.id === t.subjectId), subjectPalette);
            return (
              <Pressable
                key={t.id}
                style={styles.taskRow}
                onPress={() => toggleTask(t.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: t.done }}
                accessibilityLabel={t.title}
              >
                <View style={[styles.checkbox, t.done && styles.checkboxDone]}>
                  {t.done && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, t.done && styles.taskTitleDone]}>{t.title}</Text>
                  <Text style={styles.taskMeta}>{t.time ?? 'Any time'} · {subjectName(subjects, t.subjectId)}</Text>
                </View>
                <Chip label={t.kind === 'event' ? '📌' : subjectName(subjects, t.subjectId)[0]} color={color} />
              </Pressable>
            );
          })
        )}
        {todaySessions.length > 0 && (
          <>
            <Text style={[styles.muted, { marginTop: spacing.md }]}>Study sessions today</Text>
            {todaySessions.map((s) => (
              <Pressable
                key={s.id}
                style={styles.taskRow}
                onPress={() => navigation.navigate('FocusMode', { taskId: s.id })}
                accessibilityRole="button"
                accessibilityLabel={`Start focus session: ${s.title}`}
              >
                <View style={[styles.checkbox, s.done && styles.checkboxDone]}>
                  {s.done && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, s.done && styles.taskTitleDone]}>{s.title}</Text>
                  <Text style={styles.taskMeta}>{s.time} · {s.durationMinutes} min</Text>
                </View>
                <Text style={styles.focusIcon}>⏱️</Text>
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={typography.h3}>Progress this week</Text>
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar progress={pct} />
        </View>
        <Text style={styles.muted}>{progress.tasksCompleted} of {progress.tasksTotal} tasks completed</Text>
      </Card>

      <Text style={[typography.h3, styles.sectionTitle]}>Quick actions</Text>
      <View style={styles.quickGrid}>
        <QuickAction icon="✅" bg={colors.secondarySoft} label="Add task" styles={styles} onPress={() => navigation.navigate('AddTask', undefined)} />
        <QuickAction icon="🎯" bg={colors.dangerSoft} label="Add exam" styles={styles} onPress={() => navigation.navigate('AddExam')} />
        <QuickAction icon="📝" bg={colors.primarySoft} label="Make summary" styles={styles} onPress={() => navigation.navigate('SummaryTool')} />
        <QuickAction icon="⏱️" bg={colors.warningSoft} label="Focus mode" styles={styles} onPress={() => navigation.navigate('FocusMode', undefined)} />
      </View>
    </Screen>
  );
}

function QuickAction({
  icon,
  bg,
  label,
  onPress,
  styles,
}: {
  icon: string;
  bg: string;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.quickIconCircle, { backgroundColor: bg }]}>
        <Text style={styles.quickIcon}>{icon}</Text>
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function getStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  radius: ReturnType<typeof useTheme>['radius'],
  shadow: ReturnType<typeof useTheme>['shadow']
) {
  return StyleSheet.create({
    greeting: { fontSize: 27, fontWeight: '800', letterSpacing: -0.4, color: colors.text, marginTop: spacing.sm, flexShrink: 1 },
    date: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    streakPill: { backgroundColor: colors.warningSoft, paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.pill },
    streakText: { fontWeight: '700', color: colors.warning, fontSize: 13 },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      ...shadow.soft,
    },
    settingsIcon: { fontSize: 18 },
    card: { marginBottom: spacing.lg },
    examCard: { borderRadius: radius.md, padding: spacing.lg, ...shadow.glow },
    examEyebrow: { color: colors.primarySoft, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    examTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: spacing.xs },
    examMeta: { color: colors.primarySoft, marginTop: spacing.xs },
    insightCard: { backgroundColor: colors.primarySoft },
    insightEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.primary, marginBottom: spacing.xs },
    insightText: { fontSize: 14, color: colors.text, lineHeight: 20 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    muted: { fontSize: 14, color: colors.textMuted },
    emptyText: { fontSize: 14, color: colors.textMuted, paddingVertical: spacing.sm },
    taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxDone: { backgroundColor: colors.secondary, borderColor: colors.secondary },
    checkMark: { color: colors.white, fontSize: 14, fontWeight: '700' },
    focusIcon: { fontSize: 16 },
    taskTitle: { fontSize: 15, color: colors.text, fontWeight: '600' },
    taskTitleDone: { textDecorationLine: 'line-through', color: colors.textFaint },
    taskMeta: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
    sectionTitle: { marginBottom: spacing.md },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    quickAction: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      gap: spacing.xs,
    },
    quickIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    quickIcon: { fontSize: 22 },
    quickLabel: { fontSize: 12.5, fontWeight: '700', color: colors.text },
  });
}
