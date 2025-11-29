import { z } from 'zod';

// Validation pour la configuration du quiz
export const quizConfigSchema = z.object({
  questionCount: z
    .number()
    .int()
    .min(1, 'Le nombre de questions doit être au moins 1')
    .max(1000, 'Le nombre de questions ne peut pas dépasser 1000'),
  selectedCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
    .optional()
    .default([]),
  bannedCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
    .optional()
    .default([]),
});

export type QuizConfig = z.infer<typeof quizConfigSchema>;

// Validation pour une réponse utilisateur
export const userAnswerSchema = z.object({
  questionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de question invalide'),
  userAnswers: z
    .array(z.string().regex(/^[A-F]$/, 'Réponse invalide (A-F)'))
    .min(1, 'Au moins une réponse doit être sélectionnée')
    .max(6, 'Maximum 6 réponses'),
});

export type UserAnswer = z.infer<typeof userAnswerSchema>;

// Validation pour un résultat de question
export const questionResultSchema = z.object({
  questionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de question invalide'),
  questionTitle: z
    .string()
    .min(1, 'Le titre de la question est requis')
    .max(500, 'Le titre ne peut pas dépasser 500 caractères'),
  userAnswers: z
    .array(z.string().regex(/^[A-F]$/, 'Réponse invalide (A-F)'))
    .min(1)
    .max(6),
  correctAnswers: z
    .array(z.string().regex(/^[A-F]$/, 'Réponse invalide (A-F)'))
    .min(1)
    .max(6),
  isCorrect: z.boolean(),
  categories: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide')
  ),
});

export type QuestionResult = z.infer<typeof questionResultSchema>;

// Validation pour la sauvegarde d'une session de quiz
export const saveQuizSessionSchema = z.object({
  pseudonym: z
    .string()
    .trim()
    .min(2, 'Le pseudonyme doit contenir au moins 2 caractères')
    .max(50, 'Le pseudonyme ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-Z0-9_\-\s]+$/,
      'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'
    ),
  settings: quizConfigSchema,
  results: z
    .array(questionResultSchema)
    .min(1, 'Au moins un résultat est requis'),
  duration: z
    .number()
    .int()
    .min(0, 'La durée doit être positive')
    .max(86400, 'La durée ne peut pas dépasser 24 heures'),
});

export type SaveQuizSession = z.infer<typeof saveQuizSessionSchema>;

// Validation pour la génération d'un quiz
export const generateQuizSchema = z
  .object({
    questionCount: z
      .number()
      .int()
      .min(1, 'Le nombre de questions doit être au moins 1'),
    selectedCategories: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
      .optional()
      .default([]),
    bannedCategories: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de catégorie invalide'))
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      // Vérifier qu'il n'y a pas de catégories à la fois sélectionnées et bannies
      const selected = new Set(data.selectedCategories);
      const banned = new Set(data.bannedCategories);
      const intersection = [...selected].filter((id) => banned.has(id));
      return intersection.length === 0;
    },
    {
      message:
        'Une catégorie ne peut pas être à la fois sélectionnée et bannie',
    }
  );

export type GenerateQuiz = z.infer<typeof generateQuizSchema>;

// Validation pour la réponse de génération de quiz
export const quizResponseSchema = z.object({
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
  totalAvailable: z.number(),
  settings: quizConfigSchema,
});

export type QuizResponse = z.infer<typeof quizResponseSchema>;