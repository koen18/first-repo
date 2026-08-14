import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'DeckReview'>;

export function DeckReviewScreen() {
  const route = useRoute<Route>();
  const { decks } = useApp();
  const { colors, radius, shadow, spacing, typography } = useTheme();
  const styles = StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, alignItems: 'center' },
    progress: { ...typography.label, marginBottom: spacing.lg },
    card: {
      width: '100%',
      minHeight: 260,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      ...shadow.card,
    },
    cardLabel: { ...typography.label, color: colors.primary, marginBottom: spacing.md },
    cardText: { ...typography.h2, textAlign: 'center' },
    tapHint: { ...typography.caption, position: 'absolute', bottom: spacing.lg },
    navRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%', justifyContent: 'center' },
  });

  const deck = decks.find((d) => d.id === route.params.deckId);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!deck) {
    return (
      <View style={styles.wrap}>
        <Text style={typography.body}>Deck not found.</Text>
      </View>
    );
  }

  const card = deck.cards[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.cards.length);
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.cards.length) % deck.cards.length);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.progress}>{index + 1} / {deck.cards.length}</Text>

      <Pressable style={styles.card} onPress={() => setFlipped((f) => !f)}>
        <Text style={styles.cardLabel}>{flipped ? 'ANSWER' : 'QUESTION'}</Text>
        <Text style={styles.cardText}>{flipped ? card.back : card.front}</Text>
        <Text style={styles.tapHint}>Tap to flip</Text>
      </Pressable>

      <View style={styles.navRow}>
        <Button label="‹ Previous" variant="secondary" onPress={prev} size="sm" />
        <Button label="Next ›" onPress={next} size="sm" />
      </View>
    </View>
  );
}
