'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/backoffice/category-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Category, CategoryType } from '@/types/category';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${id}`);
        const data = await response.json();

        if (data.success) {
          setCategory(data.data);
        } else {
          toast.error(data.error || 'Catégorie non trouvée');
          router.push('/categories');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Erreur lors du chargement');
        router.push('/categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, router]);

  const handleSubmit = async (data: { name: string; icon: string; categoryType: string }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Catégorie modifiée avec succès');
        router.push('/categories');
        router.refresh();
      } else {
        toast.error(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  const catType = category?.categoryType as CategoryType | undefined;

  return (
    <>
      <Header title="Modifier la catégorie" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          {/* Bouton retour */}
          <Button variant="ghost" asChild className="mb-4 text-slate-400 hover:text-white">
            <Link href="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          {/* Formulaire */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Modifier la catégorie</CardTitle>
              <CardDescription className="text-slate-400">
                Modifiez les informations de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <FormSkeleton />
              ) : category ? (
                <CategoryForm
                  initialData={{
                    name: category.name,
                    icon: category.icon,
                    categoryType: catType?._id || '',
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