'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, FolderTree } from 'lucide-react';
import PseudonymManager from '@/components/public/pseudonym-manager';
import ModeSelector from '@/components/public/mode-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicStats {
  totalQuestions: number;
  totalCategories: number;
  totalCategoryTypes: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalQuestions: data.totalQuestions,
            totalCategories: data.totalCategories,
            totalCategoryTypes: data.totalCategoryTypes,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="py-8 px-4 md:py-12 md:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Entraînez-vous pour réussir
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Testez vos connaissances avec nos quiz ou révisez en profondeur avec le mode révision
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catégories</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thèmes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalCategoryTypes || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestion du pseudonyme */}
        <div className="flex justify-center">
          <PseudonymManager />
        </div>

        {/* Sélection du mode */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choisissez votre mode d'entraînement</h2>
          <ModeSelector />
        </div>

        {/* Informations supplémentaires */}
        <Card className="bg-muted/50">
          <CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">💡 Conseils</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Définissez un pseudonyme pour sauvegarder vos scores</li>
              <li>• Le mode Quiz est idéal pour tester vos connaissances rapidement</li>
              <li>• Le mode Révision vous aide à mémoriser durablement</li>
              <li>• Vous pouvez filtrer les questions par catégorie dans les deux modes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}