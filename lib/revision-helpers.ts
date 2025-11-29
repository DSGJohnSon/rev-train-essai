import { QuestionState, RevisionQuestion } from '@/types/revision';

/**
 * Initialise l'état de toutes les questions pour la révision
 */
export function initializeRevision(
  questions: RevisionQuestion[]
): Map<string, QuestionState> {
  const states = new Map<string, QuestionState>();

  questions.forEach((question) => {
    states.set(question._id, {
      questionId: question._id,
      correctCount: 0,
      lastAnswer: null,
      isValidated: false,
    });
  });

  return states;
}

/**
 * Met à jour l'état d'une question après une réponse
 */
export function updateQuestionState(
  currentState: QuestionState,
  isCorrect: boolean
): QuestionState {
  if (isCorrect) {
    // Bonne réponse : incrémenter le compteur
    const newCorrectCount = currentState.correctCount + 1;
    return {
      ...currentState,
      correctCount: newCorrectCount,
      lastAnswer: 'correct',
      isValidated: newCorrectCount >= 2,
    };
  } else {
    // Mauvaise réponse : réinitialiser le compteur
    return {
      ...currentState,
      correctCount: 0,
      lastAnswer: 'incorrect',
      isValidated: false,
    };
  }
}

/**
 * Sélectionne la prochaine question à afficher
 * Retourne null si toutes les questions sont validées
 */
export function getNextQuestion(
  questions: RevisionQuestion[],
  states: Map<string, QuestionState>
): RevisionQuestion | null {
  // Filtrer les questions non validées
  const unvalidatedQuestions = questions.filter((q) => {
    const state = states.get(q._id);
    return !state?.isValidated;
  });

  if (unvalidatedQuestions.length === 0) {
    return null; // Toutes les questions sont validées
  }

  // Sélectionner une question aléatoire parmi les non validées
  const randomIndex = Math.floor(Math.random() * unvalidatedQuestions.length);
  return unvalidatedQuestions[randomIndex];
}

/**
 * Vérifie si la révision est terminée
 */
export function isRevisionComplete(states: Map<string, QuestionState>): boolean {
  return Array.from(states.values()).every((state) => state.isValidated);
}

/**
 * Calcule le nombre de questions validées
 */
export function getValidatedCount(states: Map<string, QuestionState>): number {
  return Array.from(states.values()).filter((state) => state.isValidated).length;
}

/**
 * Calcule le taux de réussite global
 */
export function calculateSuccessRate(
  correctAnswers: number,
  totalAnswers: number
): number {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
}

/**
 * Obtient les questions qui nécessitent encore du travail
 * (triées par nombre de bonnes réponses, les plus difficiles en premier)
 */
export function getQuestionsNeedingWork(
  questions: RevisionQuestion[],
  states: Map<string, QuestionState>
): Array<{ question: RevisionQuestion; state: QuestionState }> {
  return questions
    .map((q) => ({
      question: q,
      state: states.get(q._id)!,
    }))
    .filter((item) => !item.state.isValidated)
    .sort((a, b) => a.state.correctCount - b.state.correctCount);
}

/**
 * Calcule le temps moyen par question validée
 */
export function getAverageTimePerQuestion(
  duration: number,
  questionsValidated: number
): number {
  if (questionsValidated === 0) return 0;
  return Math.floor(duration / questionsValidated);
}

/**
 * Obtient un message de félicitation selon le taux de réussite
 */
export function getRevisionMessage(successRate: number): {
  text: string;
  color: string;
  emoji: string;
} {
  if (successRate === 100) {
    return { text: 'Parfait', color: 'text-green-500', emoji: '🎉' };
  } else if (successRate >= 90) {
    return { text: 'Excellent', color: 'text-green-500', emoji: '🌟' };
  } else if (successRate >= 75) {
    return { text: 'Très bien', color: 'text-blue-500', emoji: '👍' };
  } else if (successRate >= 60) {
    return { text: 'Bien', color: 'text-orange-500', emoji: '💪' };
  } else {
    return { text: 'Continue à réviser', color: 'text-red-500', emoji: '📚' };
  }
}