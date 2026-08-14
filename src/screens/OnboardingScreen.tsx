import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors, radius, spacing, typography } from '../theme/theme';
import type { SchoolLevel } from '../types/models';

const LEVELS: { key: SchoolLevel; label: string }[] = [
  { key: 'vmbo', label: 'VMBO' },
  { key: 'havo', label: 'HAVO' },
  { key: 'vwo', label: 'VWO' },
  { key: 'mbo', label: 'MBO' },
  { key: 'other', label: 'Other' },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<SchoolLevel>('havo');
  const [subjectsText, setSubjectsText] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('15:00');
  const [submitting, setSubmitting] = useState(false);

  const steps = ['name', 'level', 'subjects', 'times'] as const;
  const canContinue =
    (steps[step] === 'name' && name.trim().length > 0) ||
    steps[step] === 'level' ||
    (steps[step] === 'subjects' && subjectsText.trim().length > 0) ||
    steps[step] === 'times';

  const next = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    await completeOnboarding({
      name: name.trim(),
      schoolLevel: level,
      subjects: subjectsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      schoolStartTime: startTime,
      schoolEndTime: endTime,
    });
    setSubmitting(false);
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progressRow} accessibilityLabel={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <View key={s} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>

        {steps[step] === 'name' && (
          <>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>So your dashboard can greet you properly.</Text>
            <TextField placeholder="e.g. Sam" value={name} onChangeText={setName} autoFocus />
          </>
        )}

        {steps[step] === 'level' && (
          <>
            <Text style={styles.title}>What's your school level?</Text>
            <View style={styles.chipRow}>
              {LEVELS.map((l) => (
                <Chip key={l.key} label={l.label} active={level === l.key} onPress={() => setLevel(l.key)} />
              ))}
            </View>
          </>
        )}

        {steps[step] === 'subjects' && (
          <>
            <Text style={styles.title}>Which subjects do you take?</Text>
            <Text style={styles.subtitle}>Separate them with commas.</Text>
            <TextField
              placeholder="Wiskunde, Engels, Geschiedenis, Biologie"
              value={subjectsText}
              onChangeText={setSubjectsText}
              autoFocus
            />
          </>
        )}

        {steps[step] === 'times' && (
          <>
            <Text style={styles.title}>When is your school day?</Text>
            <Text style={styles.subtitle}>This helps the planner fit study sessions around school.</Text>
            <TextField label="School starts" value={startTime} onChangeText={setStartTime} placeholder="08:30" />
            <TextField label="School ends" value={endTime} onChangeText={setEndTime} placeholder="15:00" />
          </>
        )}

        <Button
          label={step < steps.length - 1 ? 'Continue' : "Let's go"}
          onPress={next}
          disabled={!canContinue}
          loading={submitting}
          style={styles.cta}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xl, marginBottom: spacing.lg },
  progressDot: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  cta: { marginTop: spacing.xl },
});
