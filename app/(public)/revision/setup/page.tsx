'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, Brain, Database, ListChecks, Clock, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CategorySelector from '@/components/public/category-selector';
import { setRevisionSettings, getPseudonym } from '@/lib/local-storage';

interface RevisionStats {
  averageDuration: number | null;
  formattedDuration: string;
  sessionCount: number;
}

export default function RevisionSetupPage() {
  const router = useRouter();
  const [pseudonym, setPseudonymState] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [sessionQuestions, setSessionQuestions] = useState<number>(0);
  const [revisionStats, setRevisionStats] = useState<RevisionStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPersonalStats, setShowPersonalStats] = useState(true);

  // Charger le pseudonyme
  useEffect(() => {
    const saved = getPseudonym();
    setPseudonymState(saved);
  }, []);

  // Charger les stats pour connaître le nombre total de questions
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setTotalQuestions(data.totalQuestions);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, []);

  // Charger les stats de révision quand les catégories ou le mode changent
  useEffect(() => {
    async function fetchRevisionStats() {
      setIsLoadingStats(true);
      try {
        // Récupérer le nombre de questions pour cette sélection
        if (selectedCategories.length === 0) {
          // Si aucune catégorie sélectionnée, utiliser le total
          setSessionQuestions(totalQuestions);
        } else {
          const categoriesParam = selectedCategories.join(',');
          const countResponse = await fetch(`/api/questions/count?categories=${categoriesParam}`);
          
          if (countResponse.ok) {
            const countData = await countResponse.json();
            setSessionQuestions(countData.count);
          }

          // Récupérer les stats de temps moyen
          const statsUrl = showPersonalStats && pseudonym
            ? `/api/revision/stats?categories=${categoriesParam}&pseudonym=${encodeURIComponent(pseudonym)}`
            : `/api/revision/stats?categories=${categoriesParam}`;
          
          const statsResponse = await fetch(statsUrl);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setRevisionStats(statsData);
          }
        }
      } catch (err) {
        console.error('Error fetching revision stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchRevisionStats();
  }, [selectedCategories, showPersonalStats, pseudonym, totalQuestions]);

  const handleCategoryChange = useCallback((selected: string[]) => {
    setSelectedCategories(selected);
    setError(null);
  }, []);

  const handleStart = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Générer la session de révision
      const response = await fetch('/api/revision/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCategories,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération de la révision');
      }

      const revisionData = await response.json();

      // Sauvegarder les paramètres dans localStorage
      setRevisionSettings({
        selectedCategories,
      });

      // Stocker les questions dans sessionStorage pour la session
      sessionStorage.setItem('revision-data', JSON.stringify(revisionData));

      // Rediriger vers la page de jeu
      router.push('/revision/play');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  const canShowPersonalStats = !!pseudonym;

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 md:py-12 md:px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuration de la Révision</h1>
              <p className="text-muted-foreground">
                Sélectionnez les catégories à réviser
              </p>
            </div>
          </div>
        </div>

        {/* Informations sur le mode révision */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Comment fonctionne le mode révision ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Vous devez répondre <strong>correctement 2 fois</strong> à chaque question pour la valider</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Une <strong>erreur remet le compteur à zéro</strong> pour cette question</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Les questions sont présentées dans un <strong>ordre aléatoire</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>La session se termine quand <strong>toutes les questions sont validées</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Vous pouvez sauvegarder votre temps à la fin</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {showPersonalStats && canShowPersonalStats ? 'Vos statistiques' : 'Statistiques globales'}
            </h3>
            {canShowPersonalStats && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPersonalStats(!showPersonalStats)}
                className="gap-2"
              >
                {showPersonalStats ? (
                  <>
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Voir stats globales</span>
                    <span className="sm:hidden">Global</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Voir mes stats</span>
                    <span className="sm:hidden">Personnel</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Questions en base */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions en base</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions dans la session */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions sélectionnées</p>
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-primary">
                        {selectedCategories.length === 0 ? totalQuestions : sessionQuestions}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temps moyen */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temps moyen</p>
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : revisionStats?.averageDuration ? (
                      <p className="text-2xl font-bold text-primary">
                        {revisionStats.formattedDuration}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        Données absentes
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sélection des catégories */}
        <CategorySelector 
          mode="revision" 
          onSelectionChange={(selected) => handleCategoryChange(selected)}
        />

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
                Commencer la Révision
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Informations */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2 text-sm">
            <p className="font-semibold">💡 Conseils</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Sélectionnez les catégories que vous souhaitez réviser (✓)</li>
              <li>• Si aucune catégorie n'est sélectionnée, toutes seront utilisées</li>
              <li>• Prenez votre temps, il n'y a pas de limite</li>
              <li>• Concentrez-vous sur la mémorisation plutôt que la vitesse</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}