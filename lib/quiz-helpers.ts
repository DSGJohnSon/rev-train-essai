import { QuestionResult } from '@/types/quiz';

/**
 * Calcule le score d'un quiz
 */
export function calculateScore(results: QuestionResult[]): {
  correct: number;
  total: number;
  percentage: number;
} {
  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { correct, total, percentage };
}

/**
 * Valide si les réponses de l'utilisateur sont correctes
 */
export function validateAnswers(
  userAnswers: string[],
  correctAnswers: string[]
): boolean {
  if (userAnswers.length !== correctAnswers.length) {
    return false;
  }

  return userAnswers.every((answer) => correctAnswers.includes(answer));
}

/**
 * Formate une durée en secondes en format lisible
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Formate une durée en format MM:SS pour le timer
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mélange un tableau de manière aléatoire (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Obtient un message de félicitation selon le score
 */
export function getScoreMessage(percentage: number): {
  text: string;
  color: string;
  emoji: string;
} {
  if (percentage === 100) {
    return { text: 'Parfait', color: 'text-green-500', emoji: '🎉' };
  } else if (percentage >= 80) {
    return { text: 'Excellent', color: 'text-green-500', emoji: '🌟' };
  } else if (percentage >= 60) {
    return { text: 'Bien joué', color: 'text-blue-500', emoji: '👍' };
  } else if (percentage >= 40) {
    return { text: 'Pas mal', color: 'text-orange-500', emoji: '💪' };
  } else {
    return { text: 'Continue à réviser', color: 'text-red-500', emoji: '📚' };
  }
}

/**
 * Calcule les statistiques par catégorie
 */
export function calculateCategoryStats(
  results: QuestionResult[]
): Array<{
  categoryId: string;
  correct: number;
  total: number;
  percentage: number;
}> {
  const categoryMap = new Map<
    string,
    { correct: number; total: number }
  >();

  results.forEach((result) => {
    result.categories.forEach((categoryId) => {
      const current = categoryMap.get(categoryId) || { correct: 0, total: 0 };
      categoryMap.set(categoryId, {
        correct: current.correct + (result.isCorrect ? 1 : 0),
        total: current.total + 1,
      });
    });
  });

  return Array.from(categoryMap.entries()).map(([categoryId, stats]) => ({
    categoryId,
    correct: stats.correct,
    total: stats.total,
    percentage: Math.round((stats.correct / stats.total) * 100),
  }));
}