import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionModel from '@/lib/models/question';
import QuestionHistoryModel from '@/lib/models/question-history';
import { questionSchema } from '@/lib/validations/question';

// GET - Récupérer une question par ID
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

    const question = await QuestionModel.findById(id)
      .populate('categories')
      .lean();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question non trouvée',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la question',
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier une question
export async function PUT(
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

    // Validation des données
    const validation = questionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { title, illustration, answers, categories } = validation.data;

    // Extraire les IDs des réponses correctes
    const correctAnswers = answers.filter((a) => a.isCorrect).map((a) => a.id);

    // Récupérer la question actuelle pour incrémenter la version
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

    // Mettre à jour la question
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      id,
      {
        title,
        illustration,
        answers,
        correctAnswers,
        categories: categories.map((catId) => new mongoose.Types.ObjectId(catId)),
        version: newVersion,
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question non trouvée',
        },
        { status: 404 }
      );
    }

    // Sauvegarder dans l'historique
    const snapshot = updatedQuestion.toObject();
    await QuestionHistoryModel.create({
      questionId: updatedQuestion._id,
      version: newVersion,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      changeType: 'updated',
      changedAt: new Date(),
    });

    // Populate pour retourner les données complètes
    const populatedQuestion = await QuestionModel.findById(id).populate('categories').lean();

    return NextResponse.json({
      success: true,
      data: populatedQuestion,
      message: 'Question modifiée avec succès',
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la modification de la question',
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une question
export async function DELETE(
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

    const question = await QuestionModel.findById(id);

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question non trouvée',
        },
        { status: 404 }
      );
    }

    // Sauvegarder dans l'historique avant suppression
    const snapshot = question.toObject();
    await QuestionHistoryModel.create({
      questionId: question._id,
      version: question.version,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      changeType: 'deleted',
      changedAt: new Date(),
    });

    // Supprimer la question
    await QuestionModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Question supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la question',
      },
      { status: 500 }
    );
  }
}