import type { Difficulty } from './data/questions';

export const colors = {
  background: '#F4F5FA',
  surface: '#FFFFFF',
  border: '#DDE0EC',
  text: '#1B1E3C',
  textMuted: '#5A6080',
  primary: '#4338CA',
  primarySoft: '#E7E6FB',
  correct: '#166534',
  correctSoft: '#DCFCE7',
  incorrect: '#B91C1C',
  incorrectSoft: '#FEE2E2',
};

export const difficultyColors: Record<Difficulty, { text: string; background: string }> = {
  Easy: { text: '#166534', background: '#DCFCE7' },
  Medium: { text: '#92400E', background: '#FEF3C7' },
  Hard: { text: '#B91C1C', background: '#FEE2E2' },
};
