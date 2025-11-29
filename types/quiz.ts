import { Question } from './question';
import { Category } from './category';

// Configuration du quiz
export interface QuizConfig {
  questionCount: number;
  selectedCategories: string[];
  bannedCategories: string[];
}

// Question pour le quiz (avec données nécessaires)
export interface QuizQuestion {
  _id: string;
  title: string;
  illustration?: string;
  answers: Array<{
    id: string;
    type: 'text' | 'image' | 'text-image';
    text?: string;
    image?: string;
    isCorrect: boolean;
  }>;
  correctAnswers: string[];
  categories: Category[];
  hasMultipleCorrectAnswers: boolean;
}

// Réponse utilisateur à une question
export interface UserAnswer {
  questionId: string;
  userAnswers: string[];
}

// Résultat d'une question
export interface QuestionResult {
  questionId: string;
  questionTitle: string;
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  categories: string[];
}

// Score du quiz
export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
}

// Session de quiz complète
export interface QuizSession {
  _id?: string;
  pseudonym: string;
  mode: 'quiz';
  score: QuizScore;
  settings: QuizConfig;
  results: QuestionResult[];
  duration: number;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// État de la session de quiz en cours
export interface QuizSessionState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Map<string, string[]>;
  startTime: number;
  settings: QuizConfig;
}

// Données pour sauvegarder une session
export interface SaveQuizSessionData {
  pseudonym: string;
  settings: QuizConfig;
  results: QuestionResult[];
  duration: number;
}

// Réponse API pour la génération de quiz
export interface GenerateQuizResponse {
  questions: QuizQuestion[];
  totalAvailable: number;
  settings: QuizConfig;
}

// Statistiques utilisateur pour le quiz
export interface QuizUserStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  recentSessions: QuizSession[];
}

// Statistiques par catégorie
export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  correct: number;
  total: number;
  percentage: number;
}