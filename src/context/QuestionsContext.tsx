import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { GenerationError, generateQuestions } from '../api/openrouter';
import { Question } from '../data/questions';

const STORAGE_KEY = 'trivia.questions.v2';

type QuestionsContextValue = {
  questions: Question[];
  isRestoring: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  loadQuestions: (category: string) => Promise<boolean>;
};

const QuestionsContext = createContext<QuestionsContextValue | null>(null);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQuestions = useCallback(async (category: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const generated = await generateQuestions(category);
      setQuestions(generated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      return true;
    } catch (error) {
      console.warn('Could not generate questions', error);
      setErrorMessage(
        error instanceof GenerationError ? error.message : 'Couldn’t generate questions. Try again.',
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reopening the app keeps the current questions, so saved answers still match them.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setQuestions(JSON.parse(saved));
      })
      .catch((error) => console.warn('Could not read saved questions', error))
      .finally(() => setIsRestoring(false));
  }, []);

  const value = useMemo(
    () => ({ questions, isRestoring, isLoading, errorMessage, loadQuestions }),
    [questions, isRestoring, isLoading, errorMessage, loadQuestions],
  );

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>;
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (!context) throw new Error('useQuestions must be used inside QuestionsProvider');
  return context;
}
