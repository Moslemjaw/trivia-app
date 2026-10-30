import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchQuestions } from '../api/opentdb';
import { Question } from '../data/questions';

const STORAGE_KEY = 'trivia.questions.v1';

type QuestionsContextValue = {
  questions: Question[];
  isLoading: boolean;
  hasError: boolean;
  loadQuestions: () => Promise<boolean>;
};

const QuestionsContext = createContext<QuestionsContextValue | null>(null);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const fetched = await fetchQuestions();
      setQuestions(fetched);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
      return true;
    } catch (error) {
      console.warn('Could not load questions', error);
      setHasError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reopening the app keeps the current questions, so saved answers still match them.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .catch((error) => {
        console.warn('Could not read saved questions', error);
        return null;
      })
      .then((saved) => {
        if (saved) {
          setQuestions(JSON.parse(saved));
          setIsLoading(false);
        } else {
          loadQuestions();
        }
      });
  }, [loadQuestions]);

  const value = useMemo(
    () => ({ questions, isLoading, hasError, loadQuestions }),
    [questions, isLoading, hasError, loadQuestions],
  );

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>;
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (!context) throw new Error('useQuestions must be used inside QuestionsProvider');
  return context;
}
