import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, isToday, parseISO, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Chip } from '../components/Chip';
import { colors, spacing, typography } from '../theme/theme';
import { subjectColor, subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { profile, tasks, exams, subjects, progress, toggleTask } = useApp();
  const navigation = useNavigation<Nav>();

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

  return (
    <Screen>
      <Text style={styles.greeting}>{greeting}, {profile.name || 'there'} 👋</Text>
      <Text style={styles.date}>{format(new Date(), 'EEEE d MMMM')}</Text>

      {nextExam && (
        <Card style={[styles.card, styles.examCard]}>
          <Text style={styles.examEyebrow}>NEXT EXAM</Text>
          <Text style={styles.examTitle}>{subjectName(subjects, nextExam.subjectId)} · {nextExam.topic}</Text>
          <Text style={styles.examMeta}>
            {format(parseISO(nextExam.date), 'EEEE d MMMM')} · in {differenceInCalendarDays(parseISO(nextExam.date), new Date())} days
          </Text>
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
            const color = subjectColor(subjects.find((s) => s.id === t.subjectId));
            return (
              <Pressable key={t.id} style={styles.taskRow} onPress={() => toggleTask(t.id)}>
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
              <Pressable key={s.id} style={styles.taskRow} onPress={() => toggleTask(s.id)}>
                <View style={[styles.checkbox, s.done && styles.checkboxDone]}>
                  {s.done && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, s.done && styles.taskTitleDone]}>{s.title}</Text>
                  <Text style={styles.taskMeta}>{s.time} · {s.durationMinutes} min</Text>
                </View>
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
        <QuickAction icon="✅" label="Add task" onPress={() => navigation.navigate('AddTask', undefined)} />
        <QuickAction icon="🎯" label="Add exam" onPress={() => navigation.navigate('AddExam')} />
        <QuickAction icon="📝" label="Make summary" onPress={() => navigation.navigate('SummaryTool')} />
        <QuickAction icon="❓" label="Practice test" onPress={() => navigation.navigate('QuizTool')} />
      </View>
    </Screen>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.h1, marginTop: spacing.sm },
  date: { ...typography.bodyMuted, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  examCard: { backgroundColor: colors.primary },
  examEyebrow: { color: colors.primarySoft, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  examTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: spacing.xs },
  examMeta: { color: colors.primarySoft, marginTop: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  muted: { ...typography.bodyMuted },
  emptyText: { ...typography.bodyMuted, paddingVertical: spacing.sm },
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
  taskTitle: { ...typography.body, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textFaint },
  taskMeta: { ...typography.caption, marginTop: 2 },
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
  quickIcon: { fontSize: 26 },
  quickLabel: { ...typography.label, color: colors.text },
});
