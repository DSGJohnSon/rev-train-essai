import { z } from 'zod';

const answerSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  type: z.enum(['text', 'image', 'text-image']),
  text: z.string().optional(),
  image: z.string().optional(),
  isCorrect: z.boolean(),
}).refine(
  (data) => {
    // Si type text ou text-image, le texte est requis
    if (data.type === 'text' || data.type === 'text-image') {
      return !!data.text && data.text.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Le texte est requis pour ce type de réponse',
  }
).refine(
  (data) => {
    // Si type image ou text-image, l'image est requise
    if (data.type === 'image' || data.type === 'text-image') {
      return !!data.image;
    }
    return true;
  },
  {
    message: 'L\'image est requise pour ce type de réponse',
  }
);

export const questionSchema = z.object({
  title: z
    .string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(500, 'Le titre ne peut pas dépasser 500 caractères')
    .trim(),
  illustration: z.string().optional(),
  answers: z
    .array(answerSchema)
    .min(2, 'Au moins 2 réponses sont requises')
    .max(6, 'Maximum 6 réponses autorisées'),
  correctAnswers: z
    .array(z.string())
    .min(1, 'Au moins une réponse correcte est requise'),
  categories: z
    .array(z.string())
    .min(1, 'Au moins une catégorie est requise'),
}).refine(
  (data) => {
    // Vérifier qu'il y a au moins une réponse incorrecte
    const correctCount = data.answers.filter((a) => a.isCorrect).length;
    return correctCount < data.answers.length;
  },
  {
    message: 'Au moins une réponse incorrecte est requise',
    path: ['answers'],
  }
).refine(
  (data) => {
    // Vérifier que les IDs des réponses correctes correspondent aux réponses
    const answerIds = data.answers.map((a) => a.id as string);
    return data.correctAnswers.every((id) => answerIds.includes(id));
  },
  {
    message: 'Les réponses correctes doivent correspondre aux réponses fournies',
    path: ['correctAnswers'],
  }
);

export type QuestionFormData = z.infer<typeof questionSchema>;