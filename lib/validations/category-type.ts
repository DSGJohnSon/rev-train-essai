import { z } from 'zod';

export const categoryTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .trim(),
});

export type CategoryTypeFormData = z.infer<typeof categoryTypeSchema>;