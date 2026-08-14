import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Task, Quiz, FlashcardDeck } from '../types/models';

// A "study day" is any day with at least one completed task/session.
// The streak counts consecutive study days ending today or yesterday
// (so it doesn't reset the instant midnight passes before you've had a
// chance to study today).
export function computeStreak(tasks: Task[]): number {
  const doneDates = new Set(tasks.filter((t) => t.done).map((t) => t.date));
  if (doneDates.size === 0) return 0;

  const today = new Date();
  let streak = 0;
  let cursor = today;

  const hasToday = doneDates.has(toIso(today));
  if (!hasToday) {
    cursor = addDaysLocal(today, -1);
    if (!doneDates.has(toIso(cursor))) return 0;
  }

  while (doneDates.has(toIso(cursor))) {
    streak += 1;
    cursor = addDaysLocal(cursor, -1);
  }
  return streak;
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDaysLocal(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

// 10 XP per completed task, 25 per completed study session, 15 per quiz
// attempt, bonus for quiz scores >= 80%.
export function computeXp(tasks: Task[], quizzes: Quiz[]): number {
  let xp = 0;
  for (const t of tasks) {
    if (!t.done) continue;
    xp += t.kind === 'study_session' ? 25 : 10;
  }
  for (const q of quizzes) {
    if (q.attempts === 0) continue;
    xp += q.attempts * 15;
    if ((q.lastScore ?? 0) >= 80) xp += 20;
  }
  return xp;
}

export function levelFromXp(xp: number) {
  // Each level needs progressively a bit more XP: 100, 220, 360, 520...
  let level = 1;
  let threshold = 100;
  let remaining = xp;
  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold += 40;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: threshold };
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export function computeAchievements(
  tasks: Task[],
  quizzes: Quiz[],
  decks: FlashcardDeck[],
  streak: number
): Achievement[] {
  const sessionsDone = tasks.filter((t) => t.done && t.kind === 'study_session').length;
  const totalStudyMinutes = tasks.filter((t) => t.done && t.kind === 'study_session').reduce((sum, t) => sum + t.durationMinutes, 0);
  const perfectQuiz = quizzes.some((q) => q.lastScore === 100);
  const anyQuizAttempt = quizzes.some((q) => q.attempts > 0);

  return [
    {
      id: 'first-session',
      icon: '🏆',
      title: 'First Study Session',
      description: 'Complete your first study session',
      unlocked: sessionsDone >= 1,
    },
    {
      id: 'streak-7',
      icon: '🔥',
      title: '7 Day Streak',
      description: 'Study 7 days in a row',
      unlocked: streak >= 7,
    },
    {
      id: 'hours-10',
      icon: '📚',
      title: '10 Hours Studied',
      description: 'Rack up 10 hours of focused study time',
      unlocked: totalStudyMinutes >= 600,
    },
    {
      id: 'perfect-quiz',
      icon: '🎯',
      title: 'Perfect Quiz',
      description: 'Score 100% on a practice test',
      unlocked: perfectQuiz,
    },
    {
      id: 'first-quiz',
      icon: '❓',
      title: 'First Practice Test',
      description: 'Take your first AI-generated practice test',
      unlocked: anyQuizAttempt,
    },
    {
      id: 'first-deck',
      icon: '🧠',
      title: 'Flashcard Starter',
      description: 'Create your first flashcard deck',
      unlocked: decks.length >= 1,
    },
  ];
}
