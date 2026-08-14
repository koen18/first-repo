import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme/theme';
import { subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOOLS: { icon: string; title: string; desc: string; screen: keyof RootStackParamList }[] = [
  { icon: '📝', title: 'Summary', desc: 'Turn your material into a clear summary', screen: 'SummaryTool' },
  { icon: '❓', title: 'Practice test', desc: 'Generate multiple-choice questions', screen: 'QuizTool' },
  { icon: '🧠', title: 'Flashcards', desc: 'Create a deck to drill key terms', screen: 'FlashcardTool' },
];

export function StudyScreen() {
  const navigation = useNavigation<Nav>();
  const { summaries, quizzes, decks, subjects } = useApp();

  return (
    <Screen>
      <Text style={typography.h1}>Study Tools</Text>
      <Text style={styles.subtitle}>Paste your material, get something study-ready in seconds.</Text>

      {TOOLS.map((tool) => (
        <Pressable key={tool.screen} onPress={() => navigation.navigate(tool.screen as never)}>
          <Card style={styles.toolCard}>
            <Text style={styles.toolIcon}>{tool.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>{tool.title}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        </Pressable>
      ))}

      {quizzes.length > 0 && (
        <>
          <Text style={[typography.h3, styles.sectionTitle]}>Your practice tests</Text>
          {quizzes.map((q) => (
            <Pressable key={q.id} onPress={() => navigation.navigate('QuizPlay', { quizId: q.id })}>
              <Card style={styles.listCard}>
                <Text style={styles.listTitle}>{q.title}</Text>
                <Text style={styles.listMeta}>
                  {subjectName(subjects, q.subjectId)} · {q.questions.length} questions
                  {q.lastScore !== null ? ` · last score ${q.lastScore}%` : ''}
                </Text>
              </Card>
            </Pressable>
          ))}
        </>
      )}

      {decks.length > 0 && (
        <>
          <Text style={[typography.h3, styles.sectionTitle]}>Your flashcard decks</Text>
          {decks.map((d) => (
            <Pressable key={d.id} onPress={() => navigation.navigate('DeckReview', { deckId: d.id })}>
              <Card style={styles.listCard}>
                <Text style={styles.listTitle}>{d.title}</Text>
                <Text style={styles.listMeta}>{subjectName(subjects, d.subjectId)} · {d.cards.length} cards</Text>
              </Card>
            </Pressable>
          ))}
        </>
      )}

      {summaries.length > 0 && (
        <>
          <Text style={[typography.h3, styles.sectionTitle]}>Your summaries</Text>
          {summaries.map((s) => (
            <Card key={s.id} style={styles.listCard}>
              <Text style={styles.listTitle}>{s.title}</Text>
              <Text style={styles.listMeta} numberOfLines={2}>{s.content}</Text>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  toolCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  toolIcon: { fontSize: 28 },
  toolDesc: { ...typography.bodyMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textFaint },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  listCard: { marginBottom: spacing.sm },
  listTitle: { ...typography.body, fontWeight: '600' },
  listMeta: { ...typography.caption, marginTop: 4 },
});
