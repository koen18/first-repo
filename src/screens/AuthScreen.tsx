import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme/theme';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: authError } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (authError) setError(authError.message);
    // On success, the onAuthStateChange listener in RootNavigator takes over.
  };

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.emoji}>📚</Text>
        <Text style={typography.h1}>Study Planner</Text>
        <Text style={styles.subtitle}>
          {mode === 'signup' ? 'Create your account to get started.' : 'Welcome back — log in to continue.'}
        </Text>

        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.com"
        />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={mode === 'signup' ? 'Create account' : 'Log in'}
          onPress={submit}
          disabled={!canSubmit}
          loading={submitting}
        />

        <Button
          label={mode === 'signup' ? 'I already have an account' : "I'm new here"}
          variant="ghost"
          onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
          style={{ marginTop: spacing.sm }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 40, marginTop: spacing.xxl, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
});
