import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import type { ItemPriority, Task } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddTask'>;

const KINDS: { key: Task['kind']; label: string }[] = [
  { key: 'task', label: '✅ Task' },
  { key: 'event', label: '📌 Event / sport' },
  { key: 'study_session', label: '🧠 Study session' },
];

const PRIORITIES: { key: ItemPriority; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

export function AddTaskScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { subjects, tasks, addTask, updateTask, deleteTask } = useApp();
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing);

  const existing = route.params?.taskId ? tasks.find((t) => t.id === route.params?.taskId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [kind, setKind] = useState<Task['kind']>(existing?.kind ?? 'task');
  const [subjectId, setSubjectId] = useState<string | null>(existing?.subjectId ?? null);
  const [date, setDate] = useState(existing?.date ?? route.params?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(existing?.time ?? '16:00');
  const [duration, setDuration] = useState(String(existing?.durationMinutes ?? 30));
  const [priority, setPriority] = useState<ItemPriority>(existing?.priority ?? 'medium');
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0;

  const save = async () => {
    setSaving(true);
    const payload = {
      title: title.trim(),
      subjectId,
      date,
      time: time.trim() || null,
      durationMinutes: Number(duration) || 30,
      priority,
      kind,
      examId: existing?.examId ?? null,
      notes: existing?.notes ?? null,
    };
    if (existing) {
      await updateTask(existing.id, payload);
    } else {
      await addTask(payload);
    }
    setSaving(false);
    navigation.goBack();
  };

  const remove = async () => {
    if (!existing) return;
    await deleteTask(existing.id);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>{existing ? 'Edit item' : 'Add item'}</Text>

      <Text style={styles.sectionLabel}>Type</Text>
      <View style={styles.chipRow}>
        {KINDS.map((k) => (
          <Chip key={k.key} label={k.label} active={kind === k.key} onPress={() => setKind(k.key)} />
        ))}
      </View>

      <TextField label="Title" placeholder="e.g. Wiskunde huiswerk" value={title} onChangeText={setTitle} autoFocus={!existing} />

      {kind !== 'event' && (
        <>
          <Text style={styles.sectionLabel}>Subject</Text>
          <View style={styles.chipRow}>
            <Chip label="None" active={subjectId === null} onPress={() => setSubjectId(null)} />
            {subjects.map((s) => (
              <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
            ))}
          </View>
        </>
      )}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Time" placeholder="16:00" value={time} onChangeText={setTime} />
        </View>
      </View>

      <TextField
        label="Duration (minutes)"
        keyboardType="number-pad"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.sectionLabel}>Priority</Text>
      <View style={styles.chipRow}>
        {PRIORITIES.map((p) => (
          <Chip key={p.key} label={p.label} active={priority === p.key} onPress={() => setPriority(p.key)} />
        ))}
      </View>

      <Button label={existing ? 'Save changes' : 'Add to planner'} onPress={save} disabled={!canSave} loading={saving} style={{ marginTop: spacing.lg }} />
      {existing && (
        <Button label="Delete" variant="danger" onPress={remove} style={{ marginTop: spacing.md }} />
      )}
    </ScrollView>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors'], spacing: ReturnType<typeof useTheme>['spacing']) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.md },
  });
}
