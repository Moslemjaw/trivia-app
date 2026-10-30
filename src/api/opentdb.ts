import { Difficulty, Question } from '../data/questions';

// url3986 encoding returns plain text after decoding, unlike the default HTML entities.
const API_URL = 'https://opentdb.com/api.php?amount=10&encode=url3986';
const RATE_LIMIT_RETRY_MS = 5500;
const REQUEST_TIMEOUT_MS = 15000;
const RATE_LIMITED_CODE = 5;

type ApiQuestion = {
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type ApiResponse = {
  response_code: number;
  results: ApiQuestion[];
};

const DIFFICULTIES: Record<ApiQuestion['difficulty'], Difficulty> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function toQuestion(item: ApiQuestion): Question {
  const question = decodeURIComponent(item.question);
  const correctAnswer = decodeURIComponent(item.correct_answer);
  const incorrectAnswers = item.incorrect_answers.map(decodeURIComponent);
  const isTrueFalse = item.type === 'boolean';

  return {
    // The API has no ids, and question text is unique and stays the same between requests.
    id: question,
    question,
    category: decodeURIComponent(item.category),
    difficulty: DIFFICULTIES[item.difficulty],
    type: isTrueFalse ? 'True / False' : 'Multiple Choice',
    options: isTrueFalse ? ['True', 'False'] : shuffle([correctAnswer, ...incorrectAnswers]),
    correctAnswer,
  };
}

async function requestQuestions(): Promise<ApiResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    if (response.status === 429) return null;
    if (!response.ok) throw new Error(`Open Trivia DB returned status ${response.status}`);
    const data: ApiResponse = await response.json();
    return data.response_code === RATE_LIMITED_CODE ? null : data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchQuestions(): Promise<Question[]> {
  // The API allows one request every 5 seconds per IP address, so wait once and retry.
  let data = await requestQuestions();
  if (!data) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_MS));
    data = await requestQuestions();
  }
  if (!data) throw new Error('Open Trivia DB is rate limiting requests');
  if (data.response_code !== 0) {
    throw new Error(`Open Trivia DB returned response code ${data.response_code}`);
  }
  return data.results.map(toQuestion);
}
