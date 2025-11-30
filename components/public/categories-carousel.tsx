'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  icon: string;
  hasNewQuestions: boolean;
  categoryType: {
    _id: string;
    name: string;
  } | null;
}

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/public/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden pb-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Dupliquer les catégories pour créer un effet de boucle infinie
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <div className="relative">
      {/* Dégradés sur les côtés */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Conteneur avec padding pour éviter le crop */}
      <div className="overflow-hidden py-2">
        <div className="flex gap-4 animate-scroll">
          {duplicatedCategories.map((category, index) => (
            <div key={`${category._id}-${index}`} className="relative shrink-0">
              <Badge 
                variant="secondary" 
                className="px-3 py-1.5 gap-1.5 text-xs font-medium cursor-default hover:bg-secondary/80 transition-colors whitespace-nowrap"
              >
                {getIcon(category.icon)}
                <span>{category.name}</span>
              </Badge>
              {category.hasNewQuestions && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2 z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}