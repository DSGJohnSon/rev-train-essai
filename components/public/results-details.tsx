'use client';

import Image from 'next/image';
import { Check, X, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionResult } from '@/types/quiz';

interface ResultsDetailsProps {
  results: QuestionResult[];
  questions: Array<{
    _id: string;
    title: string;
    illustration?: string;
    answers: Array<{
      id: string;
      type: 'text' | 'image' | 'text-image';
      text?: string;
      image?: string;
    }>;
    categories: Array<{
      _id: string;
      name: string;
      icon: string;
    }>;
  }>;
}

export default function ResultsDetails({ results, questions }: ResultsDetailsProps) {
  // Séparer les questions incorrectes et correctes
  const incorrectResults = results.filter((r) => !r.isCorrect);
  const correctResults = results.filter((r) => r.isCorrect);

  const renderQuestionDetail = (result: QuestionResult, index: number) => {
    const question = questions.find((q) => q._id === result.questionId);
    if (!question) return null;

    const isCorrect = result.isCorrect;

    return (
      <AccordionItem key={result.questionId} value={`question-${index}`}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 text-left w-full">
            {/* Icône résultat */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isCorrect
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {isCorrect ? (
                <Check className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </div>

            {/* Titre */}
            <div className="flex-1">
              <p className="font-medium line-clamp-2">{result.questionTitle}</p>
            </div>

            {/* Badge */}
            <Badge variant={isCorrect ? 'default' : 'destructive'}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-4 pt-4">
            {/* Image illustration */}
            {question.illustration && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={question.illustration}
                  alt="Illustration"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            {/* Catégories */}
            {question.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.categories.map((cat) => (
                  <Badge key={cat._id} variant="secondary" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Réponses */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Réponses :</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.answers.map((answer) => {
                  const wasSelected = result.userAnswers.includes(answer.id);
                  const isCorrectAnswer = result.correctAnswers.includes(answer.id);

                  let state: 'correct' | 'incorrect' | 'missed' | 'default' = 'default';
                  if (wasSelected && isCorrectAnswer) state = 'correct';
                  else if (wasSelected && !isCorrectAnswer) state = 'incorrect';
                  else if (!wasSelected && isCorrectAnswer) state = 'missed';

                  return (
                    <div
                      key={answer.id}
                      className={`rounded-lg border-2 p-3 ${
                        state === 'correct'
                          ? 'border-green-500 bg-green-500/10'
                          : state === 'incorrect'
                          ? 'border-destructive bg-destructive/10'
                          : state === 'missed'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* ID de la réponse */}
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            state === 'correct'
                              ? 'bg-green-500 text-white'
                              : state === 'incorrect'
                              ? 'bg-destructive text-destructive-foreground'
                              : state === 'missed'
                              ? 'bg-orange-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {answer.id}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 space-y-2">
                          {answer.text && (
                            <p className="text-sm">{answer.text}</p>
                          )}
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

                        {/* Icône état */}
                        {state === 'correct' && (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        {state === 'incorrect' && (
                          <X className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                        {state === 'missed' && (
                          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explication */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              {isCorrect ? (
                <p className="text-green-600 font-medium">
                  ✓ Vous avez correctement répondu à cette question
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-destructive font-medium">
                    ✗ Votre réponse était incorrecte
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Les réponses correctes sont marquées en vert, vos erreurs en rouge, et les réponses correctes que vous avez manquées en orange.
                  </p>
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails des questions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Questions incorrectes en premier */}
        {incorrectResults.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <X className="h-4 w-4" />
              Questions incorrectes ({incorrectResults.length})
            </div>
            <Accordion type="single" collapsible className="w-full">
              {incorrectResults.map((result, index) =>
                renderQuestionDetail(result, index)
              )}
            </Accordion>
          </div>
        )}

        {/* Questions correctes */}
        {correctResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <Check className="h-4 w-4" />
              Questions correctes ({correctResults.length})
            </div>
            <Accordion type="single" collapsible className="w-full">
              {correctResults.map((result, index) =>
                renderQuestionDetail(result, incorrectResults.length + index)
              )}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}