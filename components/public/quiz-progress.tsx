'use client';

import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedTime: number; // En secondes
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
  elapsedTime,
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  // Formater le temps en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Question {currentQuestion} sur {totalQuestions}
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% complété</span>
          <span>{totalQuestions - currentQuestion} restante{totalQuestions - currentQuestion > 1 ? 's' : ''}</span>
        </div>
      </CardContent>
    </Card>
  );
}