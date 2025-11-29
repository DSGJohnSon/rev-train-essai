import { Question } from './question';
import { Category } from './category';

// Configuration de la révision
export interface RevisionConfig {
  selectedCategories: string[];
}

// Question pour la révision (avec données nécessaires)
export interface RevisionQuestion {
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

// État d'une question en révision
export interface QuestionState {
  questionId: string;
  correctCount: number; // 0, 1, ou 2+
  lastAnswer: 'correct' | 'incorrect' | null;
  isValidated: boolean; // true si correctCount >= 2
}

// Statistiques de la session de révision
export interface RevisionStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  questionsValidated: number;
}

// Session de révision complète
export interface RevisionSession {
  _id?: string;
  pseudonym: string;
  mode: 'revision';
  settings: RevisionConfig;
  stats: RevisionStats;
  duration: number;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// État de la session de révision en cours
export interface RevisionSessionState {
  questions: RevisionQuestion[];
  questionStates: Map<string, QuestionState>;
  currentQuestion: RevisionQuestion | null;
  startTime: number;
  settings: RevisionConfig;
  stats: RevisionStats;
}

// Données pour sauvegarder une session de révision
export interface SaveRevisionSessionData {
  pseudonym: string;
  settings: RevisionConfig;
  stats: RevisionStats;
  duration: number;
}

// Réponse API pour la génération de révision
export interface GenerateRevisionResponse {
  questions: RevisionQuestion[];
  totalQuestions: number;
  settings: RevisionConfig;
}

// Statistiques utilisateur pour la révision
export interface RevisionUserStats {
  totalSessions: number;
  averageSuccessRate: number;
  bestTime: number;
  totalQuestionsValidated: number;
  recentSessions: RevisionSession[];
}

// Réponse utilisateur en révision
export interface RevisionAnswer {
  questionId: string;
  userAnswers: string[];
  isCorrect: boolean;
}