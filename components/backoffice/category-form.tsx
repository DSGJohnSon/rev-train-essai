'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { IconPicker } from './icon-picker';
import { CategoryType } from '@/types/category';
import * as LucideIcons from 'lucide-react';

interface CategoryFormProps {
  initialData?: {
    name: string;
    icon: string;
    categoryType: string;
  };
  onSubmit: (data: { name: string; icon: string; categoryType: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Enregistrer',
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [categoryType, setCategoryType] = useState(initialData?.categoryType || '');
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const response = await fetch('/api/category-types');
        const data = await response.json();

        if (data.success) {
          setCategoryTypes(data.data);
        }
      } catch (error) {
        console.error('Error fetching category types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchCategoryTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, icon, categoryType });
  };

  // Récupérer le composant d'icône pour la preview
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  const SelectedIcon = icon ? getIconComponent(icon) : null;
  const selectedType = categoryTypes.find((t) => t._id === categoryType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom de la catégorie */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-200">
          Nom de la catégorie <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Ex: Signalisation, Freinage, Électricité..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
          minLength={2}
          maxLength={100}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
        />
        <p className="text-xs text-slate-500">Entre 2 et 100 caractères</p>
      </div>

      {/* Sélecteur d'icône */}
      <div className="space-y-2">
        <Label htmlFor="icon" className="text-slate-200">
          Icône <span className="text-red-500">*</span>
        </Label>
        <IconPicker value={icon} onValueChange={setIcon} disabled={isSubmitting} />
        <p className="text-xs text-slate-500">
          Choisissez une icône pour représenter cette catégorie
        </p>
      </div>

      {/* Type de catégorie */}
      <div className="space-y-2">
        <Label htmlFor="categoryType" className="text-slate-200">
          Type de catégorie <span className="text-red-500">*</span>
        </Label>
        <Select
          value={categoryType}
          onValueChange={setCategoryType}
          disabled={isSubmitting || isLoadingTypes}
        >
          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-primary">
            <SelectValue placeholder="Sélectionner un type..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            {categoryTypes.map((type) => (
              <SelectItem
                key={type._id}
                value={type._id}
                className="text-white hover:bg-slate-800 focus:bg-slate-800"
              >
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoryTypes.length === 0 && !isLoadingTypes && (
          <p className="text-xs text-amber-500">
            Aucun type de catégorie disponible. Créez-en un d'abord.
          </p>
        )}
      </div>

      {/* Preview de la catégorie */}
      {name && icon && selectedType && (
        <Card className="border-slate-800 bg-slate-800/30">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-400 mb-3">Aperçu de la catégorie :</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              {SelectedIcon && <SelectedIcon className="h-5 w-5 text-primary" />}
              <div className="flex-1">
                <p className="font-medium text-white">{name}</p>
                <p className="text-xs text-slate-400">{selectedType.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !icon || !categoryType}
          className="flex-1"
        >
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