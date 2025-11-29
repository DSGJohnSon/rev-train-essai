import mongoose, { Schema, Model } from 'mongoose';
import { Category } from '@/types/category';

export interface ICategory extends Omit<Category, '_id' | 'categoryType'> {
  _id: mongoose.Types.ObjectId;
  categoryType: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    icon: {
      type: String,
      required: [true, "L'icône est requise"],
      trim: true,
    },
    categoryType: {
      type: Schema.Types.ObjectId,
      ref: 'CategoryType',
      required: [true, 'Le type de catégorie est requis'],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
CategorySchema.index({ name: 1 });
CategorySchema.index({ categoryType: 1 });

const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default CategoryModel;