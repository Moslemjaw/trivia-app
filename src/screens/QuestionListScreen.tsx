import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuestionCard } from '../components/QuestionCard';
import { ScoreTracker } from '../components/ScoreTracker';
import { useScore } from '../context/ScoreContext';
import { QUESTIONS } from '../data/questions';
import { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Questions'>;

export function QuestionListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { answers } = useScore();
  const insets = useSafeAreaInsets();

  const filteredQuestions = useMemo(() => {
    const keywords = search.toLowerCase().split(/\s+/).filter(Boolean);
    return QUESTIONS.filter((question) => {
      const searchable = `${question.question} ${question.category}`.toLowerCase();
      return keywords.every((keyword) => searchable.includes(keyword));
    });
  }, [search]);

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
});
