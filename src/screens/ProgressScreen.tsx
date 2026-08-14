import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { parseISO, format, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Chip } from '../components/Chip';
import { colors, spacing, typography } from '../theme/theme';
import { subjectColor, subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STRONG_THRESHOLD = 70;

export function ProgressScreen() {
  const { progress, subjects, exams, quizzes } = useApp();
  const navigation = useNavigation<Nav>();

  const upcomingExams = [...exams]
    .filter((e) => differenceInCalendarDays(parseISO(e.date), new Date()) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const subjectPerformance = useMemo(() => {
    const bySubject = new Map<string, number[]>();
    for (const q of quizzes) {
      if (q.lastScore === null || !q.subjectId) continue;
      const scores = bySubject.get(q.subjectId) ?? [];
      scores.push(q.lastScore);
      bySubject.set(q.subjectId, scores);
    }
    const averaged = Array.from(bySubject.entries()).map(([subjectId, scores]) => ({
      subjectId,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
    return {
      strong: averaged.filter((s) => s.avg >= STRONG_THRESHOLD).sort((a, b) => b.avg - a.avg),
      weak: averaged.filter((s) => s.avg < STRONG_THRESHOLD).sort((a, b) => a.avg - b.avg),
    };
  }, [quizzes]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>Progress</Text>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.statRow}>
        <StatCard value={progress.tasksCompleted} label="Tasks done" total={progress.tasksTotal} />
        <StatCard value={progress.sessionsCompleted} label="Study sessions" total={progress.sessionsTotal} />
      </View>

      <Card style={styles.card}>
        <Text style={typography.h3}>Progress per subject</Text>
        {progress.bySubject.length === 0 && <Text style={styles.emptyText}>No subjects yet.</Text>}
        {progress.bySubject.map((row) => {
          const subject = subjects.find((s) => s.id === row.subjectId);
          const color = subjectColor(subject);
          const pct = row.total ? row.completed / row.total : 0;
          return (
            <View key={row.subjectId} style={styles.subjectRow}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subjectName(subjects, row.subjectId)}</Text>
                <Text style={styles.subjectCount}>{row.completed}/{row.total}</Text>
              </View>
              <ProgressBar progress={pct} color={color.fg} />
            </View>
          );
        })}
      </Card>

      {(subjectPerformance.strong.length > 0 || subjectPerformance.weak.length > 0) && (
        <Card style={styles.card}>
          <Text style={typography.h3}>Strong & weak topics</Text>
          <Text style={styles.insightHint}>Based on your practice test scores per subject</Text>
          {subjectPerformance.strong.length > 0 && (
            <>
              <Text style={styles.insightLabel}>💪 Strong</Text>
              <View style={styles.chipRow}>
                {subjectPerformance.strong.map((s) => (
                  <Chip key={s.subjectId} label={`${subjectName(subjects, s.subjectId)} · ${s.avg}%`} color={{ bg: colors.secondarySoft, fg: colors.secondary }} />
                ))}
              </View>
            </>
          )}
          {subjectPerformance.weak.length > 0 && (
            <>
              <Text style={styles.insightLabel}>🎯 Needs attention</Text>
              <View style={styles.chipRow}>
                {subjectPerformance.weak.map((s) => (
                  <Chip key={s.subjectId} label={`${subjectName(subjects, s.subjectId)} · ${s.avg}%`} color={{ bg: colors.warningSoft, fg: colors.warning }} />
                ))}
              </View>
            </>
          )}
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={typography.h3}>Upcoming exams</Text>
        {upcomingExams.length === 0 && <Text style={styles.emptyText}>No exams scheduled.</Text>}
        {upcomingExams.map((e) => (
          <View key={e.id} style={styles.examRow}>
            <Text style={styles.examTopic}>{subjectName(subjects, e.subjectId)} · {e.topic}</Text>
            <Text style={styles.examDate}>{format(parseISO(e.date), 'd MMM')}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={typography.h3}>Quiz scores</Text>
        {progress.quizScores.length === 0 && <Text style={styles.emptyText}>No practice tests taken yet.</Text>}
        {progress.quizScores.map((q, i) => (
          <View key={i} style={styles.examRow}>
            <Text style={styles.examTopic}>{q.quizTitle}</Text>
            <Text style={[styles.examDate, q.score >= 70 ? styles.scoreGood : styles.scoreLow]}>{q.score}%</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function StatCard({ value, label, total }: { value: number; label: string; total: number }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}<Text style={styles.statTotal}>/{total}</Text></Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  settingsIcon: { fontSize: 18 },
  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 30, fontWeight: '800', color: colors.primary },
  statTotal: { fontSize: 16, color: colors.textFaint, fontWeight: '600' },
  statLabel: { ...typography.bodyMuted, marginTop: 4 },
  card: { marginBottom: spacing.lg },
  insightHint: { ...typography.caption, marginTop: 2, marginBottom: spacing.sm },
  insightLabel: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emptyText: { ...typography.bodyMuted, marginTop: spacing.sm },
  subjectRow: { marginTop: spacing.md },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  subjectName: { ...typography.body, fontWeight: '600' },
  subjectCount: { ...typography.bodyMuted },
  examRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  examTopic: { ...typography.body },
  examDate: { ...typography.bodyMuted, fontWeight: '600' },
  scoreGood: { color: colors.secondary },
  scoreLow: { color: colors.warning },
});
