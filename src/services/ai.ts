import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Exam, Flashcard, QuizQuestion, Task } from '../types/models';

// ---- Low-level gateway -----------------------------------------------
// Every AI feature goes through this one function. When Supabase + the
// edge function + an OPENAI_API_KEY are all set up, it calls the real
// model. Otherwise (or if that call fails for any reason) it throws, and
// each feature-level function below falls back to local mock data - so
// the app is always fully usable, with or without AI configured.

async function callAI(action: string, prompt: string): Promise<string> {
  if (!isSupabaseConfigured || !supabase) throw new Error('no backend configured');
  const { data, error } = await supabase.functions.invoke('ai', { body: { action, prompt } });
  if (error) throw error;
  if (!data?.content) throw new Error('empty AI response');
  return data.content as string;
}

function tryParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

// ---- generateSummary ---------------------------------------------------

export async function generateSummary(topic: string, material: string): Promise<string> {
  try {
    const prompt = `Topic: ${topic}\n\nMaterial:\n${material}`;
    return await callAI('summary', prompt);
  } catch {
    return mockSummary(topic, material);
  }
}

function mockSummary(topic: string, material: string): string {
  const sentences = material
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const bullets = (sentences.length ? sentences : [`No material was entered yet for "${topic}".`])
    .map((s) => `- ${s}`)
    .join('\n');
  return `## Summary: ${topic}\n\n${bullets}\n\n*Demo summary - connect an AI provider for a real, model-written summary.*`;
}

// ---- generateQuiz -------------------------------------------------------

export async function generateQuiz(topic: string, material: string, count = 8): Promise<QuizQuestion[]> {
  try {
    const prompt = `Topic: ${topic}\nNumber of questions: ${count}\n\nMaterial:\n${material}`;
    const raw = await callAI('quiz', prompt);
    const parsed = tryParseJson<{ questions: QuizQuestion[] }>(raw);
    if (parsed?.questions?.length) return parsed.questions;
    throw new Error('bad AI quiz response');
  } catch {
    return mockQuiz(topic, count);
  }
}

function mockQuiz(topic: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }).map((_, i) => ({
    question: `(Demo) Practice question ${i + 1} about ${topic} - what is the key idea here?`,
    options: ['Option A', 'Option B (correct in demo mode)', 'Option C', 'Option D'],
    correctIndex: 1,
    explanation: 'This is a placeholder explanation. Connect an AI provider for real, material-based questions.',
  }));
}

// ---- generateFlashcards --------------------------------------------------

export async function generateFlashcards(topic: string, material: string, count = 10): Promise<Flashcard[]> {
  try {
    const prompt = `Topic: ${topic}\nNumber of cards: ${count}\n\nMaterial:\n${material}`;
    const raw = await callAI('flashcards', prompt);
    const parsed = tryParseJson<{ cards: Flashcard[] }>(raw);
    if (parsed?.cards?.length) return parsed.cards;
    throw new Error('bad AI flashcard response');
  } catch {
    return mockFlashcards(topic, count);
  }
}

function mockFlashcards(topic: string, count: number): Flashcard[] {
  return Array.from({ length: count }).map((_, i) => ({
    front: `(Demo) Key term ${i + 1} - ${topic}`,
    back: 'Connect an AI provider to generate real flashcards from your material.',
  }));
}

// ---- explainTopic ---------------------------------------------------------

export async function explainTopic(question: string): Promise<string> {
  try {
    return await callAI('explain', question);
  } catch {
    return `## ${question}\n\nThis is a demo explanation. Once an AI provider is connected, the coach will give a real, tailored explanation here - structured with headers, a simple analogy, and a short example.`;
  }
}

// ---- AI Coach chat ----------------------------------------------------------

export async function coachReply(message: string): Promise<string> {
  try {
    return await callAI('coach', message);
  } catch {
    return mockCoachReply(message);
  }
}

