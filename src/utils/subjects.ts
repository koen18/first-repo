import type { Subject } from '../types/models';
import { subjectPalette } from '../theme/theme';

export function subjectColor(subject: Subject | undefined | null) {
  if (!subject) return subjectPalette[0];
  return subjectPalette[subject.colorIndex % subjectPalette.length];
}

export function subjectName(subjects: Subject[], subjectId: string | null): string {
  if (!subjectId) return 'General';
  return subjects.find((s) => s.id === subjectId)?.name ?? 'General';
}
