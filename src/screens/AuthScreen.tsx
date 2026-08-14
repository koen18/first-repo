import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
  const { colors, spacing, typography } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const styles = StyleSheet.create({
    emoji: { fontSize: 40, marginTop: spacing.xxl, marginBottom: spacing.sm },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
    error: { color: colors.danger, marginBottom: spacing.md },
    success: { color: colors.secondary, marginBottom: spacing.md },
  });

  const submit = async () => {
    if (!supabase) return;
    setSubmitting(true);
    setError(null);

    if (mode === 'reset') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
      setSubmitting(false);
      if (resetError) setError(resetError.message);
      else setResetSent(true);
      return;
    }

    const { error: authError } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (authError) setError(authError.message);
    // On success, the onAuthStateChange listener in RootNavigator takes over.
  };

  const canSubmit = mode === 'reset' ? email.trim().length > 3 : email.trim().length > 3 && password.length >= 6;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.emoji}>📚</Text>
        <Text style={typography.h1}>Study Planner</Text>
        <Text style={styles.subtitle}>
          {mode === 'signup' && 'Create your account to get started.'}
          {mode === 'login' && 'Welcome back — log in to continue.'}
          {mode === 'reset' && "We'll email you a link to reset your password."}
        </Text>

        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.com"
        />
        {mode !== 'reset' && (
          <TextField
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resetSent ? <Text style={styles.success}>Check your email for a reset link.</Text> : null}

        <Button
          label={mode === 'signup' ? 'Create account' : mode === 'login' ? 'Log in' : 'Send reset link'}
          onPress={submit}
          disabled={!canSubmit}
          loading={submitting}
        />

        {mode !== 'reset' && (
          <Button
            label={mode === 'signup' ? 'I already have an account' : "I'm new here"}
            variant="ghost"
            onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            style={{ marginTop: spacing.sm }}
          />
        )}
        {mode === 'login' && (
          <Button label="Forgot password?" variant="ghost" size="sm" onPress={() => setMode('reset')} />
        )}
        {mode === 'reset' && (
          <Button label="Back to login" variant="ghost" onPress={() => setMode('login')} style={{ marginTop: spacing.sm }} />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
