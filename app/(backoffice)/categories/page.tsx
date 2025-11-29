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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category, CategoryType } from '@/types/category';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/category-types'),
      ]);

      const [categoriesData, typesData] = await Promise.all([
        categoriesRes.json(),
        typesRes.json(),
      ]);

      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
      if (typesData.success) {
        setCategoryTypes(typesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Catégorie supprimée avec succès');
        setCategories(categories.filter((c) => c._id !== deleteId));
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filtrer les catégories par type
  const filteredCategories = filterType === 'all'
    ? categories
    : categories.filter((cat) => {
        const catType = cat.categoryType as CategoryType;
        return catType._id === filterType;
      });

  // Récupérer le composant d'icône
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  return (
    <>
      <Header title="Catégories" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          {/* En-tête avec bouton d'ajout et filtre */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Catégories</h2>
              <p className="text-sm text-slate-400 mt-1">
                Gérez les catégories pour organiser vos questions
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all" className="text-white hover:bg-slate-800">
                    Tous les types
                  </SelectItem>
                  {categoryTypes.map((type) => (
                    <SelectItem
                      key={type._id}
                      value={type._id}
                      className="text-white hover:bg-slate-800"
                    >
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle catégorie
                </Link>
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
              <p className="text-slate-400 mb-4">
                {filterType === 'all'
                  ? 'Aucune catégorie trouvée'
                  : 'Aucune catégorie pour ce type'}
              </p>
              <Button asChild variant="outline">
                <Link href="/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la première catégorie
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Icône</TableHead>
                    <TableHead className="text-slate-300">Nom</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Date de création</TableHead>
                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    const catType = category.categoryType as CategoryType;

                    return (
                      <TableRow
                        key={category._id}
                        className="border-slate-800 hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                            {catType.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {format(new Date(category.createdAt), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="text-slate-400 hover:text-white"
                            >
                              <Link href={`/categories/${category._id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Éditer</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(category._id)}
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
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est
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