import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme/theme';
import type { SchoolLevel } from '../types/models';

const LEVELS: { key: SchoolLevel; label: string }[] = [
  { key: 'vmbo', label: 'VMBO' },
  { key: 'havo', label: 'HAVO' },
  { key: 'vwo', label: 'VWO' },
  { key: 'mbo', label: 'MBO' },
  { key: 'other', label: 'Other' },
];

export function SettingsScreen() {
  const { profile, isDemoMode, isCloudMode, updateProfile, signOut } = useApp();

  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<SchoolLevel>(profile.schoolLevel);
  const [subjectsText, setSubjectsText] = useState(profile.subjects.join(', '));
  const [startTime, setStartTime] = useState(profile.schoolStartTime);
  const [endTime, setEndTime] = useState(profile.schoolEndTime);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await updateProfile({
      name: name.trim(),
      schoolLevel: level,
      subjects: subjectsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      schoolStartTime: startTime,
      schoolEndTime: endTime,
    });
    setSaving(false);
    setSaved(true);
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

      <Button
        label={saved ? 'Saved ✓' : 'Save changes'}
        onPress={save}
        loading={saving}
        disabled={!name.trim()}
        style={{ marginTop: spacing.sm }}
      />

      {isCloudMode && (
        <Button label="Log out" variant="ghost" onPress={signOut} style={{ marginTop: spacing.xl }} />
      )}

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
  sectionLabel: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  footNote: { ...typography.caption, textAlign: 'center', marginTop: spacing.lg },
});
