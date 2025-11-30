import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/lib/models/question';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoriesParam = searchParams.get('categories');

    // Construction de la requête MongoDB
    let query: any = {};

    // Si des catégories sont fournies, filtrer par ces catégories
    if (categoriesParam) {
      const categoryIds = categoriesParam.split(',');
      query.categories = { $in: categoryIds };
    }

    // Compter le nombre de questions
    const count = await Question.countDocuments(query);

    return NextResponse.json({
      count,
    });
  } catch (error) {
    console.error('Error counting questions:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors du comptage des questions',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}