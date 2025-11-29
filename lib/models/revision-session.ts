import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface TypeScript pour RevisionSession
export interface IRevisionSession extends Document {
  pseudonym: string;
  mode: 'revision';
  settings: {
    selectedCategories: mongoose.Types.ObjectId[];
  };
  stats: {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    questionsValidated: number;
  };
  duration: number; // En secondes
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma Mongoose
const RevisionSessionSchema = new Schema<IRevisionSession>(
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
      enum: ['revision'],
      default: 'revision',
      required: true,
    },
    settings: {
      selectedCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    },
    stats: {
      totalAnswers: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      correctAnswers: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      incorrectAnswers: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      questionsValidated: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
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
RevisionSessionSchema.index({ pseudonym: 1, completedAt: -1 });
RevisionSessionSchema.index({ completedAt: -1 });
RevisionSessionSchema.index({ duration: 1 });

// Méthode pour calculer le taux de réussite
RevisionSessionSchema.methods.getSuccessRate = function (): number {
  if (this.stats.totalAnswers === 0) return 0;
  return Math.round(
    (this.stats.correctAnswers / this.stats.totalAnswers) * 100
  );
};

// Méthode pour formater la durée
RevisionSessionSchema.methods.getFormattedDuration = function (): string {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Méthode statique pour obtenir les statistiques d'un utilisateur
RevisionSessionSchema.statics.getUserStats = async function (
  pseudonym: string
) {
  const sessions = await this.find({ pseudonym }).sort({ completedAt: -1 });

  if (sessions.length === 0) {
    return null;
  }

  const totalSessions = sessions.length;
  const averageSuccessRate =
    sessions.reduce((sum: number, s: any) => sum + s.getSuccessRate(), 0) /
    totalSessions;
  const bestTime = Math.min(...sessions.map((s: any) => s.duration));
  const totalQuestionsValidated = sessions.reduce(
    (sum: number, s: any) => sum + s.stats.questionsValidated,
    0
  );

  return {
    totalSessions,
    averageSuccessRate: Math.round(averageSuccessRate),
    bestTime,
    totalQuestionsValidated,
    recentSessions: sessions.slice(0, 5),
  };
};

// Méthode statique pour obtenir les meilleures performances
RevisionSessionSchema.statics.getLeaderboard = async function (limit = 10) {
  return await this.find()
    .sort({ duration: 1 })
    .limit(limit)
    .select('pseudonym duration stats completedAt');
};

// Éviter la redéfinition du modèle en développement
const RevisionSession: Model<IRevisionSession> =
  mongoose.models.RevisionSession ||
  mongoose.model<IRevisionSession>('RevisionSession', RevisionSessionSchema);

export default RevisionSession;