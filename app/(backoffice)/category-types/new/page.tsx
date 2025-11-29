'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCategoryTypePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/category-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Type de catégorie créé avec succès');
        router.push('/category-types');
        router.refresh();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating category type:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Nouveau type de catégorie" />
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
              <CardTitle className="text-white">Créer un type de catégorie</CardTitle>
              <CardDescription className="text-slate-400">
                Les types permettent d'organiser vos catégories (ex: Lignes, Engin Moteur, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    disabled={isSubmitting || !name.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Création...' : 'Créer le type'}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}