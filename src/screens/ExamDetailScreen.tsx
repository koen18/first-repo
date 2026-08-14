import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { parseISO, format, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { subjectColor, subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ExamDetail'>;

export function ExamDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { exams, tasks, subjects, toggleTask, replanExam } = useApp();
  const { colors, spacing, typography, subjectPalette } = useTheme();
  const styles = getStyles(colors, spacing);
  const [replanning, setReplanning] = useState(false);

  const exam = exams.find((e) => e.id === route.params.examId);
  if (!exam) {
    return (
      <Screen>
        <Text style={typography.body}>Exam not found.</Text>
      </Screen>
    );
  }

  const sessions = tasks
    .filter((t) => t.examId === exam.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const color = subjectColor(subjects.find((s) => s.id === exam.subjectId), subjectPalette);
  const daysLeft = differenceInCalendarDays(parseISO(exam.date), new Date());
  const missedCount = sessions.filter((s) => !s.done && differenceInCalendarDays(new Date(), parseISO(s.date)) > 0).length;

  const onReplan = async () => {
    setReplanning(true);
    await replanExam(exam.id);
    setReplanning(false);
    Alert.alert('Plan updated', 'Your remaining sessions were rescheduled to fit before the exam.');
  };

  return (
    <Screen>
      <Chip label={subjectName(subjects, exam.subjectId)} color={color} />
      <Text style={[typography.h1, { marginTop: spacing.sm }]}>{exam.topic}</Text>
      <Text style={styles.meta}>
        {format(parseISO(exam.date), 'EEEE d MMMM')} · {daysLeft >= 0 ? `${daysLeft} days left` : 'past'} · {exam.difficulty}
      </Text>

      {missedCount > 0 && (
        <Card style={styles.warnCard}>
          <Text style={styles.warnText}>
            You've fallen behind on {missedCount} session{missedCount > 1 ? 's' : ''}.
          </Text>
          <Button label="Replan remaining sessions" onPress={onReplan} loading={replanning} size="sm" style={{ marginTop: spacing.sm }} />
        </Card>
      )}

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={typography.h3}>Study plan</Text>
        {sessions.map((s) => (
          <View key={s.id} style={styles.sessionRow}>
            <Pressable
              style={[styles.checkbox, s.done && styles.checkboxDone]}
              onPress={() => toggleTask(s.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: s.done }}
              accessibilityLabel={s.title}
            >
              {s.done && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('FocusMode', { taskId: s.id })}
              accessibilityRole="button"
              accessibilityLabel={`Start focus session: ${s.title}`}
            >
              <Text style={[styles.sessionTitle, s.done && styles.sessionTitleDone]}>{s.title}</Text>
              <Text style={styles.sessionMeta}>{format(parseISO(s.date), 'EEE d MMM')} · {s.durationMinutes} min</Text>
            </Pressable>
            {!s.done && <Text style={styles.focusIcon}>⏱️</Text>}
          </View>
        ))}
      </Card>

      {exam.material ? (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={typography.h3}>Study material</Text>
          <Text style={styles.material}>{exam.material}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors'], spacing: ReturnType<typeof useTheme>['spacing']) {
  return StyleSheet.create({
    meta: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
    warnCard: { backgroundColor: colors.warningSoft },
    warnText: { fontSize: 15, color: colors.warning, fontWeight: '600' },
    sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
    checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: colors.secondary, borderColor: colors.secondary },
    checkMark: { color: colors.white, fontSize: 14, fontWeight: '700' },
    focusIcon: { fontSize: 16 },
    sessionTitle: { fontSize: 15, color: colors.text, fontWeight: '600' },
    sessionTitleDone: { textDecorationLine: 'line-through', color: colors.textFaint },
    sessionMeta: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
    material: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  });
}
