'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryViewer } from '@/components/backoffice/history-viewer';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Question, QuestionHistory } from '@/types/question';

export default function QuestionHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<QuestionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/questions/${id}/history`);
      const data = await response.json();

      if (data.success) {
        setQuestion(data.data.question);
        setHistory(data.data.history);
      } else {
        toast.error(data.error || 'Erreur lors du chargement');
        router.push('/questions');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      router.push('/questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const handleRestore = async (version: number) => {
    try {
      const response = await fetch(`/api/questions/${id}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Version restaurée avec succès');
        // Recharger l'historique
        await fetchHistory();
        // Optionnel : rediriger vers la page d'édition
        // router.push(`/questions/${id}`);
      } else {
        toast.error(data.error || 'Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  return (
    <>
      <Header title="Historique de la question" />
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
                <Link href={`/questions/${id}`}>
                  Éditer la question
                </Link>
              </Button>
            )}
          </div>

          {/* En-tête */}
          {question && (
            <Card className="border-slate-800 bg-slate-900/50 mb-6">
              <CardHeader>
                <CardTitle className="text-white">
                  {question.title}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Version actuelle : {question.version} • {history.length} version(s) dans l'historique
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Timeline de l'historique */}
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Historique des modifications
              </h2>
              <HistoryViewer
                history={history}
                currentVersion={question?.version || 1}
                onRestore={handleRestore}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}