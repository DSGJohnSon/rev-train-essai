import { QuizSession } from './quiz';
import { RevisionSession } from './revision';

// Type union pour toutes les sessions
export type Session = QuizSession | RevisionSession;

// Type de mode de jeu
export type GameMode = 'quiz' | 'revision';

// Statistiques publiques globales
export interface PublicStats {
  totalQuestions: number;
  totalCategories: number;
  totalCategoryTypes: number;
  questionsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    count: number;
  }>;
  questionsByCategoryType: Array<{
    typeId: string;
    typeName: string;
    count: number;
  }>;
}

// Données de pseudonyme stockées en localStorage
export interface PseudonymData {
  pseudonym: string;
  lastUsed: string; // ISO date string
}

// Paramètres de quiz stockés en localStorage
export interface StoredQuizSettings {
  questionCount: number;
  selectedCategories: string[];
  bannedCategories: string[];
  lastUsed: string; // ISO date string
}

// Paramètres de révision stockés en localStorage
export interface StoredRevisionSettings {
  selectedCategories: string[];
  lastUsed: string; // ISO date string
}

// État de catégorie dans le sélecteur
export type CategorySelectionState = 'unselected' | 'selected' | 'banned';

// Catégorie avec son état de sélection
export interface SelectableCategory {
  _id: string;
  name: string;
  icon: string;
  categoryType: {
    _id: string;
    name: string;
  };
  state: CategorySelectionState;
}

// Résultat de validation de réponse
export interface AnswerValidation {
  isCorrect: boolean;
  userAnswers: string[];
  correctAnswers: string[];
  message?: string;
}