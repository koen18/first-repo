import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { subjectName } from '../utils/subjects';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'FocusMode'>;

const DEFAULT_MINUTES = 25;

export function FocusModeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tasks, subjects, toggleTask } = useApp();
  const { colors, gradients, radius, spacing } = useTheme();

  const task = route.params?.taskId ? tasks.find((t) => t.id === route.params?.taskId) : undefined;
  const totalSeconds = (task?.durationMinutes ?? DEFAULT_MINUTES) * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || finished) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setFinished(true);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, finished]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = 1 - secondsLeft / totalSeconds;

  const finishAndClose = async () => {
    if (task && !task.done) await toggleTask(task.id);
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    closeBtn: { position: 'absolute', top: spacing.xl, left: spacing.xl, padding: spacing.sm },
    closeText: { fontSize: 22, color: colors.textMuted },
    subject: { fontSize: 14, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
    title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.xs, textAlign: 'center' },
    timerWrap: {
      width: 260,
      height: 260,
      borderRadius: 130,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xxl,
    },
    timerInner: {
      width: 232,
      height: 232,
      borderRadius: 116,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerText: { fontSize: 52, fontWeight: '800', color: colors.text, letterSpacing: -1 },
    track: { height: 8, width: 240, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden', marginBottom: spacing.xxl },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
    controls: { flexDirection: 'row', gap: spacing.md },
    doneWrap: { alignItems: 'center' },
    doneEmoji: { fontSize: 56, marginBottom: spacing.md },
    doneTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
    doneMeta: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  });

  if (finished) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrap}>
          <View style={styles.doneWrap}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Study session complete</Text>
            <Text style={styles.doneMeta}>
              {Math.round(totalSeconds / 60)} minutes {task ? `on ${task.title}` : 'of focused study'}
            </Text>
            <Button label="Done" onPress={finishAndClose} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Pressable
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close focus mode"
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.subject}>{task ? subjectName(subjects, task.subjectId).toUpperCase() : 'FOCUS SESSION'}</Text>
        <Text style={styles.title}>{task?.title ?? 'Deep work'}</Text>

        <View style={[styles.timerWrap, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{minutes}:{seconds}</Text>
          </View>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.controls}>
          <Button
            label={running ? '⏸ Pause' : '▶ Resume'}
            variant="secondary"
            onPress={() => setRunning((r) => !r)}
          />
          <Button label="✓ Finish now" onPress={() => setFinished(true)} />
        </View>
      </View>
    </SafeAreaView>
  );
}