function mockCoachReply(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('samenvat') || m.includes('summary')) {
    return '## Summary\nGo to **Study Tools -> Summary** and paste your material - I\'ll structure it into a clear summary. (Demo reply: connect an AI provider for real answers here in chat too.)';
  }
  if (m.includes('oefenvra') || m.includes('quiz') || m.includes('practice')) {
    return '## Practice questions\nHead to **Study Tools -> Quiz**, paste your material, and I\'ll generate practice questions. (Demo reply.)';
  }
  if (m.includes('toets') || m.includes('exam') || m.includes('planning') || m.includes('plan')) {
    return '## Study plan\nAdd the exam under **Exams -> Add exam** with the date and material, and I\'ll build a study schedule that lands on your Planner automatically. (Demo reply.)';
  }
  return `Got it — "${message}"\n\nThis is a demo reply since no AI provider is connected yet. Once you add an API key, I'll give real, structured answers here.`;
}

// ---- createStudyPlan -------------------------------------------------------
// This is the core MVP feature, so its scheduling logic is deterministic
// and never depends on the AI call succeeding: it always produces a
// sensible set of sessions. When AI is available we only ask it for
// better session *titles*; the dates/spacing are always computed locally
// so the plan can never come back malformed or empty.

export interface GeneratedSession {
  title: string;
  date: string;
  durationMinutes: number;
}

export async function createStudyPlan(exam: Pick<Exam, 'topic' | 'date' | 'difficulty' | 'chapters' | 'material'>): Promise<GeneratedSession[]> {
  const today = new Date();
  const examDate = new Date(exam.date + 'T00:00:00');
  const daysAvailable = Math.max(differenceInCalendarDays(examDate, today) - 1, 1);

  const difficultyFactor = exam.difficulty === 'hard' ? 1.5 : exam.difficulty === 'easy' ? 0.75 : 1;
  const idealSessions = Math.round(Math.max(exam.chapters, 1) * difficultyFactor);
  const sessionCount = Math.min(Math.max(idealSessions, 3), Math.min(daysAvailable, 10));

  const titles = await sessionTitles(exam, sessionCount);
  const step = daysAvailable / sessionCount;

  return Array.from({ length: sessionCount }).map((_, i) => {
    const dayOffset = Math.max(1, Math.round(step * i + 1));
    const date = format(addDays(today, Math.min(dayOffset, daysAvailable)), 'yyyy-MM-dd');
    return {
      title: titles[i] ?? `Study session ${i + 1} - ${exam.topic}`,
      date,
      durationMinutes: exam.difficulty === 'hard' ? 60 : 45,
    };
  });
}

async function sessionTitles(
  exam: Pick<Exam, 'topic' | 'chapters' | 'material'>,
  count: number
): Promise<string[]> {
  try {
    const prompt = `Exam topic: ${exam.topic}\nChapters: ${exam.chapters}\nSessions needed: ${count}\n\nMaterial:\n${exam.material}`;
    const raw = await callAI('studyplan', prompt);
    const parsed = tryParseJson<{ sessions: { title: string }[] }>(raw);
    if (parsed?.sessions?.length) return parsed.sessions.map((s) => s.title);
    throw new Error('bad AI plan response');
  } catch {
    return Array.from({ length: count }).map(
      (_, i) => `Study ${exam.topic} - part ${i + 1}/${count}`
    );
  }
}

// ---- replanDay --------------------------------------------------------------
// Called when the student falls behind: compresses the remaining
// incomplete sessions for an exam into the days still left before it.

export function replanSessions(remaining: Task[], examDate: string): GeneratedSession[] {
  const today = new Date();
  const exam = new Date(examDate + 'T00:00:00');
  const daysAvailable = Math.max(differenceInCalendarDays(exam, today) - 1, 1);
  const count = remaining.length;
  const step = Math.max(daysAvailable / Math.max(count, 1), 1);

  return remaining.map((task, i) => {
    const dayOffset = Math.max(1, Math.round(step * i + 1));
    const date = format(addDays(today, Math.min(dayOffset, daysAvailable)), 'yyyy-MM-dd');
    return { title: task.title, date, durationMinutes: task.durationMinutes };
  });
}
