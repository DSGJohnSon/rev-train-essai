'use client';

import { Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ResultsSummaryProps {
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  duration: number; // En secondes
}

export default function ResultsSummary({ score, duration }: ResultsSummaryProps) {
  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Déterminer le message selon le score
  const getMessage = (percentage: number): { text: string; color: string } => {
    if (percentage === 100) {
      return { text: 'Parfait ! 🎉', color: 'text-green-500' };
    } else if (percentage >= 80) {
      return { text: 'Excellent ! 🌟', color: 'text-green-500' };
    } else if (percentage >= 60) {
      return { text: 'Bien joué ! 👍', color: 'text-blue-500' };
    } else if (percentage >= 40) {
      return { text: 'Pas mal ! 💪', color: 'text-orange-500' };
    } else {
      return { text: 'Continue à réviser ! 📚', color: 'text-red-500' };
    }
  };

  const message = getMessage(score.percentage);

  return (
    <div className="space-y-6">
      {/* Score principal */}
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold">
            {score.correct} / {score.total}
          </CardTitle>
          <p className={`text-2xl font-semibold ${message.color}`}>
            {message.text}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold text-lg">{score.percentage}%</span>
            </div>
            <Progress value={score.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Réponses correctes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correctes</p>
                <p className="text-2xl font-bold text-green-500">{score.correct}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réponses incorrectes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incorrectes</p>
                <p className="text-2xl font-bold text-destructive">
                  {score.total - score.correct}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temps total */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temps</p>
                <p className="text-2xl font-bold">{formatDuration(duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}