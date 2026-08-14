import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseISO, format, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme/theme';
import { subjectColor, subjectName } from '../utils/subjects';

export function ProgressScreen() {
  const { progress, subjects, exams, isCloudMode, signOut } = useApp();

  const upcomingExams = [...exams]
    .filter((e) => differenceInCalendarDays(parseISO(e.date), new Date()) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen>
      <Text style={typography.h1}>Progress</Text>

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

      {isCloudMode && (
        <Button label="Log out" variant="ghost" onPress={signOut} style={{ marginTop: spacing.sm }} />
      )}
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
  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 30, fontWeight: '800', color: colors.primary },
  statTotal: { fontSize: 16, color: colors.textFaint, fontWeight: '600' },
  statLabel: { ...typography.bodyMuted, marginTop: 4 },
  card: { marginBottom: spacing.lg },
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
