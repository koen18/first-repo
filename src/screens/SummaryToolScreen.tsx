import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme/theme';
import { generateSummary } from '../services/ai';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SummaryToolScreen() {
  const navigation = useNavigation<Nav>();
  const { subjects, addSummary } = useApp();
  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSaved(false);
    const summary = await generateSummary(topic || 'My material', material);
    setResult(summary);
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    await addSummary(topic || 'Summary', subjectId, result);
    setSaved(true);
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>📝 Make a summary</Text>
      <Text style={styles.subtitle}>Paste your notes or chapter text and get a structured summary.</Text>

      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField label="Topic" placeholder="e.g. Hoofdstuk 3 - Celbiologie" value={topic} onChangeText={setTopic} />
      <TextField
        label="Material"
        placeholder="Paste the text you want summarized..."
        value={material}
        onChangeText={setMaterial}
        multiline
        numberOfLines={8}
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />

      <Button label="Generate summary" onPress={generate} loading={loading} disabled={!material.trim()} />

      {result && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.resultText}>{result}</Text>
        </Card>
      )}

      {result && (
        <Button
          label={saved ? 'Saved ✓' : 'Save to Study Tools'}
          variant="secondary"
          onPress={save}
          disabled={saved}
          style={{ marginTop: spacing.md }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  resultText: { ...typography.body, lineHeight: 22 },
});
