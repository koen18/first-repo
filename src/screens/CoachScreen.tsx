import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { colors, radius, spacing, typography } from '../theme/theme';
import type { ChatMessage } from '../types/models';

const SUGGESTIONS = [
  'Leg fotosynthese uit alsof ik 12 ben',
  'Maak 10 oefenvragen over mijn toets',
  'Waar moet ik vandaag voor leren?',
  'Ik heb vrijdag een toets, maak een planning',
];

export function CoachScreen() {
  const { chatMessages, sendChatMessage } = useApp();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput('');
    setSending(true);
    await sendChatMessage(content);
    setSending(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <Text style={styles.header}>🤖 AI Study Coach</Text>

        {chatMessages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Ask me anything about school</Text>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                <Text style={item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
                  {item.content}
                </Text>
              </View>
            )}
          />
        )}

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <TextField
              placeholder="Ask your coach..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send()}
              style={{ marginBottom: 0 }}
            />
          </View>
          <Pressable style={styles.sendBtn} onPress={() => send()} disabled={sending}>
            <Text style={styles.sendBtnText}>{sending ? '…' : '➤'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { ...typography.h2, padding: spacing.lg, paddingBottom: spacing.sm },
  emptyWrap: { flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.h3, marginBottom: spacing.sm, textAlign: 'center' },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  list: { padding: spacing.lg, gap: spacing.sm },
  bubble: { maxWidth: '85%', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  bubbleUser: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleTextUser: { color: colors.white, fontSize: 15, lineHeight: 21 },
  bubbleTextAssistant: { color: colors.text, fontSize: 15, lineHeight: 21 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: colors.white, fontSize: 18 },
});
