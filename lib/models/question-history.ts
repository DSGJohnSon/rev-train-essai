import mongoose, { Schema, Model } from 'mongoose';
import { QuestionHistory } from '@/types/question';

export interface IQuestionHistory extends Omit<QuestionHistory, '_id' | 'questionId'> {
  _id: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
}

const QuestionHistorySchema = new Schema<IQuestionHistory>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    snapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changeType: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'deleted'],
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    restoredFrom: {
      type: Number,
    },
  },
  {
    timestamps: false,
  }
);

// Index pour améliorer les performances
QuestionHistorySchema.index({ questionId: 1, version: -1 });
QuestionHistorySchema.index({ changedAt: -1 });

const QuestionHistoryModel: Model<IQuestionHistory> =
  mongoose.models.QuestionHistory ||
  mongoose.model<IQuestionHistory>('QuestionHistory', QuestionHistorySchema);

export default QuestionHistoryModel;