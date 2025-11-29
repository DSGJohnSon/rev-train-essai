import { z } from 'zod';

// Validation pour la configuration de la révision
export const revisionConfigSchema = z.object({
  selectedCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
    .optional()
    .default([]),
});

export type RevisionConfig = z.infer<typeof revisionConfigSchema>;

// Validation pour la génération d'une session de révision
export const generateRevisionSchema = z.object({
  selectedCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
    .optional()
    .default([]),
});

export type GenerateRevision = z.infer<typeof generateRevisionSchema>;

// Validation pour l'état d'une question en révision
export const questionStateSchema = z.object({
  questionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de question invalide'),
  correctCount: z
    .number()
    .int()
    .min(0, 'Le compteur doit être positif')
    .max(2, 'Maximum 2 réponses correctes requises'),
  isValidated: z.boolean(),
});

export type QuestionState = z.infer<typeof questionStateSchema>;

// Validation pour la sauvegarde d'une session de révision
export const saveRevisionSessionSchema = z.object({
  pseudonym: z
    .string()
    .trim()
    .min(2, 'Le pseudonyme doit contenir au moins 2 caractères')
    .max(50, 'Le pseudonyme ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-Z0-9_\-\s]+$/,
      'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'
    ),
  settings: revisionConfigSchema,
  stats: z.object({
    totalAnswers: z
      .number()
      .int()
      .min(0, 'Le nombre de réponses doit être positif'),
    correctAnswers: z
      .number()
      .int()
      .min(0, 'Le nombre de réponses correctes doit être positif'),
    incorrectAnswers: z
      .number()
      .int()
      .min(0, 'Le nombre de réponses incorrectes doit être positif'),
    questionsValidated: z
      .number()
      .int()
      .min(0, 'Le nombre de questions validées doit être positif'),
  }),
  duration: z
    .number()
    .int()
    .min(0, 'La durée doit être positive')
    .max(86400, 'La durée ne peut pas dépasser 24 heures'),
});

export type SaveRevisionSession = z.infer<typeof saveRevisionSessionSchema>;

// Validation pour la réponse de génération de révision
export const revisionResponseSchema = z.object({
  questions: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      illustration: z.string().optional(),
      answers: z.array(
        z.object({
          id: z.string(),
          type: z.enum(['text', 'image', 'text-image']),
          text: z.string().optional(),
          image: z.string().optional(),
          isCorrect: z.boolean(),
        })
      ),
      correctAnswers: z.array(z.string()),
      categories: z.array(z.any()),
      hasMultipleCorrectAnswers: z.boolean(),
    })
  ),
  totalQuestions: z.number(),
  settings: revisionConfigSchema,
});

export type RevisionResponse = z.infer<typeof revisionResponseSchema>;

// Validation pour une réponse utilisateur en révision
export const revisionAnswerSchema = z.object({
  questionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de question invalide'),
  userAnswers: z
    .array(z.string().regex(/^[A-F]$/, 'Réponse invalide (A-F)'))
    .min(1, 'Au moins une réponse doit être sélectionnée')
    .max(6, 'Maximum 6 réponses'),
  isCorrect: z.boolean(),
});

export type RevisionAnswer = z.infer<typeof revisionAnswerSchema>;