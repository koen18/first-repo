import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { useTheme } from '../theme/ThemeContext';
import { useFormStyles } from '../theme/useFormStyles';
import { generateQuiz } from '../services/ai';
import type { RootStackParamList } from '../navigation/types';
import type { QuizQuestion } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function QuizToolScreen() {
  const navigation = useNavigation<Nav>();
  const { subjects, addQuiz } = useApp();
  const { spacing, typography } = useTheme();
  const styles = useFormStyles();
  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [count, setCount] = useState('8');
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const qs = await generateQuiz(topic || 'My material', material, Number(count) || 8);
    setQuestions(qs);
    setLoading(false);
  };

  const startQuiz = async () => {
    if (!questions) return;
    const quiz = await addQuiz(topic || 'Practice test', subjectId, questions);
    navigation.replace('QuizPlay', { quizId: quiz.id });
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>❓ Make a practice test</Text>
      <Text style={styles.subtitle}>I'll generate multiple-choice questions from your material.</Text>

      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField label="Topic" placeholder="e.g. Fotosynthese" value={topic} onChangeText={setTopic} />
      <TextField
        label="Material"
        placeholder="Paste the text to base questions on..."
        value={material}
        onChangeText={setMaterial}
        multiline
        numberOfLines={8}
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />
      <TextField label="Number of questions" keyboardType="number-pad" value={count} onChangeText={setCount} />

      <Button label="Generate questions" onPress={generate} loading={loading} disabled={!material.trim()} />

      {questions && (
        <>
          <Text style={[typography.h3, { marginTop: spacing.lg }]}>{questions.length} questions ready</Text>
          <Button label="Start practice test" onPress={startQuiz} style={{ marginTop: spacing.md }} />
        </>
      )}
    </ScrollView>
  );
}
