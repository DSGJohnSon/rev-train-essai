import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionModel from '@/lib/models/question';
import CategoryModel from '@/lib/models/category';

// POST - Récupérer plusieurs questions par leurs IDs
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { ids } = body;

    // Validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le paramètre "ids" doit être un tableau non vide',
        },
        { status: 400 }
      );
    }

    // Vérifier que tous les IDs sont valides
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `IDs invalides: ${invalidIds.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Récupérer toutes les questions en une seule requête
    const questions = await QuestionModel.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .populate('categories')
      .lean();

    // Créer un map pour un accès rapide par ID
    const questionsMap = new Map(
      questions.map((q) => [q._id.toString(), q])
    );

    // Retourner les questions dans l'ordre des IDs demandés
    // avec null pour les questions non trouvées
    const orderedQuestions = ids.map((id) => questionsMap.get(id) || null);

    // Compter les questions non trouvées
    const notFoundCount = orderedQuestions.filter((q) => q === null).length;
    const notFoundIds = ids.filter((id) => !questionsMap.has(id));

    return NextResponse.json({
      success: true,
      data: orderedQuestions,
      meta: {
        requested: ids.length,
        found: questions.length,
        notFound: notFoundCount,
        notFoundIds: notFoundIds,
      },
    });
  } catch (error) {
    console.error('Error fetching questions batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des questions',
      },
      { status: 500 }
    );
  }
}