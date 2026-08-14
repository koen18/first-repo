export type SchoolLevel = 'vmbo' | 'havo' | 'vwo' | 'mbo' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  subjects: string[];
  schoolStartTime: string; // "08:30"
  schoolEndTime: string; // "15:00"
  onboarded: boolean;
  dailyStudyBudgetMinutes: number; // planner avoids stacking study sessions past this on one day
  remindersEnabled: boolean;
  reminderTime: string; // "16:00"
}

export interface Subject {
  id: string;
  name: string;
  colorIndex: number;
}

export type ItemPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subjectId: string | null;
  date: string; // ISO date "2026-08-14"
  time: string | null; // "16:00"
  durationMinutes: number;
  priority: ItemPriority;
  done: boolean;
  kind: 'task' | 'event' | 'study_session';
  examId: string | null; // set when generated as part of a study plan
  notes: string | null;
}

export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export interface Exam {
  id: string;
  subjectId: string;
  topic: string;
  date: string; // ISO date
  difficulty: ExamDifficulty;
  chapters: number;
  material: string; // pasted study material / notes
  planGenerated: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  subjectId: string | null;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
  lastScore: number | null; // 0-100
  attempts: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  subjectId: string | null;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface Summary {
  id: string;
  subjectId: string | null;
  title: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ProgressSnapshot {
  tasksCompleted: number;
  tasksTotal: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  bySubject: { subjectId: string; completed: number; total: number }[];
  quizScores: { quizTitle: string; score: number; date: string }[];
}
