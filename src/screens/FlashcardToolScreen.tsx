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
import { generateFlashcards } from '../services/ai';
import type { RootStackParamList } from '../navigation/types';
import type { Flashcard } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FlashcardToolScreen() {
  const navigation = useNavigation<Nav>();
  const { subjects, addDeck } = useApp();
  const { spacing, typography } = useTheme();
  const styles = useFormStyles();
  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await generateFlashcards(topic || 'My material', material);
    setCards(result);
    setLoading(false);
  };

  const save = async () => {
    if (!cards) return;
    const deck = await addDeck(topic || 'Flashcards', subjectId, cards);
    navigation.replace('DeckReview', { deckId: deck.id });
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h2}>🧠 Make flashcards</Text>
      <Text style={styles.subtitle}>I'll turn key terms from your material into a flashcard deck.</Text>

      <View style={styles.chipRow}>
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} active={subjectId === s.id} onPress={() => setSubjectId(s.id)} />
        ))}
      </View>

      <TextField label="Topic" placeholder="e.g. Irregular verbs" value={topic} onChangeText={setTopic} />
      <TextField
        label="Material"
        placeholder="Paste the text or list of terms..."
        value={material}
        onChangeText={setMaterial}
        multiline
        numberOfLines={8}
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />

      <Button label="Generate flashcards" onPress={generate} loading={loading} disabled={!material.trim()} />

      {cards && (
        <>
          <Text style={[typography.h3, { marginTop: spacing.lg }]}>{cards.length} cards ready</Text>
          <Button label="Save & start reviewing" onPress={save} style={{ marginTop: spacing.md }} />
        </>
      )}
    </ScrollView>
  );
}
