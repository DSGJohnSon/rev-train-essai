import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionModel from '@/lib/models/question';
import QuestionHistoryModel from '@/lib/models/question-history';

// GET - Récupérer l'historique d'une question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }

    // Vérifier que la question existe
    const question = await QuestionModel.findById(id).lean();
    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question non trouvée',
        },
        { status: 404 }
      );
    }

    // Récupérer l'historique
    const history = await QuestionHistoryModel.find({ questionId: id })
      .sort({ version: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        question,
        history,
      },
    });
  } catch (error) {
    console.error('Error fetching question history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'historique',
      },
      { status: 500 }
    );
  }
}

// POST - Restaurer une version de la question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { version } = body;

    if (typeof version !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Version invalide',
        },
        { status: 400 }
      );
    }

    // Récupérer la version à restaurer
    const historyEntry = await QuestionHistoryModel.findOne({
      questionId: id,
      version,
    }).lean();

    if (!historyEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Version non trouvée dans l\'historique',
        },
        { status: 404 }
      );
    }

    // Récupérer la question actuelle
    const currentQuestion = await QuestionModel.findById(id);
    if (!currentQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question non trouvée',
        },
        { status: 404 }
      );
    }

    const newVersion = currentQuestion.version + 1;
    const snapshot = historyEntry.snapshot as any;

    // Restaurer la question avec les données du snapshot
    const restoredQuestion = await QuestionModel.findByIdAndUpdate(
      id,
      {
        title: snapshot.title,
        illustration: snapshot.illustration,
        answers: snapshot.answers,
        correctAnswers: snapshot.correctAnswers,
        categories: snapshot.categories,
        version: newVersion,
      },
      { new: true, runValidators: true }
    );

    if (!restoredQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la restauration',
        },
        { status: 500 }
      );
    }

    // Sauvegarder dans l'historique avec indication de restauration
    const newSnapshot = restoredQuestion.toObject();
    await QuestionHistoryModel.create({
      questionId: restoredQuestion._id,
      version: newVersion,
      snapshot: JSON.parse(JSON.stringify(newSnapshot)),
      changeType: 'updated',
      changedAt: new Date(),
      restoredFrom: version,
    });

    // Populate pour retourner les données complètes
    const populatedQuestion = await QuestionModel.findById(id).populate('categories').lean();

    return NextResponse.json({
      success: true,
      data: populatedQuestion,
      message: `Question restaurée à la version ${version}`,
    });
  } catch (error) {
    console.error('Error restoring question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la restauration de la question',
      },
      { status: 500 }
    );
  }
}