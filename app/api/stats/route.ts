import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionModel from '@/lib/models/question';
import CategoryModel from '@/lib/models/category';
import CategoryTypeModel from '@/lib/models/category-type';

export async function GET() {
  try {
    await connectDB();

    // Statistiques de base
    const [totalQuestions, totalCategories, totalCategoryTypes] = await Promise.all([
      QuestionModel.countDocuments(),
      CategoryModel.countDocuments(),
      CategoryTypeModel.countDocuments(),
    ]);

    // Questions récentes (5 dernières)
    const recentQuestions = await QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title createdAt')
      .lean();

    // Répartition par catégorie
    const questionsByCategory = await QuestionModel.aggregate([
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
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Répartition par type de catégorie
    const questionsByCategoryType = await QuestionModel.aggregate([
      { $unwind: '$categories' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'categorytypes',
          localField: 'category.categoryType',
          foreignField: '_id',
          as: 'categoryType',
        },
      },
      { $unwind: '$categoryType' },
      {
        $group: {
          _id: '$categoryType._id',
          typeName: { $first: '$categoryType.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Répartition par type de réponse
    const answerTypeDistribution = await QuestionModel.aggregate([
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.type',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Questions créées par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const questionsOverTime = await QuestionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions,
        totalCategories,
        totalCategoryTypes,
        recentQuestions,
        questionsByCategory,
        questionsByCategoryType,
        answerTypeDistribution,
        questionsOverTime,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      },
      { status: 500 }
    );
  }
}