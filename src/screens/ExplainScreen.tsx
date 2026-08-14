import React, { useState } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { useFormStyles } from '../theme/useFormStyles';
import { explainTopic } from '../services/ai';

export function ExplainScreen() {
  const { subjects, addSummary } = useApp();
  const { spacing, typography } = useTheme();
  const styles = useFormStyles();
  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const explain = async () => {
    setLoading(true);
    setSaved(false);
    const answer = await explainTopic(question);
    setResult(answer);
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    await addSummary(`Explanation: ${question}`, subjectId, result);
    setSaved(true);
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>💡 Explain a chapter or topic</Text>
      <Text style={styles.subtitle}>Ask about anything you're stuck on - I'll break it down simply.</Text>

      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField
        label="What do you want explained?"
        placeholder="e.g. Explain photosynthesis like I'm 12"
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />

      <Button label="Explain it" onPress={explain} loading={loading} disabled={!question.trim()} />

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
