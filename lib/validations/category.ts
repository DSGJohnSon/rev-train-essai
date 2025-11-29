import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  icon: z
    .string()
    .min(1, "L'icône est requise"),
  categoryType: z
    .string()
    .min(1, 'Le type de catégorie est requis'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;