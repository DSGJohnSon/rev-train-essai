'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategorySelector from '@/components/public/category-selector';
import { setQuizSettings } from '@/lib/local-storage';

export default function QuizSetupPage() {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bannedCategories, setBannedCategories] = useState<string[]>([]);
  const [maxQuestions, setMaxQuestions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les stats pour connaître le nombre max de questions
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setMaxQuestions(data.totalQuestions);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, []);

  const handleCategoryChange = useCallback((selected: string[], banned: string[]) => {
    setSelectedCategories(selected);
    setBannedCategories(banned);
    setError(null);
  }, []);

  const handleStart = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (questionCount < 1) {
        setError('Le nombre de questions doit être au moins 1');
        setIsLoading(false);
        return;
      }

      if (questionCount > maxQuestions) {
        setError(`Le nombre maximum de questions disponibles est ${maxQuestions}`);
        setIsLoading(false);
        return;
      }

      // Générer le quiz
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionCount,
          selectedCategories,
          bannedCategories,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération du quiz');
      }

      const quizData = await response.json();

      // Sauvegarder les paramètres dans localStorage
      setQuizSettings({
        questionCount,
        selectedCategories,
        bannedCategories,
      });

      // Stocker les questions dans sessionStorage pour la session
      sessionStorage.setItem('quiz-data', JSON.stringify(quizData));

      // Rediriger vers la page de jeu
      router.push('/quiz/play');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl py-8 px-4 md:py-12 md:px-6 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Configuration du Quiz</h1>
          <p className="text-muted-foreground">
            Personnalisez votre session de quiz en choisissant le nombre de questions et les catégories
          </p>
        </div>

        {/* Nombre de questions */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de questions</CardTitle>
            <CardDescription>
              Choisissez combien de questions vous souhaitez dans ce quiz
              {maxQuestions > 0 && ` (maximum : ${maxQuestions})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-count">Nombre de questions</Label>
              <Input
                id="question-count"
                type="number"
                min={1}
                max={maxQuestions || 1000}
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setQuestionCount(value);
                    setError(null);
                  }
                }}
                className="max-w-xs"
              />
            </div>

            {/* Suggestions rapides */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Suggestions :</span>
              {[5, 10, 20, 50].map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestionCount(count);
                    setError(null);
                  }}
                  disabled={count > maxQuestions}
                >
                  {count}
                </Button>
              ))}
              {maxQuestions > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestionCount(maxQuestions);
                    setError(null);
                  }}
                >
                  Toutes ({maxQuestions})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sélection des catégories */}
        <CategorySelector mode="quiz" onSelectionChange={handleCategoryChange} />

        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>Génération en cours...</>
            ) : (
              <>
                Démarrer le Quiz
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Informations */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2 text-sm">
            <p className="font-semibold">💡 Comment ça marche ?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Cliquez sur une catégorie pour la <strong>sélectionner</strong> (✓)</li>
              <li>• Cliquez à nouveau pour la <strong>bannir</strong> (✗)</li>
              <li>• Cliquez une troisième fois pour la <strong>désélectionner</strong> (○)</li>
              <li>• Si aucune catégorie n'est sélectionnée, toutes seront utilisées</li>
              <li>• Les catégories bannies ne seront jamais incluses</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}