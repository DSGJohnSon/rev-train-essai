import mongoose, { Schema, Model } from 'mongoose';

export interface ICategoryStats {
  categoryId: mongoose.Types.ObjectId;
  correct: number;
  total: number;
}

export interface ISession {
  _id: mongoose.Types.ObjectId;
  pseudonym: string;
  questionsAnswered: number;
  correctAnswers: number;
  categoryStats: ICategoryStats[];
  completedAt: Date;
}

const CategoryStatsSchema = new Schema<ICategoryStats>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    correct: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    pseudonym: {
      type: String,
      required: [true, 'Le pseudonyme est requis'],
      trim: true,
      maxlength: [50, 'Le pseudonyme ne peut pas dépasser 50 caractères'],
    },
    questionsAnswered: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    categoryStats: {
      type: [CategoryStatsSchema],
      default: [],
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

// Index pour améliorer les performances
SessionSchema.index({ completedAt: -1 });
SessionSchema.index({ pseudonym: 1 });

const SessionModel: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default SessionModel;