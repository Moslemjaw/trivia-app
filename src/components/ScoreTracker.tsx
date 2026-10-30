import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useScore } from '../context/ScoreContext';
import { colors } from '../theme';

export function ScoreTracker() {
  const { correctCount, answeredCount, totalCount, resetScore } = useScore();
  const progress = totalCount === 0 ? 0 : answeredCount / totalCount;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.score}>
          Score: {correctCount} correct
        </Text>
        {answeredCount > 0 && (
          <Pressable onPress={resetScore} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.reset}>Reset</Text>
          </Pressable>
        )}
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: totalCount, now: answeredCount }}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progress}>
        {answeredCount} of {totalCount} answered
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  score: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reset: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progress: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
