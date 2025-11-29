import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/lib/models/question';
import Category from '@/lib/models/category';
import CategoryType from '@/lib/models/category-type';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Compter le nombre total de questions
    const totalQuestions = await Question.countDocuments();

    // Compter le nombre total de catégories
    const totalCategories = await Category.countDocuments();

    // Compter le nombre total de types de catégories
    const totalCategoryTypes = await CategoryType.countDocuments();

    // Obtenir la répartition des questions par catégorie
    const questionsByCategory = await Question.aggregate([
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryId: { $toString: '$_id' },
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Obtenir la répartition des questions par type de catégorie
    const questionsByCategoryType = await Question.aggregate([
      { $unwind: '$categories' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData.categoryType',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categorytypes',
          localField: '_id',
          foreignField: '_id',
          as: 'type',
        },
      },
      { $unwind: '$type' },
      {
        $project: {
          typeId: { $toString: '$_id' },
          typeName: '$type.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      totalQuestions,
      totalCategories,
      totalCategoryTypes,
      questionsByCategory,
      questionsByCategoryType,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des statistiques',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}