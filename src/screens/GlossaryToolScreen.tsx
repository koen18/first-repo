import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme/theme';
import { generateGlossary } from '../services/ai';

export function GlossaryToolScreen() {
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
    const glossary = await generateGlossary(topic || 'My material', material);
    setResult(glossary);
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    await addSummary(`Glossary: ${topic || 'Terms'}`, subjectId, result);
    setSaved(true);
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>📖 Make a glossary</Text>
      <Text style={styles.subtitle}>Paste your material and get the key terms with clear definitions.</Text>

      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField label="Topic" placeholder="e.g. Hoofdstuk 3 - Celbiologie" value={topic} onChangeText={setTopic} />
      <TextField
        label="Material"
        placeholder="Paste the text with terms you want defined..."
        value={material}
        onChangeText={setMaterial}
        multiline
        numberOfLines={8}
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />

      <Button label="Generate glossary" onPress={generate} loading={loading} disabled={!material.trim()} />

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
