import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDays, format, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { colors, radius, spacing, typography } from '../theme/theme';
import { subjectColor, subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';
import type { Task } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const KIND_ICON: Record<Task['kind'], string> = {
  task: '✅',
  event: '📌',
  study_session: '🧠',
};

export function PlannerScreen() {
  const { tasks, subjects, toggleTask } = useApp();
  const navigation = useNavigation<Nav>();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const dayTasks = tasks
    .filter((t) => isSameDay(parseISO(t.date), selectedDate))
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={typography.h1}>Planner</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTask', { date: format(selectedDate, 'yyyy-MM-dd') })}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.weekNav}>
        <Pressable onPress={() => setWeekStart(addDays(weekStart, -7))}>
          <Text style={styles.weekArrow}>‹</Text>
        </Pressable>
        <Text style={styles.weekLabel}>{format(weekStart, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setWeekStart(addDays(weekStart, 7))}>
          <Text style={styles.weekArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekStrip}>
        {weekDays.map((d) => {
          const selected = isSameDay(d, selectedDate);
          return (
            <Pressable key={d.toISOString()} style={[styles.dayPill, selected && styles.dayPillActive]} onPress={() => setSelectedDate(d)}>
              <Text style={[styles.dayLetter, selected && styles.dayTextActive]}>{format(d, 'EEEEE')}</Text>
              <Text style={[styles.dayNumber, selected && styles.dayTextActive]}>{format(d, 'd')}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={dayTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nothing planned on {format(selectedDate, 'EEEE d MMMM')}.</Text>
        }
        renderItem={({ item }) => {
          const color = subjectColor(subjects.find((s) => s.id === item.subjectId));
          return (
            <Pressable
              style={styles.item}
              onPress={() => navigation.navigate('AddTask', { taskId: item.id })}
              onLongPress={() => toggleTask(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.title}`}
            >
              <View style={[styles.timeCol]}>
                <Text style={styles.time}>{item.time ?? '—'}</Text>
              </View>
              <View style={[styles.itemBar, { backgroundColor: color.fg }]} />
              <Pressable
                style={styles.checkbox}
                onPress={() => toggleTask(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.done }}
                accessibilityLabel={`Mark ${item.title} as ${item.done ? 'not done' : 'done'}`}
              >
                {item.done && <View style={[styles.checkboxDot, { backgroundColor: color.fg }]} />}
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, item.done && styles.itemTitleDone]}>
                  {KIND_ICON[item.kind]} {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {subjectName(subjects, item.subjectId)} · {item.durationMinutes} min
                </Text>
              </View>
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
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  weekArrow: { fontSize: 24, color: colors.primary, paddingHorizontal: spacing.md },
  weekLabel: { ...typography.h3 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm },
  dayPill: { alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: 10, borderRadius: radius.md, gap: 4 },
  dayPillActive: { backgroundColor: colors.primary },
  dayLetter: { ...typography.caption },
  dayNumber: { ...typography.h3, fontSize: 15 },
  dayTextActive: { color: colors.white },
  list: { paddingVertical: spacing.md, paddingBottom: spacing.xxl * 2 },
  emptyText: { ...typography.bodyMuted, textAlign: 'center', marginTop: spacing.xxl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  timeCol: { width: 44 },
  time: { ...typography.caption, fontWeight: '700', color: colors.textMuted },
  itemBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDot: { width: 12, height: 12, borderRadius: 4 },
  itemTitle: { ...typography.body, fontWeight: '600' },
  itemTitleDone: { textDecorationLine: 'line-through', color: colors.textFaint },
  itemMeta: { ...typography.caption, marginTop: 2 },
});
