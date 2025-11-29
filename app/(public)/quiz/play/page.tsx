'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QuestionDisplay from '@/components/public/question-display';
import AnswerSelector from '@/components/public/answer-selector';
import QuizProgress from '@/components/public/quiz-progress';
import ExitConfirmation from '@/components/public/exit-confirmation';
import { QuizQuestion, QuestionResult } from '@/types/quiz';
import { toast } from 'sonner';

interface QuizData {
  questions: QuizQuestion[];
  settings: {
    questionCount: number;
    selectedCategories: string[];
    bannedCategories: string[];
  };
}

export default function QuizPlayPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  // Charger les données du quiz depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('quiz-data');
    if (!data) {
      toast.error('Aucun quiz en cours');
      router.push('/quiz/setup');
      return;
    }

    try {
      const parsed: QuizData = JSON.parse(data);
      setQuizData(parsed);
      setStartTime(Date.now());
    } catch (error) {
      toast.error('Erreur lors du chargement du quiz');
      router.push('/quiz/setup');
    }
  }, [router]);

  // Timer
  useEffect(() => {
    if (!startTime || !quizData) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, quizData]);

  // Récupérer la question actuelle
  const currentQuestion = quizData?.questions[currentQuestionIndex];

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

    // Récupérer les vraies réponses correctes depuis le backend
    try {
      const response = await fetch(`/api/questions/${currentQuestion._id}`);
      if (!response.ok) {
        toast.error('Erreur lors de la validation');
        return;
      }

      const questionData = await response.json();
      
      // L'API retourne { success: true, data: question }
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

      // Sauvegarder le résultat
      const result: QuestionResult = {
        questionId: currentQuestion._id,
        questionTitle: currentQuestion.title,
        userAnswers: [...selectedAnswers],
        correctAnswers: correct,
        isCorrect,
        categories: currentQuestion.categories.map((c) => c._id),
      };

      setResults((prev) => [...prev, result]);
      setIsValidated(true);
    } catch (error) {
      console.error('Error validating answer:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  // Passer à la question suivante
  const handleNext = () => {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      // Question suivante
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswers([]);
      setIsValidated(false);
      setCorrectAnswers([]);
    } else {
      // Fin du quiz
      finishQuiz();
    }
  };

  // Terminer le quiz
  const finishQuiz = () => {
    if (!quizData) return;

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Stocker les résultats dans sessionStorage
    sessionStorage.setItem(
      'quiz-results',
      JSON.stringify({
        results,
        duration,
        settings: quizData.settings,
      })
    );

    // Nettoyer les données du quiz
    sessionStorage.removeItem('quiz-data');

    // Rediriger vers les résultats
    router.push('/quiz/results');
  };

  // Gérer la sortie
  const handleExit = () => {
    sessionStorage.removeItem('quiz-data');
    router.push('/');
  };

  if (!quizData || !currentQuestion) {
    return (
      <div className="mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Chargement du quiz...</p>
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
        <QuizProgress
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={quizData.questions.length}
          elapsedTime={elapsedTime}
        />

        {/* Question avec animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="space-y-6">
              <QuestionDisplay
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quizData.questions.length}
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
              {currentQuestionIndex < quizData.questions.length - 1
                ? 'Question suivante'
                : 'Voir les résultats'}
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