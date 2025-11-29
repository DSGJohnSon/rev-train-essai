'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { Plus, Pencil, Trash2, History, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Question } from '@/types/question';
import { Category, CategoryType } from '@/types/category';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
      } else {
        toast.error(data.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Erreur lors du chargement des questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/questions/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Question supprimée avec succès');
        setQuestions(questions.filter((q) => q._id !== deleteId));
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filtrer les questions par recherche
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Récupérer le composant d'icône
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  return (
    <>
      <Header title="Questions" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          {/* En-tête avec recherche et bouton d'ajout */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Questions</h2>
              <p className="text-sm text-slate-400 mt-1">
                Gérez vos questions de révision
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une question..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button asChild>
                <Link href="/questions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle question
                </Link>
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
              <p className="text-slate-400 mb-4">
                {searchTerm ? 'Aucune question trouvée pour cette recherche' : 'Aucune question trouvée'}
              </p>
              <Button asChild variant="outline">
                <Link href="/questions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la première question
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Titre</TableHead>
                    <TableHead className="text-slate-300">Catégories</TableHead>
                    <TableHead className="text-slate-300 text-center">Réponses</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => {
                    const questionCategories = question.categories as unknown as Category[];

                    return (
                      <TableRow
                        key={question._id}
                        className="border-slate-800 hover:bg-slate-800/50"
                      >
                        <TableCell className="font-medium text-white max-w-md">
                          <div className="truncate">{question.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {questionCategories.slice(0, 3).map((category) => {
                              const IconComponent = getIconComponent(category.icon);
                              return (
                                <Badge
                                  key={category._id}
                                  variant="secondary"
                                  className="bg-slate-800 text-slate-300"
                                >
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {category.name}
                                </Badge>
                              );
                            })}
                            {questionCategories.length > 3 && (
                              <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                                +{questionCategories.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {question.answers.length} réponses
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {format(new Date(question.createdAt), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="text-slate-400 hover:text-blue-400"
                              title="Voir l'historique"
                            >
                              <Link href={`/questions/${question._id}/history`}>
                                <History className="h-4 w-4" />
                                <span className="sr-only">Historique</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="text-slate-400 hover:text-white"
                            >
                              <Link href={`/questions/${question._id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Éditer</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(question._id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Êtes-vous sûr de vouloir supprimer cette question ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}