import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuizSession from '@/lib/models/quiz-session';
import Question from '@/lib/models/question';
import { saveQuizSessionSchema } from '@/lib/validations/quiz';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validatedData = saveQuizSessionSchema.parse(body);
    const { pseudonym, settings, results, duration } = validatedData;

    // Calculer le score
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Convertir les IDs de catégories en ObjectId
    const selectedCategories = settings.selectedCategories.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const bannedCategories = settings.bannedCategories.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Formater les résultats avec ObjectId
    const formattedResults = results.map((r) => ({
      questionId: new mongoose.Types.ObjectId(r.questionId),
      questionTitle: r.questionTitle,
      userAnswers: r.userAnswers,
      correctAnswers: r.correctAnswers,
      isCorrect: r.isCorrect,
      categories: r.categories.map((id) => new mongoose.Types.ObjectId(id)),
    }));

    // Créer la session
    const session = new QuizSession({
      pseudonym,
      mode: 'quiz',
      score: {
        correct,
        total,
        percentage,
      },
      settings: {
        questionCount: settings.questionCount,
        selectedCategories,
        bannedCategories,
      },
      results: formattedResults,
      duration,
      completedAt: new Date(),
    });

    await session.save();

    return NextResponse.json(
      {
        message: 'Session sauvegardée avec succès',
        session: {
          _id: session._id.toString(),
          pseudonym: session.pseudonym,
          score: session.score,
          duration: session.duration,
          completedAt: session.completedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving quiz session:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la sauvegarde de la session',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

// GET: Récupérer les sessions d'un utilisateur (optionnel pour futur)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pseudonym = searchParams.get('pseudonym');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!pseudonym) {
      return NextResponse.json(
        { error: 'Le pseudonyme est requis' },
        { status: 400 }
      );
    }

    const sessions = await QuizSession.find({ pseudonym })
      .sort({ completedAt: -1 })
      .limit(limit)
      .select('score duration completedAt settings');

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching quiz sessions:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des sessions',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}