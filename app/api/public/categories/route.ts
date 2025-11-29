import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/category';
import CategoryType from '@/lib/models/category-type';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer toutes les catégories avec leurs types
    const categories = await Category.find()
      .populate('categoryType')
      .sort({ name: 1 })
      .lean();

    // Grouper les catégories par type
    const categoryTypes = await CategoryType.find().sort({ name: 1 }).lean();

    const groupedCategories = categoryTypes.map((type: any) => ({
      _id: type._id.toString(),
      name: type.name,
      categories: categories
        .filter(
          (cat: any) =>
            cat.categoryType &&
            cat.categoryType._id.toString() === type._id.toString()
        )
        .map((cat: any) => ({
          _id: cat._id.toString(),
          name: cat.name,
          icon: cat.icon,
          categoryType: {
            _id: type._id.toString(),
            name: type.name,
          },
        })),
    }));

    // Aussi retourner une liste plate pour faciliter l'utilisation
    const flatCategories = categories.map((cat: any) => ({
      _id: cat._id.toString(),
      name: cat.name,
      icon: cat.icon,
      categoryType: cat.categoryType
        ? {
            _id: cat.categoryType._id.toString(),
            name: cat.categoryType.name,
          }
        : null,
    }));

    return NextResponse.json({
      categories: flatCategories,
      groupedByType: groupedCategories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching public categories:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des catégories',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}