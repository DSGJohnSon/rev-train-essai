'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, Brain, Clock, CheckCircle2, Users, User, Medal } from 'lucide-react';
import PseudonymManager from '@/components/public/pseudonym-manager';
import ModeSelector from '@/components/public/mode-selector';
import CategoriesCarousel from '@/components/public/categories-carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getPseudonym } from '@/lib/local-storage';
import { Badge } from '@/components/ui/badge';

interface QuizAverage {
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  duration: number;
  sessionCount: number;
}

interface RevisionAverage {
  stats: {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    questionsValidated: number;
  };
  successRate: number;
  duration: number;
  formattedDuration: string;
  sessionCount: number;
}

interface LeaderboardEntry {
  _id: string;
  pseudonym: string;
  mode: 'quiz' | 'revision';
  score: number;
  details: string;
  duration: number;
  completedAt: string;
}

export default function HomePage() {
  const [pseudonym, setPseudonymState] = useState<string | null>(null);
  const [quizAverage, setQuizAverage] = useState<QuizAverage | null>(null);
  const [revisionAverage, setRevisionAverage] = useState<RevisionAverage | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [showPersonalStats, setShowPersonalStats] = useState(true);

  useEffect(() => {
    const saved = getPseudonym();
    setPseudonymState(saved);
  }, []);

  useEffect(() => {
    async function fetchAverages() {
      setIsLoading(true);
      
      try {
        // Construire les URLs avec ou sans pseudonyme selon le mode
        const quizUrl = showPersonalStats && pseudonym
          ? `/api/quiz/stats?pseudonym=${encodeURIComponent(pseudonym)}`
          : '/api/quiz/stats';
        
        const revisionUrl = showPersonalStats && pseudonym
          ? `/api/revision/last-session?pseudonym=${encodeURIComponent(pseudonym)}`
          : '/api/revision/last-session';

        // Récupérer la moyenne des quiz
        const quizResponse = await fetch(quizUrl);
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          setQuizAverage(quizData.average);
        }

        // Récupérer la moyenne des révisions
        const revisionResponse = await fetch(revisionUrl);
        if (revisionResponse.ok) {
          const revisionData = await revisionResponse.json();
          setRevisionAverage(revisionData.average);
        }
      } catch (error) {
        console.error('Error fetching averages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAverages();
  }, [pseudonym, showPersonalStats]);

  // Charger le leaderboard
  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoadingLeaderboard(true);
      try {
        const response = await fetch('/api/leaderboard?limit=5');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canShowPersonalStats = !!pseudonym;

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <div className="py-8 px-4 md:py-12 md:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Visons l'habilitation,
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Testez vos connaissances sur les EM & Lignes à acquérir chez RegioRail.
          </p>
        </div>

        {/* Carrousel de catégories */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">Catégories disponibles</h3>
          <CategoriesCarousel />
        </div>
        
        {/* Gestion du pseudonyme */}
        <div className="flex justify-center">
          <PseudonymManager onPseudonymChange={(newPseudonym) => setPseudonymState(newPseudonym)} />
        </div>

        {/* Moyennes des scores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              {showPersonalStats && canShowPersonalStats ? 'Vos moyennes de scores' : 'Moyennes de scores globales'}
            </h2>
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
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dernier Quiz */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Mode Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : quizAverage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary">
                        {quizAverage.score.percentage}%
                      </span>
                      <Badge variant={quizAverage.score.percentage >= 80 ? "default" : quizAverage.score.percentage >= 50 ? "secondary" : "destructive"}>
                        {quizAverage.score.correct}/{quizAverage.score.total}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(quizAverage.duration)}</span>
                      </div>
                      <div className="text-xs">
                        Moyenne sur {quizAverage.sessionCount} session{quizAverage.sessionCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {showPersonalStats && canShowPersonalStats
                      ? 'Aucun quiz complété pour le moment'
                      : 'Aucun quiz enregistré'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Dernière Révision */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Mode Révision
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : revisionAverage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary">
                        {revisionAverage.successRate}%
                      </span>
                      <Badge variant={revisionAverage.successRate >= 80 ? "default" : revisionAverage.successRate >= 50 ? "secondary" : "destructive"}>
                        {revisionAverage.stats.correctAnswers}/{revisionAverage.stats.totalAnswers}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{revisionAverage.stats.questionsValidated} questions validées</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{revisionAverage.formattedDuration}</span>
                      </div>
                      <div className="text-xs">
                        Moyenne sur {revisionAverage.sessionCount} session{revisionAverage.sessionCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {showPersonalStats && canShowPersonalStats
                      ? 'Aucune révision complétée pour le moment'
                      : 'Aucune révision enregistrée'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Sélection du mode */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choisissez votre mode d'entraînement</h2>
          <ModeSelector />
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top 5 des meilleurs scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingLeaderboard ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry._id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8">
                      {getMedalIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{entry.pseudonym}</p>
                        <Badge variant="outline" className="text-xs">
                          {entry.mode === 'quiz' ? 'Quiz' : 'Révision'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{entry.score}%</p>
                      <p className="text-xs text-muted-foreground">{formatDuration(entry.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun score enregistré pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card className="bg-muted/50">
          <CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">💡 Conseils</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Définissez un pseudonyme pour sauvegarder vos scores</li>
              <li>• Le mode Quiz est idéal pour tester vos connaissances rapidement</li>
              <li>• Le mode Révision vous aide à mémoriser durablement</li>
              <li>• Vous pouvez filtrer les questions par catégorie dans les deux modes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}