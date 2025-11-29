'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QuestionDisplay from '@/components/public/question-display';
import AnswerSelector from '@/components/public/answer-selector';
import RevisionProgress from '@/components/public/revision-progress';
import ExitConfirmation from '@/components/public/exit-confirmation';
import { RevisionQuestion, QuestionState } from '@/types/revision';
import { toast } from 'sonner';

interface RevisionData {
  questions: RevisionQuestion[];
  settings: {
    selectedCategories: string[];
  };
}

export default function RevisionPlayPage() {
  const router = useRouter();
  const [revisionData, setRevisionData] = useState<RevisionData | null>(null);
  const [questionStates, setQuestionStates] = useState<Map<string, QuestionState>>(new Map());
  const [currentQuestion, setCurrentQuestion] = useState<RevisionQuestion | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [stats, setStats] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
  });

  // Charger les données depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('revision-data');
    if (!data) {
      toast.error('Aucune révision en cours');
      router.push('/revision/setup');
      return;
    }

    try {
      const parsed: RevisionData = JSON.parse(data);
      setRevisionData(parsed);
      setStartTime(Date.now());

      // Initialiser l'état de chaque question
      const initialStates = new Map<string, QuestionState>();
      parsed.questions.forEach((q) => {
        initialStates.set(q._id, {
          questionId: q._id,
          correctCount: 0,
          lastAnswer: null,
          isValidated: false,
        });
      });
      setQuestionStates(initialStates);

      // Sélectionner la première question
      selectNextQuestion(parsed.questions, initialStates);
    } catch (error) {
      toast.error('Erreur lors du chargement de la révision');
      router.push('/revision/setup');
    }
  }, [router]);

  // Timer
  useEffect(() => {
    if (!startTime || !revisionData) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, revisionData]);

  // Sélectionner la prochaine question
  const selectNextQuestion = (
    questions: RevisionQuestion[],
    states: Map<string, QuestionState>
  ) => {
    // Filtrer les questions non validées
    const unvalidatedQuestions = questions.filter((q) => {
      const state = states.get(q._id);
      return !state?.isValidated;
    });

    if (unvalidatedQuestions.length === 0) {
      // Toutes les questions sont validées, terminer la révision
      finishRevision();
      return;
    }

    // Sélectionner une question aléatoire parmi les non validées
    const randomIndex = Math.floor(Math.random() * unvalidatedQuestions.length);
    setCurrentQuestion(unvalidatedQuestions[randomIndex]);
  };

  // Toggle une réponse
  const handleAnswerToggle = (answerId: string) => {
    if (isValidated) return;

    setSelectedAnswers((prev) => {
      if (prev.includes(answerId)) {
        return prev.filter((id) => id !== answerId);
      } else {
        return [...prev, answerId];
      }
    });
  };

  // Valider la réponse
  const handleValidate = async () => {
    if (!currentQuestion || selectedAnswers.length === 0) return;

    try {
      const response = await fetch(`/api/questions/${currentQuestion._id}`);
      if (!response.ok) {
        toast.error('Erreur lors de la validation');
        return;
      }

      const questionData = await response.json();
      
      if (!questionData.success || !questionData.data) {
        toast.error('Erreur lors de la récupération de la question');
        return;
      }
      
      const correct = questionData.data.correctAnswers || [];
      
      if (!correct || correct.length === 0) {
        toast.error('Erreur : réponses correctes non disponibles');
        return;
      }
      
      setCorrectAnswers(correct);

      // Vérifier si la réponse est correcte
      const isCorrect =
        selectedAnswers.length === correct.length &&
        selectedAnswers.every((id) => correct.includes(id));

      // Mettre à jour l'état de la question
      setQuestionStates((prevStates) => {
        const newStates = new Map(prevStates);
        const currentState = newStates.get(currentQuestion._id);

        if (!currentState) return newStates;

        if (isCorrect) {
          // Bonne réponse : incrémenter le compteur
          const newCorrectCount = currentState.correctCount + 1;
          newStates.set(currentQuestion._id, {
            ...currentState,
            correctCount: newCorrectCount,
            lastAnswer: 'correct',
            isValidated: newCorrectCount >= 2,
          });
        } else {
          // Mauvaise réponse : réinitialiser le compteur
          newStates.set(currentQuestion._id, {
            ...currentState,
            correctCount: 0,
            lastAnswer: 'incorrect',
            isValidated: false,
          });
        }

        return newStates;
      });

      // Mettre à jour les statistiques
      setStats((prev) => ({
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
      }));

      setIsValidated(true);
    } catch (error) {
      console.error('Error validating answer:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  // Passer à la question suivante
  const handleNext = () => {
    if (!revisionData) return;

    // Réinitialiser l'état
    setSelectedAnswers([]);
    setIsValidated(false);
    setCorrectAnswers([]);

    // Sélectionner la prochaine question
    selectNextQuestion(revisionData.questions, questionStates);
  };

  // Terminer la révision
  const finishRevision = () => {
    if (!revisionData) return;

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const validatedCount = Array.from(questionStates.values()).filter(
      (s) => s.isValidated
    ).length;

    // Stocker les résultats dans sessionStorage
    sessionStorage.setItem(
      'revision-results',
      JSON.stringify({
        stats: {
          totalAnswers: stats.correctAnswers + stats.incorrectAnswers,
          correctAnswers: stats.correctAnswers,
          incorrectAnswers: stats.incorrectAnswers,
          questionsValidated: validatedCount,
        },
        duration,
        settings: revisionData.settings,
      })
    );

    // Nettoyer les données de révision
    sessionStorage.removeItem('revision-data');

    // Rediriger vers les résultats
    router.push('/revision/results');
  };

  // Gérer la sortie
  const handleExit = () => {
    sessionStorage.removeItem('revision-data');
    router.push('/');
  };

  // Calculer le nombre de questions validées
  const validatedCount = Array.from(questionStates.values()).filter(
    (s) => s.isValidated
  ).length;

  // Obtenir la progression de la question actuelle
  const currentQuestionState = currentQuestion
    ? questionStates.get(currentQuestion._id)
    : null;

  if (!revisionData || !currentQuestion) {
    return (
      <div className="mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Chargement de la révision...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 md:py-12 md:px-6">
      <div className="space-y-6">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExitDialog(true)}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Quitter
        </Button>

        {/* Progression */}
        <RevisionProgress
          totalQuestions={revisionData.questions.length}
          validatedQuestions={validatedCount}
          currentQuestionProgress={currentQuestionState?.correctCount || 0}
          elapsedTime={elapsedTime}
          stats={stats}
        />

        {/* Question avec animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion._id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="space-y-6">
              <QuestionDisplay
                questionNumber={validatedCount + 1}
                totalQuestions={revisionData.questions.length}
                title={currentQuestion.title}
                illustration={currentQuestion.illustration}
                hasMultipleCorrectAnswers={currentQuestion.hasMultipleCorrectAnswers}
                categories={currentQuestion.categories}
              />

              <AnswerSelector
                answers={currentQuestion.answers}
                selectedAnswers={selectedAnswers}
                onAnswerToggle={handleAnswerToggle}
                onValidate={handleValidate}
                isValidated={isValidated}
                correctAnswers={isValidated ? correctAnswers : []}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bouton suivant (après validation) */}
        {isValidated && (
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleNext} className="gap-2 min-w-[200px]">
              Question suivante
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialog de confirmation de sortie */}
      <ExitConfirmation
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExit}
      />
    </div>
  );
}