import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPicker } from '../components/CategoryPicker';
import { QuestionCard } from '../components/QuestionCard';
import { ScoreTracker } from '../components/ScoreTracker';
import { useQuestions } from '../context/QuestionsContext';
import { useScore } from '../context/ScoreContext';
import { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Questions'>;

export function QuestionListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  const { questions, isRestoring, isLoading, errorMessage, loadQuestions } = useQuestions();
  const { answers, resetScore } = useScore();
  const insets = useSafeAreaInsets();

  const filteredQuestions = useMemo(() => {
    const keywords = search.toLowerCase().split(/\s+/).filter(Boolean);
    return questions.filter((question) => {
      const searchable = `${question.question} ${question.category}`.toLowerCase();
      return keywords.every((keyword) => searchable.includes(keyword));
    });
  }, [questions, search]);

  const generate = async (category: string) => {
    // A failed request keeps the current questions, so only reset after a success.
    if (await loadQuestions(category)) {
      resetScore();
      setSearch('');
      setIsPicking(false);
    }
  };

  if (isRestoring) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isPicking || questions.length === 0) {
    return (
      <ScrollView
        style={styles.screen}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        <CategoryPicker
          isLoading={isLoading}
          errorMessage={errorMessage}
          onGenerate={generate}
          onCancel={questions.length > 0 ? () => setIsPicking(false) : undefined}
        />
      </ScrollView>
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
          <Pressable
            onPress={() => setIsPicking(true)}
            accessibilityRole="button"
            style={styles.button}
          >
            <Text style={styles.buttonText}>Choose a new category</Text>
          </Pressable>
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
  button: {
    minHeight: 50,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
