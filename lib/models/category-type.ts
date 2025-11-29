import mongoose, { Schema, Model } from 'mongoose';
import { CategoryType } from '@/types/category';

export interface ICategoryType extends Omit<CategoryType, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const CategoryTypeSchema = new Schema<ICategoryType>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du type de catégorie est requis'],
      unique: true,
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances de recherche
CategoryTypeSchema.index({ name: 1 });

const CategoryTypeModel: Model<ICategoryType> =
  mongoose.models.CategoryType || mongoose.model<ICategoryType>('CategoryType', CategoryTypeSchema);

export default CategoryTypeModel;