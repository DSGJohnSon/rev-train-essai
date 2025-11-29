import mongoose, { Schema, Model } from 'mongoose';
import { Question, Answer, AnswerType, AnswerId } from '@/types/question';

export interface IQuestion extends Omit<Question, '_id' | 'categories'> {
  _id: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
}

const AnswerSchema = new Schema<Answer>(
  {
    id: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D', 'E', 'F'] as AnswerId[],
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'text-image'] as AnswerType[],
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la question est requis'],
      trim: true,
      minlength: [10, 'Le titre doit contenir au moins 10 caractères'],
      maxlength: [500, 'Le titre ne peut pas dépasser 500 caractères'],
    },
    illustration: {
      type: String,
      trim: true,
    },
    answers: {
      type: [AnswerSchema],
      required: true,
      validate: {
        validator: function (answers: Answer[]) {
          return answers.length >= 2 && answers.length <= 6;
        },
        message: 'Une question doit avoir entre 2 et 6 réponses',
      },
    },
    correctAnswers: {
      type: [String],
      required: true,
      validate: {
        validator: function (correctAnswers: string[]) {
          return correctAnswers.length >= 1;
        },
        message: 'Au moins une réponse correcte est requise',
      },
    },
    categories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      required: true,
      validate: {
        validator: function (categories: mongoose.Types.ObjectId[]) {
          return categories.length >= 1;
        },
        message: 'Au moins une catégorie est requise',
      },
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Validation personnalisée : au moins une réponse incorrecte
QuestionSchema.pre('save', function () {
  const correctCount = this.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = this.answers.length - correctCount;

  if (incorrectCount < 1) {
    throw new Error('Au moins une réponse incorrecte est requise');
  }
  if (correctCount < 1) {
    throw new Error('Au moins une réponse correcte est requise');
  }
});

// Index pour améliorer les performances
QuestionSchema.index({ title: 'text' });
QuestionSchema.index({ categories: 1 });
QuestionSchema.index({ createdAt: -1 });

const QuestionModel: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default QuestionModel;