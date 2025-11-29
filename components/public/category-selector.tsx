'use client';

import { useState, useEffect } from 'react';
import { Circle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import * as LucideIcons from 'lucide-react';
import type { CategorySelectionState } from '@/types/session';

interface Category {
  _id: string;
  name: string;
  icon: string;
  categoryType: {
    _id: string;
    name: string;
  };
}

interface CategoryWithState extends Category {
  state: CategorySelectionState;
}

interface CategorySelectorProps {
  onSelectionChange?: (selected: string[], banned: string[]) => void;
  mode?: 'quiz' | 'revision'; // En mode révision, pas de bannissement
}

export default function CategorySelector({ onSelectionChange, mode = 'quiz' }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryWithState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/public/categories');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des catégories');
        }
        const data = await response.json();
        
        // Initialiser toutes les catégories comme "unselected"
        const categoriesWithState: CategoryWithState[] = data.categories.map((cat: Category) => ({
          ...cat,
          state: 'unselected' as CategorySelectionState,
        }));
        
        setCategories(categoriesWithState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Notifier le parent des changements (seulement quand les catégories changent d'état)
  useEffect(() => {
    if (!onSelectionChange || categories.length === 0) return;
    
    const selected = categories
      .filter(cat => cat.state === 'selected')
      .map(cat => cat._id);
    
    const banned = categories
      .filter(cat => cat.state === 'banned')
      .map(cat => cat._id);
    
    onSelectionChange(selected, banned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]); // Seulement quand categories change, pas onSelectionChange

  // Gérer le clic sur une catégorie (cycle des états)
  const handleCategoryClick = (categoryId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat._id !== categoryId) return cat;

      // Cycle des états selon le mode
      if (mode === 'revision') {
        // Mode révision : unselected <-> selected (pas de banned)
        return {
          ...cat,
          state: cat.state === 'unselected' ? 'selected' : 'unselected',
        };
      } else {
        // Mode quiz : unselected -> selected -> banned -> unselected
        let newState: CategorySelectionState;
        switch (cat.state) {
          case 'unselected':
            newState = 'selected';
            break;
          case 'selected':
            newState = 'banned';
            break;
          case 'banned':
            newState = 'unselected';
            break;
          default:
            newState = 'unselected';
        }
        return { ...cat, state: newState };
      }
    }));
  };

  // Obtenir l'icône Lucide
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />;
  };

  // Obtenir le style du badge selon l'état
  const getBadgeProps = (state: CategorySelectionState) => {
    switch (state) {
      case 'selected':
        return {
          variant: 'default' as const,
          className: 'cursor-pointer hover:opacity-80 transition-opacity',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        };
      case 'banned':
        return {
          variant: 'destructive' as const,
          className: 'cursor-pointer hover:opacity-80 transition-opacity',
          icon: <XCircle className="h-3 w-3 mr-1" />,
        };
      case 'unselected':
      default:
        return {
          variant: 'secondary' as const,
          className: 'cursor-pointer hover:opacity-70 transition-opacity opacity-50',
          icon: <Circle className="h-3 w-3 mr-1" />,
        };
    }
  };

  // Grouper les catégories par type
  const groupedCategories = categories.reduce((acc, cat) => {
    const typeName = cat.categoryType.name;
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(cat);
    return acc;
  }, {} as Record<string, CategoryWithState[]>);

  // Compter les catégories par état
  const counts = {
    selected: categories.filter(c => c.state === 'selected').length,
    banned: categories.filter(c => c.state === 'banned').length,
    unselected: categories.filter(c => c.state === 'unselected').length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sélection des catégories</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélection des catégories</CardTitle>
        <CardDescription>
          {mode === 'quiz' 
            ? 'Cliquez pour sélectionner (✓), bannir (✗) ou désélectionner (○) les catégories'
            : 'Cliquez pour sélectionner (✓) ou désélectionner (○) les catégories'}
        </CardDescription>
        
        {/* Compteurs */}
        <div className="flex gap-4 text-sm pt-2">
          {counts.selected > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{counts.selected} sélectionnée{counts.selected > 1 ? 's' : ''}</span>
            </div>
          )}
          {mode === 'quiz' && counts.banned > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{counts.banned} bannie{counts.banned > 1 ? 's' : ''}</span>
            </div>
          )}
          {counts.selected === 0 && counts.banned === 0 && (
            <div className="text-muted-foreground">
              Toutes les catégories seront utilisées
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(groupedCategories).map(([typeName, cats]) => (
          <div key={typeName} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{typeName}</h4>
            <div className="flex flex-wrap gap-2">
              {cats.map(cat => {
                const badgeProps = getBadgeProps(cat.state);
                return (
                  <Badge
                    key={cat._id}
                    variant={badgeProps.variant}
                    className={badgeProps.className}
                    onClick={() => handleCategoryClick(cat._id)}
                  >
                    {badgeProps.icon}
                    {getIcon(cat.icon)}
                    <span className="ml-1">{cat.name}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}