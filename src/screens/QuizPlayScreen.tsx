import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'QuizPlay'>;

export function QuizPlayScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { quizzes, recordQuizAttempt } = useApp();
  const { colors, radius, spacing, typography } = useTheme();
  const styles = getStyles(colors, radius, spacing, typography);
  const quiz = quizzes.find((q) => q.id === route.params.quizId);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <View style={styles.wrap}>
        <Text style={typography.body}>Quiz not found.</Text>
      </View>
    );
  }

  const question = quiz.questions[index];

  const choose = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) setCorrectCount((c) => c + 1);
  };

  const next = async () => {
    if (index + 1 < quiz.questions.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      await recordQuizAttempt(quiz.id, score);
      setFinished(true);
    }
  };

  if (finished) {
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    return (
      <View style={styles.wrap}>
        <View style={styles.resultWrap}>
          <Text style={styles.resultEmoji}>{score >= 70 ? '🎉' : '💪'}</Text>
          <Text style={typography.h1}>{score}%</Text>
          <Text style={styles.resultMeta}>{correctCount} of {quiz.questions.length} correct</Text>
          <Button label="Done" onPress={() => navigation.goBack()} style={{ marginTop: spacing.xl }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.progress}>Question {index + 1} of {quiz.questions.length}</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Card>
          <Text style={styles.question}>{question.question}</Text>
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selected;
            const showState = selected !== null;
            return (
              <Pressable
                key={i}
                onPress={() => choose(i)}
                style={[
                  styles.option,
                  showState && isCorrect && styles.optionCorrect,
                  showState && isSelected && !isCorrect && styles.optionWrong,
                ]}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
          {selected !== null && (
            <Text style={styles.explanation}>{question.explanation}</Text>
          )}
        </Card>
      </ScrollView>
      {selected !== null && (
        <Button label={index + 1 < quiz.questions.length ? 'Next question' : 'Finish'} onPress={next} />
      )}
    </View>
  );
}

function getStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  radius: ReturnType<typeof useTheme>['radius'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography']
) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
    progress: { ...typography.label, marginBottom: spacing.md },
    question: { ...typography.h3, marginBottom: spacing.lg },
    option: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCorrect: { backgroundColor: colors.secondarySoft, borderColor: colors.secondary },
    optionWrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
    optionText: { ...typography.body },
    explanation: { ...typography.bodyMuted, marginTop: spacing.sm, fontStyle: 'italic' },
    resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    resultEmoji: { fontSize: 48, marginBottom: spacing.sm },
    resultMeta: { ...typography.bodyMuted, marginTop: spacing.xs },
  });
}
