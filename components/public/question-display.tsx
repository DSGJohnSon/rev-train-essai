'use client';

import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuestionDisplayProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  illustration?: string;
  hasMultipleCorrectAnswers: boolean;
  categories: Array<{
    _id: string;
    name: string;
    icon: string;
  }>;
}

export default function QuestionDisplay({
  questionNumber,
  totalQuestions,
  title,
  illustration,
  hasMultipleCorrectAnswers,
  categories,
}: QuestionDisplayProps) {
  return (
    <Card>
      <CardHeader className="space-y-4">
        {/* Numéro de question */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-base">
            Question {questionNumber} / {totalQuestions}
          </Badge>
          {hasMultipleCorrectAnswers && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Plusieurs réponses possibles
            </Badge>
          )}
        </div>

        {/* Catégories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat._id} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Titre de la question */}
        <div className="text-lg font-medium leading-relaxed">{title}</div>

        {/* Image illustration (si présente) */}
        {illustration && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={illustration}
              alt="Illustration de la question"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}