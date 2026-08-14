import type { Quiz, Subject } from '../types/models';

// Deterministic, data-driven insight from the student's own quiz history -
// compares their two most recent scored quizzes per subject. Not a live AI
// call (no network round-trip needed for something this cheap to compute),
// but genuinely personalized, unlike a canned placeholder string.
export function computeInsight(quizzes: Quiz[], subjects: Subject[]): string | null {
  const bySubject = new Map<string, Quiz[]>();
  for (const q of quizzes) {
    if (q.lastScore === null || !q.subjectId) continue;
    const arr = bySubject.get(q.subjectId) ?? [];
    arr.push(q);
    bySubject.set(q.subjectId, arr);
  }

  for (const [subjectId, subjectQuizzes] of bySubject) {
    if (subjectQuizzes.length < 2) continue;
    const sorted = [...subjectQuizzes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const prev = sorted[sorted.length - 2].lastScore as number;
    const last = sorted[sorted.length - 1].lastScore as number;
    const diff = last - prev;
    const name = subjects.find((s) => s.id === subjectId)?.name ?? 'this subject';
    if (diff >= 5) return `Your ${name} quiz scores are up ${diff}% since your previous practice test. Nice progress.`;
    if (diff <= -5) return `Your ${name} quiz scores dropped ${Math.abs(diff)}% since last time - a quick review session could help.`;
  }

  const lowScoring = Array.from(bySubject.entries())
    .map(([subjectId, qs]) => ({ subjectId, score: qs[qs.length - 1].lastScore as number }))
    .filter((s) => s.score < 60)
    .sort((a, b) => a.score - b.score)[0];
  if (lowScoring) {
    const name = subjects.find((s) => s.id === lowScoring.subjectId)?.name ?? 'this subject';
    return `You're at ${lowScoring.score}% on your latest ${name} practice test - worth another look before your next exam.`;
  }

  return null;
}
