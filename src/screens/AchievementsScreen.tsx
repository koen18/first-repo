import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { computeStreak, computeXp, levelFromXp, computeAchievements } from '../utils/gamification';

export function AchievementsScreen() {
  const { tasks, quizzes, decks } = useApp();
  const { colors, spacing, radius, typography } = useTheme();

  const streak = computeStreak(tasks);
  const xp = computeXp(tasks, quizzes);
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(xp);
  const achievements = computeAchievements(tasks, quizzes, decks, streak);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const styles = StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
    statCard: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 26, fontWeight: '800', color: colors.primary },
    statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    levelCard: { marginBottom: spacing.lg },
    levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    levelLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    xpLabel: { fontSize: 13, color: colors.textMuted },
    sectionTitle: { marginTop: spacing.md, marginBottom: spacing.md },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    badge: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      alignItems: 'center',
      opacity: 1,
    },
    badgeLocked: { opacity: 0.4 },
    badgeIcon: { fontSize: 32, marginBottom: spacing.sm },
    badgeTitle: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center' },
    badgeDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  });

  return (
    <Screen>
      <Text style={typography.h1}>🏆 Prestaties</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{unlockedCount}/{achievements.length}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </Card>
      </View>

      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.xpLabel}>{xpIntoLevel}/{xpForNextLevel} XP</Text>
        </View>
        <ProgressBar progress={xpIntoLevel / xpForNextLevel} />
      </Card>

      <Text style={[typography.h3, styles.sectionTitle]}>Achievements</Text>
      <View style={styles.grid}>
        {achievements.map((a) => (
          <View key={a.id} style={[styles.badge, !a.unlocked && styles.badgeLocked]}>
            <Text style={styles.badgeIcon}>{a.icon}</Text>
            <Text style={styles.badgeTitle}>{a.title}</Text>
            <Text style={styles.badgeDesc}>{a.description}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
