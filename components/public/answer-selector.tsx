'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Answer {
  id: string;
  type: 'text' | 'image' | 'text-image';
  text?: string;
  image?: string;
}

interface AnswerSelectorProps {
  answers: Answer[];
  selectedAnswers: string[];
  onAnswerToggle: (answerId: string) => void;
  onValidate: () => void;
  isValidated: boolean;
  correctAnswers?: string[];
  disabled?: boolean;
}

export default function AnswerSelector({
  answers,
  selectedAnswers,
  onAnswerToggle,
  onValidate,
  isValidated,
  correctAnswers = [],
  disabled = false,
}: AnswerSelectorProps) {
  const getAnswerState = (answerId: string) => {
    if (!isValidated) {
      return selectedAnswers.includes(answerId) ? 'selected' : 'default';
    }

    const isSelected = selectedAnswers.includes(answerId);
    const isCorrect = correctAnswers.includes(answerId);

    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    if (!isSelected && isCorrect) return 'missed';
    return 'default';
  };

  const getAnswerClassName = (state: string) => {
    switch (state) {
      case 'selected':
        return 'border-primary bg-primary/10';
      case 'correct':
        return 'border-green-500 bg-green-500/10';
      case 'incorrect':
        return 'border-destructive bg-destructive/10';
      case 'missed':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-border hover:border-primary/50';
    }
  };

  const getAnswerIcon = (state: string) => {
    switch (state) {
      case 'correct':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'incorrect':
        return <X className="h-5 w-5 text-destructive" />;
      case 'missed':
        return <Check className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Liste des réponses */}
      <div className="grid gap-3 sm:grid-cols-2">
        {answers.map((answer) => {
          const state = getAnswerState(answer.id);
          const isSelected = selectedAnswers.includes(answer.id);

          return (
            <Card
              key={answer.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                getAnswerClassName(state),
                disabled && 'cursor-not-allowed opacity-60'
              )}
              onClick={() => !disabled && !isValidated && onAnswerToggle(answer.id)}
            >
              <div className="p-4 space-y-3">
                {/* Header avec ID et icône */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold',
                        state === 'selected' && 'border-primary bg-primary text-primary-foreground',
                        state === 'correct' && 'border-green-500 bg-green-500 text-white',
                        state === 'incorrect' && 'border-destructive bg-destructive text-destructive-foreground',
                        state === 'missed' && 'border-orange-500 bg-orange-500 text-white',
                        state === 'default' && 'border-muted-foreground/30'
                      )}
                    >
                      {answer.id}
                    </div>
                  </div>
                  {getAnswerIcon(state)}
                </div>

                {/* Contenu de la réponse */}
                <div className="space-y-2">
                  {/* Texte */}
                  {answer.text && (
                    <p className="text-sm leading-relaxed">{answer.text}</p>
                  )}

                  {/* Image */}
                  {answer.image && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                      <Image
                        src={answer.image}
                        alt={`Réponse ${answer.id}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bouton de validation */}
      {!isValidated && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={onValidate}
            disabled={selectedAnswers.length === 0 || disabled}
            className="min-w-[200px]"
          >
            Valider ma réponse
          </Button>
        </div>
      )}

      {/* Message après validation */}
      {isValidated && (
        <div className="text-center space-y-2">
          {selectedAnswers.every((id) => correctAnswers.includes(id)) &&
          selectedAnswers.length === correctAnswers.length ? (
            <div className="text-green-600 font-semibold text-lg">
              ✓ Bonne réponse !
            </div>
          ) : (
            <div className="text-destructive font-semibold text-lg">
              ✗ Réponse incorrecte
            </div>
          )}
        </div>
      )}
    </div>
  );
}