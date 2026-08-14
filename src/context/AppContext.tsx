import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  demoProfile,
  demoSubjects,
  demoExams,
  demoTasks,
  demoQuizzes,
  demoDecks,
  demoSummaries,
} from '../data/mockData';
import type {
  ChatMessage,
  Exam,
  Flashcard,
  FlashcardDeck,
  ProgressSnapshot,
  Quiz,
  QuizQuestion,
  Subject,
  Summary,
  Task,
  UserProfile,
} from '../types/models';
import { createStudyPlan, replanSessions, coachReply as aiCoachReply } from '../services/ai';
import type { StudyPlanOptions } from '../services/ai';
import * as repo from '../services/repo';

const STORAGE_KEY = 'aisp:v1:state';

interface PersistedState {
  profile: UserProfile;
  subjects: Subject[];
  exams: Exam[];
  tasks: Task[];
  quizzes: Quiz[];
  decks: FlashcardDeck[];
  summaries: Summary[];
  chatMessages: ChatMessage[];
}

function seedState(): PersistedState {
  return {
    profile: demoProfile,
    subjects: demoSubjects,
    exams: demoExams,
    tasks: demoTasks,
    quizzes: demoQuizzes,
    decks: demoDecks,
    summaries: demoSummaries,
    chatMessages: [],
  };
}

function emptyState(userId: string): PersistedState {
  return {
    profile: { ...demoProfile, id: userId, name: '', subjects: [], onboarded: false },
    subjects: [],
    exams: [],
    tasks: [],
    quizzes: [],
    decks: [],
    summaries: [],
    chatMessages: [],
  };
}

