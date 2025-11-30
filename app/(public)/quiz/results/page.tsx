'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, RotateCcw, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResultsSummary from '@/components/public/results-summary';
import ResultsDetails from '@/components/public/results-details';
import SaveScoreDialog from '@/components/public/save-score-dialog';
import { QuestionResult } from '@/types/quiz';
import { toast } from 'sonner';

interface QuizResultsData {
  results: QuestionResult[];
  duration: number;
  settings: {
    questionCount: number;
    selectedCategories: string[];
    bannedCategories: string[];
  };
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [resultsData, setResultsData] = useState<QuizResultsData | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Charger les résultats depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('quiz-results');
    if (!data) {
      toast.error('Aucun résultat disponible');
      router.push('/quiz/setup');
      return;
    }

    try {
      const parsed: QuizResultsData = JSON.parse(data);
      setResultsData(parsed);

      // Charger les détails des questions
      loadQuestionDetails(parsed.results);
    } catch (error) {
      toast.error('Erreur lors du chargement des résultats');
      router.push('/quiz/setup');
    }
  }, [router]);

  // Charger les détails des questions
  const loadQuestionDetails = async (results: QuestionResult[]) => {
    try {
      const questionPromises = results.map((result) =>
        fetch(`/api/questions/${result.questionId}`)
          .then((res) => res.json())
          .catch((error) => {
            console.error(`Error fetching question ${result.questionId}:`, error);
            return { success: false, error: 'Network error' };
          })
      );

      const questionsResponses = await Promise.all(questionPromises);
      
      // Extraire les données et logger les erreurs
      const questionsData = questionsResponses
        .map((response, index) => {
          if (response.success && response.data) {
            return response.data;
          } else {
            console.error(
              `Question ${results[index].questionId} not loaded:`,
              response.error || 'Unknown error'
            );
            return null;
          }
        })
        .filter((q) => q !== null);
      
      setQuestions(questionsData);
      
      // Afficher un avertissement si certaines questions n'ont pas pu être chargées
      const failedCount = questionsResponses.filter((r) => !r.success).length;
      if (failedCount > 0) {
        toast.warning(
          `${failedCount} question(s) n'ont pas pu être chargées. Vérifiez la console pour plus de détails.`
        );
      }
    } catch (error) {
      console.error('Error loading question details:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  // Calculer le score
  const score = resultsData
    ? {
        correct: resultsData.results.filter((r) => r.isCorrect).length,
        total: resultsData.results.length,
        percentage: Math.round(
          (resultsData.results.filter((r) => r.isCorrect).length /
            resultsData.results.length) *
            100
        ),
      }
    : { correct: 0, total: 0, percentage: 0 };

  // Sauvegarder le score
  const handleSaveScore = async (pseudonym: string) => {
    if (!resultsData) return;

    try {
      const response = await fetch('/api/quiz/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudonym,
          settings: resultsData.settings,
          results: resultsData.results,
          duration: resultsData.duration,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Score sauvegardé avec succès !');
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  };

  // Rejouer avec les mêmes paramètres
  const handleReplay = () => {
    if (!resultsData) return;

    // Regénérer un quiz avec les mêmes paramètres
    router.push('/quiz/setup');
    // Note: Les paramètres sont déjà sauvegardés dans localStorage
  };

  // Nouveau quiz
  const handleNewQuiz = () => {
    sessionStorage.removeItem('quiz-results');
    router.push('/quiz/setup');
  };

  // Retour à l'accueil
  const handleHome = () => {
    sessionStorage.removeItem('quiz-results');
    router.push('/');
  };

  if (!resultsData) {
    return (
      <div className="mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 md:py-12 md:px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Résultats du Quiz</h1>
          <p className="text-muted-foreground">
            Voici votre performance pour ce quiz
          </p>
        </div>

        {/* Résumé */}
        <ResultsSummary score={score} duration={resultsData.duration} />

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isSaved && (
            <Button
              size="lg"
              onClick={() => setShowSaveDialog(true)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder mon score
            </Button>
          )}
          {isSaved && (
            <div className="text-center text-sm text-green-600 font-medium py-2">
              ✓ Score sauvegardé
            </div>
          )}
        </div>

        {/* Détails des questions */}
        {questions.length > 0 && (
          <ResultsDetails results={resultsData.results} questions={questions} />
        )}

        {/* Actions secondaires */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button variant="outline" onClick={handleReplay} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Rejouer avec les mêmes paramètres
          </Button>
          <Button variant="outline" onClick={handleNewQuiz} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau quiz
          </Button>
          <Button variant="ghost" onClick={handleHome} className="gap-2">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>

      {/* Dialog de sauvegarde */}
      <SaveScoreDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveScore}
      />
    </div>
  );
}