import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme/theme';
import type { SchoolLevel } from '../types/models';
import { scheduleDailyReminder, cancelDailyReminder } from '../services/notifications';

const LEVELS: { key: SchoolLevel; label: string }[] = [
  { key: 'vmbo', label: 'VMBO' },
  { key: 'havo', label: 'HAVO' },
  { key: 'vwo', label: 'VWO' },
  { key: 'mbo', label: 'MBO' },
  { key: 'other', label: 'Other' },
];

const STUDY_BUDGETS = [60, 90, 120, 180];

export function SettingsScreen() {
  const { profile, isDemoMode, isCloudMode, updateProfile, signOut, resetLocalData } = useApp();

  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<SchoolLevel>(profile.schoolLevel);
  const [subjectsText, setSubjectsText] = useState(profile.subjects.join(', '));
  const [startTime, setStartTime] = useState(profile.schoolStartTime);
  const [endTime, setEndTime] = useState(profile.schoolEndTime);
  const [dailyBudget, setDailyBudget] = useState(profile.dailyStudyBudgetMinutes);
  const [remindersEnabled, setRemindersEnabled] = useState(profile.remindersEnabled);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setReminderError(null);

    if (remindersEnabled) {
      const ok = await scheduleDailyReminder(reminderTime);
      if (!ok) {
        setReminderError('Notification permission was denied, so reminders were turned back off.');
      }
      if (!ok) setRemindersEnabled(false);
    } else {
      await cancelDailyReminder();
    }

    await updateProfile({
      name: name.trim(),
      schoolLevel: level,
      subjects: subjectsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      schoolStartTime: startTime,
      schoolEndTime: endTime,
      dailyStudyBudgetMinutes: dailyBudget,
      remindersEnabled,
      reminderTime,
    });
    setSaving(false);
    setSaved(true);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset local data?',
      'This clears everything on this device and reloads the starting demo data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetLocalData },
      ]
    );
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h1}>Settings</Text>

      <Card style={styles.modeCard}>
        <Text style={styles.modeLabel}>{isCloudMode ? '☁️ Cloud account' : '📱 Local demo mode'}</Text>
        <Text style={styles.modeDesc}>
          {isCloudMode
            ? 'Your data syncs to your account and is only visible to you.'
            : 'Running with mock AI and on-device data only. Connect Supabase (see README) to make this a real account.'}
        </Text>
      </Card>

      <Text style={styles.sectionHeading}>Profile</Text>
      <Text style={styles.sectionLabel}>Name</Text>
      <TextField value={name} onChangeText={setName} placeholder="Your name" />

      <Text style={styles.sectionLabel}>School level</Text>
      <View style={styles.chipRow}>
        {LEVELS.map((l) => (
          <Chip key={l.key} label={l.label} active={level === l.key} onPress={() => setLevel(l.key)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Subjects</Text>
      <TextField
        value={subjectsText}
        onChangeText={setSubjectsText}
        placeholder="Wiskunde, Engels, Geschiedenis"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="School starts" value={startTime} onChangeText={setStartTime} placeholder="08:30" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="School ends" value={endTime} onChangeText={setEndTime} placeholder="15:00" />
        </View>
      </View>

      <Text style={styles.sectionHeading}>Study planning</Text>
      <Text style={styles.sectionLabel}>Max homework/study time per day before the planner avoids that day</Text>
      <View style={styles.chipRow}>
        {STUDY_BUDGETS.map((m) => (
          <Chip key={m} label={`${m} min`} active={dailyBudget === m} onPress={() => setDailyBudget(m)} />
        ))}
      </View>

      <Text style={styles.sectionHeading}>Reminders</Text>
      <Card style={styles.reminderCard}>
        <View style={styles.reminderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderTitle}>Daily study reminder</Text>
            <Text style={styles.modeDesc}>A local notification, sent only to this device.</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityLabel="Daily study reminder"
          />
        </View>
        {remindersEnabled && (
          <TextField
            label="Reminder time"
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="16:00"
            style={{ marginTop: spacing.sm }}
          />
        )}
        {reminderError && <Text style={styles.errorText}>{reminderError}</Text>}
      </Card>

      <Button
        label={saved ? 'Saved ✓' : 'Save changes'}
        onPress={save}
        loading={saving}
        disabled={!name.trim()}
        style={{ marginTop: spacing.lg }}
      />

      <Text style={styles.sectionHeading}>Data</Text>
      {isDemoMode && (
        <Button label="Reset local data" variant="danger" onPress={confirmReset} style={{ marginBottom: spacing.md }} />
      )}
      {isCloudMode && (
        <Button label="Log out" variant="ghost" onPress={signOut} />
      )}

      <Text style={styles.sectionHeading}>About</Text>
      <Card>
        <Text style={styles.aboutTitle}>AI Study Planner</Text>
        <Text style={styles.modeDesc}>Version 1.0.0</Text>
        <Text style={[styles.modeDesc, { marginTop: spacing.xs }]}>
          Planner, AI coach, and study tools for students - built with Expo, Supabase, and OpenAI.
        </Text>
      </Card>

      {isDemoMode && (
        <Text style={styles.footNote}>
          Demo data lives only on this device. See the README for the steps to connect a real backend.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  modeCard: { marginTop: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.primarySoft },
  modeLabel: { ...typography.h3, marginBottom: spacing.xs },
  modeDesc: { ...typography.bodyMuted },
  sectionHeading: { ...typography.h3, marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionLabel: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  reminderCard: { marginBottom: spacing.sm },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reminderTitle: { ...typography.body, fontWeight: '600' },
  errorText: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
  aboutTitle: { ...typography.h3, marginBottom: spacing.xs },
  footNote: { ...typography.caption, textAlign: 'center', marginTop: spacing.lg },
});
