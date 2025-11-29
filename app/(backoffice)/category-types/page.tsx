'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
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
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryType } from '@/types/category';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CategoryTypesPage() {
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategoryTypes = async () => {
    try {
      const response = await fetch('/api/category-types');
      const data = await response.json();

      if (data.success) {
        setCategoryTypes(data.data);
      } else {
        toast.error(data.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Error fetching category types:', error);
      toast.error('Erreur lors du chargement des types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTypes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/category-types/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Type supprimé avec succès');
        setCategoryTypes(categoryTypes.filter((ct) => ct._id !== deleteId));
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting category type:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Header title="Types de catégories" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          {/* En-tête avec bouton d'ajout */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Types de catégories</h2>
              <p className="text-sm text-slate-400 mt-1">
                Gérez les types de catégories pour organiser vos questions
              </p>
            </div>
            <Button asChild>
              <Link href="/category-types/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau type
              </Link>
            </Button>
          </div>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : categoryTypes.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
              <p className="text-slate-400 mb-4">Aucun type de catégorie trouvé</p>
              <Button asChild variant="outline">
                <Link href="/category-types/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le premier type
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Nom</TableHead>
                    <TableHead className="text-slate-300">Date de création</TableHead>
                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryTypes.map((type) => (
                    <TableRow
                      key={type._id}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium text-white">
                        {type.name}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {format(new Date(type.createdAt), 'dd MMMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="text-slate-400 hover:text-white"
                          >
                            <Link href={`/category-types/${type._id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Éditer</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(type._id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Êtes-vous sûr de vouloir supprimer ce type de catégorie ? Cette action est
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