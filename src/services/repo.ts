// Maps between Supabase's snake_case rows and the app's camelCase models,
// and provides the CRUD calls used when the app is running in cloud mode
// (Supabase configured + user logged in). In local demo mode none of this
// is used - see AppContext for the AsyncStorage-only path.
import { supabase } from '../lib/supabase';
import type {
  ChatMessage,
  Exam,
  Flashcard,
  FlashcardDeck,
  Quiz,
  QuizQuestion,
  Subject,
  Summary,
  Task,
  UserProfile,
} from '../types/models';

function db() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export function mapProfile(row: any, id: string): UserProfile {
  return {
    id,
    name: row?.name ?? '',
    schoolLevel: row?.school_level ?? 'other',
    subjects: row?.subjects ?? [],
    schoolStartTime: row?.school_start_time ?? '08:30',
    schoolEndTime: row?.school_end_time ?? '15:00',
    onboarded: row?.onboarded ?? false,
  };
}

export function mapSubject(row: any): Subject {
  return { id: row.id, name: row.name, colorIndex: row.color_index };
}

export function mapTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    date: row.date,
    time: row.time,
    durationMinutes: row.duration_minutes,
    priority: row.priority,
    done: row.done,
    kind: row.kind,
    examId: row.exam_id,
    notes: row.notes,
  };
}

export function mapExam(row: any): Exam {
  return {
    id: row.id,
    subjectId: row.subject_id,
    topic: row.topic,
    date: row.date,
    difficulty: row.difficulty,
    chapters: row.chapters,
    material: row.material,
    planGenerated: row.plan_generated,
  };
}

export function mapQuiz(row: any): Quiz {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    questions: row.questions ?? [],
    createdAt: row.created_at,
    lastScore: row.last_score,
    attempts: row.attempts,
  };
}

export function mapDeck(row: any): FlashcardDeck {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    cards: row.cards ?? [],
    createdAt: row.created_at,
  };
}

export function mapSummary(row: any): Summary {
  return { id: row.id, subjectId: row.subject_id, title: row.title, content: row.content, createdAt: row.created_at };
}

export function mapChat(row: any): ChatMessage {
  return { id: row.id, role: row.role, content: row.content, createdAt: row.created_at };
}

export async function fetchAllCloudData(userId: string) {
  const client = db();
  const [profileRes, subjectsRes, tasksRes, examsRes, quizzesRes, decksRes, summariesRes, chatRes] = await Promise.all([
    client.from('profiles').select('*').eq('id', userId).maybeSingle(),
    client.from('subjects').select('*').order('created_at'),
    client.from('tasks').select('*').order('date'),
    client.from('exams').select('*').order('date'),
    client.from('quizzes').select('*').order('created_at'),
    client.from('flashcard_decks').select('*').order('created_at'),
    client.from('summaries').select('*').order('created_at'),
    client.from('chat_messages').select('*').order('created_at'),
  ]);

  return {
    profile: mapProfile(profileRes.data, userId),
    subjects: (subjectsRes.data ?? []).map(mapSubject),
    tasks: (tasksRes.data ?? []).map(mapTask),
    exams: (examsRes.data ?? []).map(mapExam),
    quizzes: (quizzesRes.data ?? []).map(mapQuiz),
    decks: (decksRes.data ?? []).map(mapDeck),
    summaries: (summariesRes.data ?? []).map(mapSummary),
    chatMessages: (chatRes.data ?? []).map(mapChat),
  };
}

export async function cloudSaveProfile(userId: string, profile: Omit<UserProfile, 'id'>) {
  await db()
    .from('profiles')
    .update({
      name: profile.name,
      school_level: profile.schoolLevel,
      subjects: profile.subjects,
      school_start_time: profile.schoolStartTime,
      school_end_time: profile.schoolEndTime,
      onboarded: profile.onboarded,
    })
    .eq('id', userId);
}

export async function cloudInsertSubjects(userId: string, subjects: Subject[]) {
  if (!subjects.length) return;
  await db()
    .from('subjects')
    .insert(subjects.map((s) => ({ id: s.id, user_id: userId, name: s.name, color_index: s.colorIndex })));
}

export async function cloudInsertTask(userId: string, task: Task) {
  await db()
    .from('tasks')
    .insert({
      id: task.id,
      user_id: userId,
      subject_id: task.subjectId,
      exam_id: task.examId,
      title: task.title,
      date: task.date,
      time: task.time,
      duration_minutes: task.durationMinutes,
      priority: task.priority,
      kind: task.kind,
      done: task.done,
      notes: task.notes,
    });
}

export async function cloudInsertTasks(userId: string, tasks: Task[]) {
  if (!tasks.length) return;
  await db()
    .from('tasks')
    .insert(
      tasks.map((task) => ({
        id: task.id,
        user_id: userId,
        subject_id: task.subjectId,
        exam_id: task.examId,
        title: task.title,
        date: task.date,
        time: task.time,
        duration_minutes: task.durationMinutes,
        priority: task.priority,
        kind: task.kind,
        done: task.done,
        notes: task.notes,
      }))
    );
}

export async function cloudUpdateTask(taskId: string, patch: Partial<Task>) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.subjectId !== undefined) row.subject_id = patch.subjectId;
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.time !== undefined) row.time = patch.time;
  if (patch.durationMinutes !== undefined) row.duration_minutes = patch.durationMinutes;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.kind !== undefined) row.kind = patch.kind;
  if (patch.done !== undefined) row.done = patch.done;
  if (patch.notes !== undefined) row.notes = patch.notes;
  await db().from('tasks').update(row).eq('id', taskId);
}

export async function cloudDeleteTask(taskId: string) {
  await db().from('tasks').delete().eq('id', taskId);
}

export async function cloudInsertExam(userId: string, exam: Exam) {
  await db()
    .from('exams')
    .insert({
      id: exam.id,
      user_id: userId,
      subject_id: exam.subjectId,
      topic: exam.topic,
      date: exam.date,
      difficulty: exam.difficulty,
      chapters: exam.chapters,
      material: exam.material,
      plan_generated: exam.planGenerated,
    });
}

export async function cloudInsertQuiz(userId: string, quiz: Quiz) {
  await db()
    .from('quizzes')
    .insert({
      id: quiz.id,
      user_id: userId,
      subject_id: quiz.subjectId,
      title: quiz.title,
      questions: quiz.questions,
      last_score: quiz.lastScore,
      attempts: quiz.attempts,
    });
}

export async function cloudUpdateQuiz(quizId: string, lastScore: number, attempts: number) {
  await db().from('quizzes').update({ last_score: lastScore, attempts }).eq('id', quizId);
}

export async function cloudInsertDeck(userId: string, deck: FlashcardDeck) {
  await db()
    .from('flashcard_decks')
    .insert({ id: deck.id, user_id: userId, subject_id: deck.subjectId, title: deck.title, cards: deck.cards });
}

export async function cloudInsertSummary(userId: string, summary: Summary) {
  await db()
    .from('summaries')
    .insert({ id: summary.id, user_id: userId, subject_id: summary.subjectId, title: summary.title, content: summary.content });
}

export async function cloudInsertChatMessage(userId: string, message: ChatMessage) {
  await db().from('chat_messages').insert({ id: message.id, user_id: userId, role: message.role, content: message.content });
}
