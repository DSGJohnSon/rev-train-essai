'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './image-upload';
import { AnswerBuilder } from './answer-builder';
import { Answer, AnswerId } from '@/types/question';
import { Category, CategoryType } from '@/types/category';
import * as LucideIcons from 'lucide-react';

interface QuestionFormProps {
  initialData?: {
    title: string;
    illustration?: string;
    answers: Answer[];
    categories: string[];
  };
  onSubmit: (data: {
    title: string;
    illustration?: string;
    answers: Answer[];
    correctAnswers: string[];
    categories: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Enregistrer',
}: QuestionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [illustration, setIllustration] = useState(initialData?.illustration || '');
  const [answers, setAnswers] = useState<Answer[]>(
    initialData?.answers || [
      { id: 'A', type: 'text', text: '', isCorrect: false },
      { id: 'B', type: 'text', text: '', isCorrect: false },
    ]
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();

        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client
    if (title.length < 10) {
      return;
    }

    if (answers.length < 2 || answers.length > 6) {
      return;
    }

    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount === 0 || correctCount === answers.length) {
      return;
    }

    if (selectedCategories.length === 0) {
      return;
    }

    // Calculer les correctAnswers à partir des réponses
    const correctAnswers = answers.filter((a) => a.isCorrect).map((a) => a.id);

    await onSubmit({
      title,
      illustration: illustration || undefined,
      answers,
      correctAnswers,
      categories: selectedCategories,
    });
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Grouper les catégories par type
  const categoriesByType = categories.reduce((acc, category) => {
    const catType = category.categoryType as CategoryType;
    const typeName = catType.name;

    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  // Récupérer le composant d'icône
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  const isFormValid =
    title.length >= 10 &&
    answers.length >= 2 &&
    answers.length <= 6 &&
    answers.filter((a) => a.isCorrect).length >= 1 &&
    answers.filter((a) => !a.isCorrect).length >= 1 &&
    selectedCategories.length >= 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Informations générales */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">1. Informations générales</h3>
          <p className="text-sm text-slate-400">Définissez le titre et l'illustration de la question</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-200">
            Titre de la question <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="title"
            placeholder="Entrez le titre de la question..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            minLength={10}
            maxLength={500}
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary min-h-[100px]"
          />
          <p className="text-xs text-slate-500">
            {title.length}/500 caractères (minimum 10)
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Image d'illustration (optionnel)</Label>
          <ImageUpload
            value={illustration}
            onChange={setIllustration}
            onRemove={() => setIllustration('')}
            folder="questions"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Section 2: Réponses */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">2. Réponses proposées</h3>
          <p className="text-sm text-slate-400">
            Ajoutez entre 2 et 6 réponses. Au moins une doit être correcte et une incorrecte.
          </p>
        </div>

        <AnswerBuilder value={answers} onChange={setAnswers} disabled={isSubmitting} />
      </div>

      <Separator className="bg-slate-800" />

      {/* Section 3: Catégories */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">3. Catégories</h3>
          <p className="text-sm text-slate-400">
            Sélectionnez au moins une catégorie pour cette question
          </p>
        </div>

        {isLoadingCategories ? (
          <div className="text-sm text-slate-400">Chargement des catégories...</div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200">
              Aucune catégorie disponible. Créez des catégories avant de créer une question.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categoriesByType).map(([typeName, cats]) => (
              <div key={typeName} className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">{typeName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cats.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    const isSelected = selectedCategories.includes(category._id);

                    return (
                      <div
                        key={category._id}
                        onClick={() => !isSubmitting && toggleCategory(category._id)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                          ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }
                          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div
                          className={`
                            h-4 w-4 rounded border flex items-center justify-center
                            ${isSelected ? 'bg-primary border-primary' : 'border-slate-600'}
                          `}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <IconComponent
                          className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-slate-400'}`}
                        />
                        <span
                          className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}
                        >
                          {category.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-slate-400">Sélectionnées :</span>
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c._id === catId);
                  if (!category) return null;

                  const IconComponent = getIconComponent(category.icon);

                  return (
                    <Badge
                      key={catId}
                      variant="secondary"
                      className="bg-primary/20 text-primary border-primary/30"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {category.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Separator className="bg-slate-800" />

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || !isFormValid} className="flex-1">
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}