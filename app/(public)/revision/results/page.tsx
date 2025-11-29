'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, RotateCcw, Plus, Save, Clock, Target, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import SaveScoreDialog from '@/components/public/save-score-dialog';
import { toast } from 'sonner';

interface RevisionResultsData {
  stats: {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    questionsValidated: number;
  };
  duration: number;
  settings: {
    selectedCategories: string[];
  };
}

export default function RevisionResultsPage() {
  const router = useRouter();
  const [resultsData, setResultsData] = useState<RevisionResultsData | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Charger les résultats depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('revision-results');
    if (!data) {
      toast.error('Aucun résultat disponible');
      router.push('/revision/setup');
      return;
    }

    try {
      const parsed: RevisionResultsData = JSON.parse(data);
      setResultsData(parsed);
    } catch (error) {
      toast.error('Erreur lors du chargement des résultats');
      router.push('/revision/setup');
    }
  }, [router]);

  // Formater la durée
  const formatDuration = (seconds: number): string => {
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
  };

  // Calculer le taux de réussite
  const successRate = resultsData
    ? resultsData.stats.totalAnswers > 0
      ? Math.round(
          (resultsData.stats.correctAnswers / resultsData.stats.totalAnswers) * 100
        )
      : 0
    : 0;

  // Sauvegarder la session
  const handleSaveScore = async (pseudonym: string) => {
    if (!resultsData) return;

    try {
      const response = await fetch('/api/revision/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudonym,
          settings: resultsData.settings,
          stats: resultsData.stats,
          duration: resultsData.duration,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Session sauvegardée avec succès !');
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  };

  // Recommencer
  const handleRestart = () => {
    sessionStorage.removeItem('revision-results');
    router.push('/revision/setup');
  };

  // Retour à l'accueil
  const handleHome = () => {
    sessionStorage.removeItem('revision-results');
    router.push('/');
  };

  // Déterminer le message selon le taux de réussite
  const getMessage = (rate: number): { text: string; color: string } => {
    if (rate === 100) {
      return { text: 'Parfait ! 🎉', color: 'text-green-500' };
    } else if (rate >= 90) {
      return { text: 'Excellent ! 🌟', color: 'text-green-500' };
    } else if (rate >= 75) {
      return { text: 'Très bien ! 👍', color: 'text-blue-500' };
    } else if (rate >= 60) {
      return { text: 'Bien ! 💪', color: 'text-orange-500' };
    } else {
      return { text: 'Continue à réviser ! 📚', color: 'text-red-500' };
    }
  };

  const message = getMessage(successRate);

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
          <h1 className="text-3xl font-bold tracking-tight">Révision Terminée !</h1>
          <p className="text-muted-foreground">
            Félicitations, vous avez validé toutes les questions
          </p>
        </div>

        {/* Score principal */}
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold">
              {resultsData.stats.questionsValidated} questions validées
            </CardTitle>
            <p className={`text-2xl font-semibold ${message.color}`}>
              {message.text}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Taux de réussite */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taux de réussite</span>
                <span className="font-bold text-lg">{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques détaillées */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Temps total */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps</p>
                  <p className="text-xl font-bold">{formatDuration(resultsData.duration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions validées */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validées</p>
                  <p className="text-xl font-bold text-green-500">
                    {resultsData.stats.questionsValidated}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réponses correctes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bonnes</p>
                  <p className="text-xl font-bold text-green-500">
                    {resultsData.stats.correctAnswers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réponses incorrectes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <TrendingUp className="h-6 w-6 text-destructive rotate-180" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mauvaises</p>
                  <p className="text-xl font-bold text-destructive">
                    {resultsData.stats.incorrectAnswers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de réponses</span>
              <span className="font-semibold">{resultsData.stats.totalAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Taux de réussite</span>
              <span className="font-semibold">{successRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Temps moyen par question</span>
              <span className="font-semibold">
                {resultsData.stats.questionsValidated > 0
                  ? formatDuration(
                      Math.floor(resultsData.duration / resultsData.stats.questionsValidated)
                    )
                  : '0s'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isSaved && (
            <Button
              size="lg"
              onClick={() => setShowSaveDialog(true)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder mon temps
            </Button>
          )}
          {isSaved && (
            <div className="text-center text-sm text-green-600 font-medium py-2">
              ✓ Session sauvegardée
            </div>
          )}
        </div>

        {/* Actions secondaires */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </Button>
          <Button variant="outline" onClick={() => router.push('/revision/setup')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle révision
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