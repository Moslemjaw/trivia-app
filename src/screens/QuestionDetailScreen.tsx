import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScoreTracker } from '../components/ScoreTracker';
import { useScore } from '../context/ScoreContext';
import { QUESTIONS } from '../data/questions';
import { RootStackParamList } from '../navigation';
import { colors, difficultyColors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>;

export function QuestionDetailScreen({ route, navigation }: Props) {
  const { questionId } = route.params;
  const { answers, submitAnswer } = useScore();
  const [draft, setDraft] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const questionIndex = QUESTIONS.findIndex((item) => item.id === questionId);
  const question = QUESTIONS[questionIndex];
  if (!question) {
    return <Text style={styles.missing}>This question could not be found.</Text>;
  }

  const answer = answers[question.id];
  const selected = answer?.selected ?? draft;
  const nextQuestion = QUESTIONS[questionIndex + 1];
  const difficulty = difficultyColors[question.difficulty];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      <Text style={styles.question} accessibilityRole="header">
        {question.question}
      </Text>
      <View style={styles.tags}>
        <Text style={[styles.tag, styles.categoryTag]}>{question.category}</Text>
        <Text style={[styles.tag, { color: difficulty.text, backgroundColor: difficulty.background }]}>
          {question.difficulty}
        </Text>
        <Text style={[styles.tag, styles.typeTag]}>{question.type}</Text>
      </View>

      <View style={styles.options} accessibilityRole="radiogroup">
        {question.options.map((option) => {
          const isSelected = selected === option;
          const isCorrectOption = option === question.correctAnswer;
          const showCorrect = answer && isCorrectOption;
          const showIncorrect = answer && isSelected && !isCorrectOption;
          return (
            <Pressable
              key={option}
              disabled={!!answer}
              onPress={() => setDraft(option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: !!answer }}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showIncorrect && styles.optionIncorrect,
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
              {showCorrect && <Text style={styles.correctMark}>✓</Text>}
              {showIncorrect && <Text style={styles.incorrectMark}>✗</Text>}
            </Pressable>
          );
        })}
      </View>

      {!answer ? (
        <Pressable
          disabled={!draft}
          onPress={() => draft && submitAnswer(question, draft)}
          accessibilityRole="button"
          accessibilityState={{ disabled: !draft }}
          style={[styles.button, !draft && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Submit answer</Text>
        </Pressable>
      ) : (
        <>
          <View
            accessibilityLiveRegion="polite"
            style={[styles.result, answer.isCorrect ? styles.resultCorrect : styles.resultIncorrect]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: answer.isCorrect ? colors.correct : colors.incorrect },
              ]}
            >
              {answer.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </Text>
            <Text style={styles.resultText}>
              Correct answer: <Text style={styles.bold}>{question.correctAnswer}</Text>
            </Text>
            {question.explanation && <Text style={styles.resultText}>{question.explanation}</Text>}
          </View>
          {nextQuestion && (
            <Pressable
              onPress={() => navigation.replace('QuestionDetail', { questionId: nextQuestion.id })}
              accessibilityRole="button"
              style={styles.button}
            >
              <Text style={styles.buttonText}>Next question</Text>
            </Pressable>
          )}
        </>
      )}

      <ScoreTracker />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  missing: {
    margin: 24,
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
  },
  question: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
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
  categoryTag: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  typeTag: {
    color: colors.textMuted,
    backgroundColor: colors.surface,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionCorrect: {
    borderColor: colors.correct,
    backgroundColor: colors.correctSoft,
  },
  optionIncorrect: {
    borderColor: colors.incorrect,
    backgroundColor: colors.incorrectSoft,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  correctMark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.correct,
  },
  incorrectMark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.incorrect,
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  result: {
    padding: 16,
    gap: 8,
    borderRadius: 12,
  },
  resultCorrect: {
    backgroundColor: colors.correctSoft,
  },
  resultIncorrect: {
    backgroundColor: colors.incorrectSoft,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  bold: {
    fontWeight: '700',
  },
});
