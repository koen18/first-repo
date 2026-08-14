import type { Subject } from '../types/models';
import { subjectPalette as defaultPalette } from '../theme/tokens';

export function subjectColor(subject: Subject | undefined | null, palette: typeof defaultPalette = defaultPalette) {
  if (!subject) return palette[0];
  return palette[subject.colorIndex % palette.length];
}

export function subjectName(subjects: Subject[], subjectId: string | null): string {
  if (!subjectId) return 'General';
  return subjects.find((s) => s.id === subjectId)?.name ?? 'General';
}
