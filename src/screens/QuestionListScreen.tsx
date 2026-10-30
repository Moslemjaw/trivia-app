import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuestionCard } from '../components/QuestionCard';
import { ScoreTracker } from '../components/ScoreTracker';
import { useQuestions } from '../context/QuestionsContext';
import { useScore } from '../context/ScoreContext';
import { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Questions'>;

export function QuestionListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { questions, isLoading, hasError, loadQuestions } = useQuestions();
  const { answers, resetScore } = useScore();
  const insets = useSafeAreaInsets();

  const filteredQuestions = useMemo(() => {
    const keywords = search.toLowerCase().split(/\s+/).filter(Boolean);
    return questions.filter((question) => {
      const searchable = `${question.question} ${question.category}`.toLowerCase();
      return keywords.every((keyword) => searchable.includes(keyword));
    });
  }, [questions, search]);

  const loadNewQuestions = async () => {
    // A failed request keeps the current questions, so only reset after a success.
    if (await loadQuestions()) {
      resetScore();
      setSearch('');
    }
  };

  const loadButton = (
    <Pressable
      disabled={isLoading}
      onPress={loadNewQuestions}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading }}
      style={[styles.button, isLoading && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>
        {isLoading ? 'Loading…' : questions.length > 0 ? 'Get new questions' : 'Try again'}
      </Text>
    </Pressable>
  );

  const errorMessage = hasError && (
    <Text style={styles.error} accessibilityLiveRegion="polite">
      Couldn’t load questions. Check your connection and try again.
    </Text>
  );

  if (questions.length === 0) {
    return (
      <View style={[styles.screen, styles.centered]}>
        {isLoading ? <ActivityIndicator size="large" color={colors.primary} /> : errorMessage}
        {!isLoading && loadButton}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by keyword or category"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search questions"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
          style={styles.search}
        />
        <ScoreTracker />
      </View>
      <FlatList
        data={filteredQuestions}
        keyExtractor={(question) => question.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            isCorrect={answers[item.id]?.isCorrect}
            onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No questions match “{search.trim()}”.</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {errorMessage}
            {loadButton}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    color: colors.textMuted,
  },
  footer: {
    gap: 12,
    marginTop: 4,
  },
  error: {
    textAlign: 'center',
    fontSize: 15,
    color: colors.incorrect,
  },
  button: {
    minHeight: 50,
    alignSelf: 'stretch',
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
});
