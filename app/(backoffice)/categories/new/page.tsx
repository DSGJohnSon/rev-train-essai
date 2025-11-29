'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/backoffice/category-form';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { name: string; icon: string; categoryType: string }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Catégorie créée avec succès');
        router.push('/categories');
        router.refresh();
      } else {
        toast.error(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return (
    <>
      <Header title="Nouvelle catégorie" />
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
              <CardTitle className="text-white">Créer une catégorie</CardTitle>
              <CardDescription className="text-slate-400">
                Les catégories permettent d'organiser vos questions par thématique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                submitLabel="Créer la catégorie"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}