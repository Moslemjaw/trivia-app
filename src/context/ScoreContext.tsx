import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { Question } from '../data/questions';
import { useQuestions } from './QuestionsContext';

const STORAGE_KEY = 'trivia.answers.v3';

type AnswerRecord = { selected: string; isCorrect: boolean };
type Answers = Record<string, AnswerRecord>;

type ScoreContextValue = {
  answers: Answers;
  correctCount: number;
  answeredCount: number;
  totalCount: number;
  submitAnswer: (question: Question, selected: string) => void;
  resetScore: () => void;
};

const ScoreContext = createContext<ScoreContextValue | null>(null);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { questions } = useQuestions();
  const totalCount = questions.length;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          // Answers given while storage was loading take priority over saved ones.
          setAnswers((current) => ({ ...JSON.parse(saved), ...current }));
        }
      })
      .catch((error) => console.warn('Could not load saved score', error))
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(answers)).catch((error) =>
      console.warn('Could not save score', error),
    );
  }, [answers, isLoaded]);

  const value = useMemo<ScoreContextValue>(() => {
    const records = Object.values(answers);
    return {
      answers,
      correctCount: records.filter((record) => record.isCorrect).length,
      answeredCount: records.length,
      totalCount,
      submitAnswer: (question, selected) =>
        setAnswers((current) =>
          current[question.id]
            ? current
            : {
                ...current,
                [question.id]: { selected, isCorrect: selected === question.correctAnswer },
              },
        ),
      resetScore: () => setAnswers({}),
    };
  }, [answers, totalCount]);

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScore must be used inside ScoreProvider');
  return context;
}
