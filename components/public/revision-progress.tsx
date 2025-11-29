'use client';

import { Clock, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RevisionProgressProps {
  totalQuestions: number;
  validatedQuestions: number;
  currentQuestionProgress: number; // 0, 1, ou 2
  elapsedTime: number; // En secondes
  stats: {
    correctAnswers: number;
    incorrectAnswers: number;
  };
}

export default function RevisionProgress({
  totalQuestions,
  validatedQuestions,
  currentQuestionProgress,
  elapsedTime,
  stats,
}: RevisionProgressProps) {
  const progress = (validatedQuestions / totalQuestions) * 100;

  // Formater le temps en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Progression globale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {validatedQuestions} / {totalQuestions} questions validées
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Progression question actuelle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Question actuelle :</span>
          <div className="flex gap-1">
            {[0, 1].map((index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index < currentQuestionProgress
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <Badge variant="outline" className="text-xs">
            {currentQuestionProgress}/2
          </Badge>
        </div>

        {/* Statistiques temps réel */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">{stats.correctAnswers}</span>
              <span className="text-muted-foreground">bonnes</span>
            </div>
            <div className="flex items-center gap-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="font-semibold">{stats.incorrectAnswers}</span>
              <span className="text-muted-foreground">mauvaises</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(progress)}% complété
          </div>
        </div>
      </CardContent>
    </Card>
  );
}