import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

// Shared layout styles for the simple "paste material -> generate" tool
// screens (Summary/Quiz/Flashcard/Explain/Glossary/AddExam), so each one
// doesn't redefine the same handful of rules.
export function useFormStyles() {
  const { colors, spacing } = useTheme();
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
    sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.md },
    resultText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  });
}
