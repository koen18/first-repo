import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, addDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors, spacing, typography } from '../theme/theme';
import type { RootStackParamList } from '../navigation/types';
import type { ExamDifficulty } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DIFFICULTIES: { key: ExamDifficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

export function AddExamScreen() {
  const navigation = useNavigation<Nav>();
  const { subjects, addExam } = useApp();

  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('medium');
  const [chapters, setChapters] = useState('3');
  const [material, setMaterial] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = topic.trim().length > 0 && subjectId !== null;

  const save = async () => {
    if (!subjectId) return;
    setSaving(true);
    const exam = await addExam({
      subjectId,
      topic: topic.trim(),
      date,
      difficulty,
      chapters: Number(chapters) || 1,
      material: material.trim(),
    });
    setSaving(false);
    navigation.replace('ExamDetail', { examId: exam.id });
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>Add an exam</Text>
      <Text style={styles.subtitle}>I'll turn this into a realistic study schedule on your Planner.</Text>

      <Text style={styles.sectionLabel}>Subject</Text>
      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField label="Topic" placeholder="e.g. Koude Oorlog" value={topic} onChangeText={setTopic} />
      <TextField label="Exam date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />

      <Text style={styles.sectionLabel}>Difficulty</Text>
      <View style={styles.chipRow}>
        {DIFFICULTIES.map((d) => (
          <Chip key={d.key} label={d.label} active={difficulty === d.key} onPress={() => setDifficulty(d.key)} />
        ))}
      </View>

      <TextField label="Number of chapters" keyboardType="number-pad" value={chapters} onChangeText={setChapters} />
      <TextField
        label="Study material (paste text - optional)"
        placeholder="Paste notes, chapter summaries, anything you have..."
        value={material}
        onChangeText={setMaterial}
        multiline
        numberOfLines={6}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
      />

      <Button label="Generate study plan" onPress={save} disabled={!canSave} loading={saving} style={{ marginTop: spacing.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
});
