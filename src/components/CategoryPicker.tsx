import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';

const SUGGESTIONS = ['World History', 'Space', 'Movies', 'Football', 'Video Games', 'Animals'];
const MAX_CATEGORY_LENGTH = 60;

type Props = {
  isLoading: boolean;
  errorMessage: string | null;
  onGenerate: (category: string) => void;
  onCancel?: () => void;
};

export function CategoryPicker({ isLoading, errorMessage, onGenerate, onCancel }: Props) {
  const [category, setCategory] = useState('');
  const trimmed = category.trim();
  const canGenerate = trimmed.length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Pick a category
      </Text>
      <Text style={styles.subtitle}>Type anything you like, and AI will write 10 questions on it.</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        onSubmitEditing={() => canGenerate && onGenerate(trimmed)}
        editable={!isLoading}
        maxLength={MAX_CATEGORY_LENGTH}
        placeholder="e.g. Ancient Rome"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Category"
        returnKeyType="go"
        style={styles.input}
      />
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion}
            disabled={isLoading}
            onPress={() => setCategory(suggestion)}
            accessibilityRole="button"
            style={[styles.suggestion, category === suggestion && styles.suggestionSelected]}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
      {errorMessage && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
      <Pressable
        disabled={!canGenerate}
        onPress={() => onGenerate(trimmed)}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGenerate }}
        style={[styles.button, !canGenerate && styles.buttonDisabled]}
      >
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.buttonText}>Writing questions…</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Generate questions</Text>
        )}
      </Pressable>
      {onCancel && !isLoading && (
        <Pressable onPress={onCancel} accessibilityRole="button" style={styles.cancel}>
          <Text style={styles.cancelText}>Back to current questions</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
  },
  suggestionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    fontSize: 15,
    lineHeight: 21,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancel: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
