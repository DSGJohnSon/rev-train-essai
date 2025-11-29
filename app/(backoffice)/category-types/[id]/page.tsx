'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryType } from '@/types/category';

export default function EditCategoryTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categoryType, setCategoryType] = useState<CategoryType | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategoryType = async () => {
      try {
        const response = await fetch(`/api/category-types/${id}`);
        const data = await response.json();

        if (data.success) {
          setCategoryType(data.data);
          setName(data.data.name);
        } else {
          toast.error(data.error || 'Type non trouvé');
          router.push('/category-types');
        }
      } catch (error) {
        console.error('Error fetching category type:', error);
        toast.error('Erreur lors du chargement');
        router.push('/category-types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryType();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/category-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Type modifié avec succès');
        router.push('/category-types');
        router.refresh();
      } else {
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error updating category type:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Modifier le type de catégorie" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          {/* Bouton retour */}
          <Button variant="ghost" asChild className="mb-4 text-slate-400 hover:text-white">
            <Link href="/category-types">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          {/* Formulaire */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Modifier le type de catégorie</CardTitle>
              <CardDescription className="text-slate-400">
                Modifiez les informations du type de catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <FormSkeleton />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Nom du type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ex: Lignes, Engin Moteur, Anomalies..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      required
                      minLength={2}
                      maxLength={50}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                    />
                    <p className="text-xs text-slate-500">
                      Entre 2 et 50 caractères
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || name === categoryType?.name}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Modification...' : 'Enregistrer les modifications'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/category-types')}
                      disabled={isSubmitting}
                      className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}