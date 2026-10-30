import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Question } from '../data/questions';
import { colors, difficultyColors } from '../theme';

type Props = {
  question: Question;
  isCorrect?: boolean;
  onPress: () => void;
};

export function QuestionCard({ question, isCorrect, onPress }: Props) {
  const difficulty = difficultyColors[question.difficulty];
  const isAnswered = isCorrect !== undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.category}>{question.category}</Text>
        {isAnswered && (
          <Text style={[styles.result, { color: isCorrect ? colors.correct : colors.incorrect }]}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </Text>
        )}
      </View>
      <Text style={styles.question}>{question.question}</Text>
      <View style={styles.tags}>
        <Text style={[styles.tag, { color: difficulty.text, backgroundColor: difficulty.background }]}>
          {question.difficulty}
        </Text>
        <Text style={[styles.tag, styles.typeTag]}>{question.type}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  result: {
    fontSize: 13,
    fontWeight: '700',
  },
  question: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  typeTag: {
    color: colors.textMuted,
    backgroundColor: colors.background,
  },
});
