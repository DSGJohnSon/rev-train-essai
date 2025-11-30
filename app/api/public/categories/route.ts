import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/category';
import CategoryType from '@/lib/models/category-type';
import Question from '@/lib/models/question';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer toutes les catégories avec leurs types
    const categories = await Category.find()
      .populate('categoryType')
      .sort({ name: 1 })
      .lean();

    // Date limite pour les questions "nouvelles" (15 jours)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Pour chaque catégorie, vérifier s'il y a des questions récentes
    const categoriesWithNewFlag = await Promise.all(
      categories.map(async (cat: any) => {
        const hasRecentQuestions = await Question.exists({
          categories: cat._id,
          createdAt: { $gte: fifteenDaysAgo },
        });

        return {
          ...cat,
          hasNewQuestions: !!hasRecentQuestions,
        };
      })
    );

    // Grouper les catégories par type
    const categoryTypes = await CategoryType.find().sort({ name: 1 }).lean();

    const groupedCategories = categoryTypes.map((type: any) => ({
      _id: type._id.toString(),
      name: type.name,
      categories: categoriesWithNewFlag
        .filter(
          (cat: any) =>
            cat.categoryType &&
            cat.categoryType._id.toString() === type._id.toString()
        )
        .map((cat: any) => ({
          _id: cat._id.toString(),
          name: cat.name,
          icon: cat.icon,
          hasNewQuestions: cat.hasNewQuestions,
          categoryType: {
            _id: type._id.toString(),
            name: type.name,
          },
        })),
    }));

    // Aussi retourner une liste plate pour faciliter l'utilisation
    const flatCategories = categoriesWithNewFlag.map((cat: any) => ({
      _id: cat._id.toString(),
      name: cat.name,
      icon: cat.icon,
      hasNewQuestions: cat.hasNewQuestions,
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