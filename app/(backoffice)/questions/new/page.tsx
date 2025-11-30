'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionForm } from '@/components/backoffice/question-form';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    illustration?: string;
    answers: any[];
    correctAnswers: string[];
    categories: string[];
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Question créée avec succès');
        router.push('/questions');
        router.refresh();
      } else {
        toast.error(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  return (
    <>
      <Header title="Nouvelle question" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <Button variant="ghost" asChild className="mb-4 text-slate-400 hover:text-white">
            <Link href="/questions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          {/* Formulaire */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Créer une question</CardTitle>
              <CardDescription className="text-slate-400">
                Ajoutez une nouvelle question à votre base de données de révision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                submitLabel="Créer la question"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}