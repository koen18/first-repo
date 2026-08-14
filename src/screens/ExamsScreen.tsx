import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { parseISO, format, differenceInCalendarDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { colors, radius, spacing, typography } from '../theme/theme';
import { subjectColor, subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ExamsScreen() {
  const { exams, subjects } = useApp();
  const navigation = useNavigation<Nav>();

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={typography.h1}>Exams</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddExam')}>
          <Text style={styles.addBtnText}>+ Exam</Text>
        </Pressable>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No exams yet. Add one and I'll build a study plan.</Text>}
        renderItem={({ item }) => {
          const color = subjectColor(subjects.find((s) => s.id === item.subjectId));
          const daysLeft = differenceInCalendarDays(parseISO(item.date), new Date());
          return (
            <Pressable onPress={() => navigation.navigate('ExamDetail', { examId: item.id })}>
              <Card style={styles.examCard}>
                <View style={styles.rowBetween}>
                  <Chip label={subjectName(subjects, item.subjectId)} color={color} />
                  <Text style={styles.daysLeft}>{daysLeft >= 0 ? `${daysLeft}d left` : 'past'}</Text>
                </View>
                <Text style={styles.topic}>{item.topic}</Text>
                <Text style={styles.date}>{format(parseISO(item.date), 'EEEE d MMMM')}</Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.pill },
  addBtnText: { color: colors.white, fontWeight: '700' },
  emptyText: { ...typography.bodyMuted, textAlign: 'center', marginTop: spacing.xxl },
  examCard: { marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  daysLeft: { ...typography.label, color: colors.textMuted },
  topic: { ...typography.h3, marginTop: spacing.sm },
  date: { ...typography.bodyMuted, marginTop: 2 },
});
