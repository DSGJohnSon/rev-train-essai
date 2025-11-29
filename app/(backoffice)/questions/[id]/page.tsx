'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionForm } from '@/components/backoffice/question-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';
import { Question } from '@/types/question';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${id}`);
        const data = await response.json();

        if (data.success) {
          setQuestion(data.data);
        } else {
          toast.error(data.error || 'Question non trouvée');
          router.push('/questions');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        toast.error('Erreur lors du chargement');
        router.push('/questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id, router]);

  const handleSubmit = async (data: {
    title: string;
    illustration?: string;
    answers: any[];
    correctAnswers: string[];
    categories: string[];
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Question modifiée avec succès');
        router.push('/questions');
        router.refresh();
      } else {
        toast.error(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  return (
    <>
      <Header title="Modifier la question" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl">
          {/* Boutons de navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild className="text-slate-400 hover:text-white">
              <Link href="/questions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
            {question && (
              <Button variant="outline" asChild className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                <Link href={`/questions/${id}/history`}>
                  <History className="mr-2 h-4 w-4" />
                  Voir l'historique
                </Link>
              </Button>
            )}
          </div>

          {/* Formulaire */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Modifier la question</CardTitle>
              <CardDescription className="text-slate-400">
                Modifiez les informations de la question (version {question?.version || 1})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <FormSkeleton />
              ) : question ? (
                <QuestionForm
                  initialData={{
                    title: question.title,
                    illustration: question.illustration,
                    answers: question.answers,
                    categories: question.categories.map((c: any) =>
                      typeof c === 'string' ? c : c._id
                    ),
                  }}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  submitLabel="Enregistrer les modifications"
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}