const SUBJECT_COLOR_COUNT = 6;
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface AppContextValue extends PersistedState {
  loading: boolean;
  isDemoMode: boolean;
  isCloudMode: boolean;
  needsAuth: boolean;
  completeOnboarding: (input: Omit<UserProfile, 'id' | 'onboarded'>) => Promise<void>;
  addTask: (input: Omit<Task, 'id' | 'done'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addExam: (input: Omit<Exam, 'id' | 'planGenerated'>, options?: StudyPlanOptions) => Promise<Exam>;
  updateProfile: (input: Omit<UserProfile, 'id' | 'onboarded'>) => Promise<void>;
  replanExam: (examId: string) => Promise<void>;
  addQuiz: (title: string, subjectId: string | null, questions: QuizQuestion[]) => Promise<Quiz>;
  recordQuizAttempt: (quizId: string, score: number) => Promise<void>;
  addDeck: (title: string, subjectId: string | null, cards: Flashcard[]) => Promise<FlashcardDeck>;
  addSummary: (title: string, subjectId: string | null, content: string) => Promise<Summary>;
  sendChatMessage: (content: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetLocalData: () => Promise<void>;
  progress: ProgressSnapshot;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(isSupabaseConfigured ? emptyState('pending') : seedState());
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);

  const isCloudMode = isSupabaseConfigured && !!session;
  const userId = isCloudMode ? (session as Session).user.id : 'local-demo';

  // --- Auth session tracking (cloud mode only) ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Local demo mode: load once from AsyncStorage ---
  useEffect(() => {
    if (isSupabaseConfigured) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(JSON.parse(raw) as PersistedState);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedState()));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Cloud mode: (re)load whenever the session changes ---
  useEffect(() => {
    if (!isSupabaseConfigured || !authChecked) return;
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    repo
      .fetchAllCloudData(session.user.id)
      .then((data) => setState(data))
      .finally(() => setLoading(false));
  }, [isSupabaseConfigured, authChecked, session]);

  const persistLocal = useCallback(async (next: PersistedState) => {
    if (isSupabaseConfigured) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveProfileAndSubjects = useCallback(
    async (input: Omit<UserProfile, 'id' | 'onboarded'>) => {
      const existingByName = new Map(state.subjects.map((s) => [s.name.trim().toLowerCase(), s]));
      const subjects: Subject[] = input.subjects.map((name, i) => {
        const match = existingByName.get(name.trim().toLowerCase());
        return match ?? { id: uid(), name, colorIndex: i % SUBJECT_COLOR_COUNT };
      });
      const newSubjects = subjects.filter((s) => !existingByName.has(s.name.trim().toLowerCase()));
      const profile: UserProfile = { ...input, id: userId, onboarded: true };
      const next = { ...state, profile, subjects };
      setState(next);
      if (isCloudMode) {
        await repo.cloudSaveProfile(userId, profile);
        await repo.cloudInsertSubjects(userId, newSubjects);
      } else {
        await persistLocal(next);
      }
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const completeOnboarding = saveProfileAndSubjects;
  const updateProfile = saveProfileAndSubjects;

  const addTask = useCallback<AppContextValue['addTask']>(
    async (input) => {
      const task: Task = { ...input, id: uid(), done: false };
      const next = { ...state, tasks: [...state.tasks, task] };
      setState(next);
      if (isCloudMode) await repo.cloudInsertTask(userId, task);
      else await persistLocal(next);
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const target = state.tasks.find((t) => t.id === id);
      if (!target) return;
      const next = { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) };
      setState(next);
      if (isCloudMode) await repo.cloudUpdateTask(id, { done: !target.done });
      else await persistLocal(next);
    },
    [state, isCloudMode, persistLocal]
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      const next = { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) };
      setState(next);
      if (isCloudMode) await repo.cloudUpdateTask(id, patch);
      else await persistLocal(next);
    },
    [state, isCloudMode, persistLocal]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const next = { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
      setState(next);
      if (isCloudMode) await repo.cloudDeleteTask(id);
      else await persistLocal(next);
    },
    [state, isCloudMode, persistLocal]
  );

  const addExam = useCallback<AppContextValue['addExam']>(
    async (input, options) => {
      const exam: Exam = { ...input, id: uid(), planGenerated: false };
      const sessions = await createStudyPlan(exam, state.tasks, {
        dailyBusyLimitMinutes: state.profile.dailyStudyBudgetMinutes,
        ...options,
      });
      const sessionTasks: Task[] = sessions.map((s) => ({
        id: uid(),
        title: s.title,
        subjectId: exam.subjectId,
        date: s.date,
        time: '17:00',
        durationMinutes: s.durationMinutes,
        priority: 'high',
        done: false,
        kind: 'study_session',
        examId: exam.id,
        notes: null,
      }));
      const finishedExam = { ...exam, planGenerated: true };
      const next = { ...state, exams: [...state.exams, finishedExam], tasks: [...state.tasks, ...sessionTasks] };
      setState(next);
      if (isCloudMode) {
        await repo.cloudInsertExam(userId, finishedExam);
        await repo.cloudInsertTasks(userId, sessionTasks);
      } else {
        await persistLocal(next);
      }
      return finishedExam;
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const replanExam = useCallback(
    async (examId: string) => {
      const exam = state.exams.find((e) => e.id === examId);
      if (!exam) return;
      const remaining = state.tasks.filter(
        (t) => t.examId === examId && t.kind === 'study_session' && !t.done
      );
      if (!remaining.length) return;
      const rescheduled = replanSessions(remaining, exam.date);
      const byId = new Map(remaining.map((t, i) => [t.id, rescheduled[i]]));
      const next = {
        ...state,
        tasks: state.tasks.map((t) => {
          const nextValues = byId.get(t.id);
          return nextValues ? { ...t, date: nextValues.date, durationMinutes: nextValues.durationMinutes } : t;
        }),
      };
      setState(next);
      if (isCloudMode) {
        await Promise.all(
          remaining.map((t) => {
            const nextValues = byId.get(t.id)!;
            return repo.cloudUpdateTask(t.id, { date: nextValues.date, durationMinutes: nextValues.durationMinutes });
          })
        );
      } else {
        await persistLocal(next);
      }
    },
    [state, isCloudMode, persistLocal]
  );

  const addQuiz = useCallback<AppContextValue['addQuiz']>(
    async (title, subjectId, questions) => {
      const quiz: Quiz = {
        id: uid(),
        subjectId,
        title,
        questions,
        createdAt: new Date().toISOString(),
        lastScore: null,
        attempts: 0,
      };
      const next = { ...state, quizzes: [...state.quizzes, quiz] };
      setState(next);
      if (isCloudMode) await repo.cloudInsertQuiz(userId, quiz);
      else await persistLocal(next);
      return quiz;
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const recordQuizAttempt = useCallback(
    async (quizId: string, score: number) => {
      const target = state.quizzes.find((q) => q.id === quizId);
      if (!target) return;
      const attempts = target.attempts + 1;
      const next = {
        ...state,
        quizzes: state.quizzes.map((q) => (q.id === quizId ? { ...q, lastScore: score, attempts } : q)),
      };
      setState(next);
      if (isCloudMode) await repo.cloudUpdateQuiz(quizId, score, attempts);
      else await persistLocal(next);
    },
    [state, isCloudMode, persistLocal]
  );

  const addDeck = useCallback<AppContextValue['addDeck']>(
    async (title, subjectId, cards) => {
      const deck: FlashcardDeck = { id: uid(), subjectId, title, cards, createdAt: new Date().toISOString() };
      const next = { ...state, decks: [...state.decks, deck] };
      setState(next);
      if (isCloudMode) await repo.cloudInsertDeck(userId, deck);
      else await persistLocal(next);
      return deck;
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const addSummary = useCallback<AppContextValue['addSummary']>(
    async (title, subjectId, content) => {
      const summary: Summary = { id: uid(), subjectId, title, content, createdAt: new Date().toISOString() };
      const next = { ...state, summaries: [...state.summaries, summary] };
      setState(next);
      if (isCloudMode) await repo.cloudInsertSummary(userId, summary);
      else await persistLocal(next);
      return summary;
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const sendChatMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { id: uid(), role: 'user', content, createdAt: new Date().toISOString() };
      const withUser = { ...state, chatMessages: [...state.chatMessages, userMsg] };
      setState(withUser);
      if (isCloudMode) await repo.cloudInsertChatMessage(userId, userMsg);
      else await persistLocal(withUser);

      const replyText = await aiCoachReply(content);
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      };
      const withReply = { ...withUser, chatMessages: [...withUser.chatMessages, assistantMsg] };
      setState(withReply);
      if (isCloudMode) await repo.cloudInsertChatMessage(userId, assistantMsg);
      else await persistLocal(withReply);
    },
    [state, userId, isCloudMode, persistLocal]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const resetLocalData = useCallback(async () => {
    if (isSupabaseConfigured) return;
    const fresh = seedState();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
  }, []);

  const progress = useMemo<ProgressSnapshot>(() => {
    const realTasks = state.tasks.filter((t) => t.kind !== 'event');
    const sessions = state.tasks.filter((t) => t.kind === 'study_session');
    const bySubject = state.subjects.map((s) => {
      const subjectTasks = realTasks.filter((t) => t.subjectId === s.id);
      return {
        subjectId: s.id,
        completed: subjectTasks.filter((t) => t.done).length,
        total: subjectTasks.length,
      };
    });
    return {
      tasksCompleted: realTasks.filter((t) => t.done).length,
      tasksTotal: realTasks.length,
      sessionsCompleted: sessions.filter((t) => t.done).length,
      sessionsTotal: sessions.length,
      bySubject,
      quizScores: state.quizzes
        .filter((q) => q.lastScore !== null)
        .map((q) => ({ quizTitle: q.title, score: q.lastScore as number, date: q.createdAt })),
    };
  }, [state]);

  const value: AppContextValue = {
    ...state,
    loading: loading || (isSupabaseConfigured && !authChecked),
    isDemoMode: !isSupabaseConfigured,
    isCloudMode,
    needsAuth: isSupabaseConfigured && authChecked && !session,
    completeOnboarding,
    updateProfile,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    addExam,
    replanExam,
    addQuiz,
    recordQuizAttempt,
    addDeck,
    addSummary,
    sendChatMessage,
    signOut,
    resetLocalData,
    progress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { supabase, isSupabaseConfigured };
