import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface TypeScript pour QuizSession
export interface IQuizSession extends Document {
  pseudonym: string;
  mode: 'quiz';
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  settings: {
    questionCount: number;
    selectedCategories: mongoose.Types.ObjectId[];
    bannedCategories: mongoose.Types.ObjectId[];
  };
  results: Array<{
    questionId: mongoose.Types.ObjectId;
    questionTitle: string;
    userAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
    categories: mongoose.Types.ObjectId[];
  }>;
  duration: number; // En secondes
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma Mongoose
const QuizSessionSchema = new Schema<IQuizSession>(
  {
    pseudonym: {
      type: String,
      required: [true, 'Le pseudonyme est requis'],
      trim: true,
      minlength: [2, 'Le pseudonyme doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le pseudonyme ne peut pas dépasser 50 caractères'],
    },
    mode: {
      type: String,
      enum: ['quiz'],
      default: 'quiz',
      required: true,
    },
    score: {
      correct: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 1,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    settings: {
      questionCount: {
        type: Number,
        required: true,
        min: 1,
      },
      selectedCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      bannedCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    },
    results: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        questionTitle: {
          type: String,
          required: true,
        },
        userAnswers: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswers: [
          {
            type: String,
            required: true,
          },
        ],
        isCorrect: {
          type: Boolean,
          required: true,
        },
        categories: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Category',
          },
        ],
      },
    ],
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour performances
QuizSessionSchema.index({ pseudonym: 1, completedAt: -1 });
QuizSessionSchema.index({ completedAt: -1 });
QuizSessionSchema.index({ 'score.percentage': -1 });

// Méthode pour calculer le score
QuizSessionSchema.methods.calculateScore = function () {
  const correct = this.results.filter((r: any) => r.isCorrect).length;
  const total = this.results.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  this.score = {
    correct,
    total,
    percentage,
  };
};

// Méthode statique pour obtenir les statistiques d'un utilisateur
QuizSessionSchema.statics.getUserStats = async function (pseudonym: string) {
  const sessions = await this.find({ pseudonym }).sort({ completedAt: -1 });

  if (sessions.length === 0) {
    return null;
  }

  const totalSessions = sessions.length;
  const averageScore =
    sessions.reduce((sum: number, s: any) => sum + s.score.percentage, 0) /
    totalSessions;
  const bestScore = Math.max(...sessions.map((s: any) => s.score.percentage));
  const totalQuestions = sessions.reduce(
    (sum: number, s: any) => sum + s.score.total,
    0
  );

  return {
    totalSessions,
    averageScore: Math.round(averageScore),
    bestScore,
    totalQuestions,
    recentSessions: sessions.slice(0, 5),
  };
};

// Éviter la redéfinition du modèle en développement
const QuizSession: Model<IQuizSession> =
  mongoose.models.QuizSession ||
  mongoose.model<IQuizSession>('QuizSession', QuizSessionSchema);

export default QuizSession;