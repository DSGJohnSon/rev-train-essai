import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuizSession from '@/lib/models/quiz-session';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pseudonym = searchParams.get('pseudonym');

    // Construire la requête
    const query: any = {};
    if (pseudonym) {
      query.pseudonym = pseudonym;
    }

    // Récupérer toutes les sessions
    const sessions = await QuizSession.find(query)
      .select('score duration completedAt');

    if (sessions.length === 0) {
      return NextResponse.json({
        average: null,
      });
    }

    // Calculer les moyennes
    const totalPercentage = sessions.reduce((sum, session) => sum + session.score.percentage, 0);
    const totalCorrect = sessions.reduce((sum, session) => sum + session.score.correct, 0);
    const totalQuestions = sessions.reduce((sum, session) => sum + session.score.total, 0);
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);

    const averagePercentage = Math.round(totalPercentage / sessions.length);
    const averageDuration = Math.round(totalDuration / sessions.length);

    return NextResponse.json({
      average: {
        score: {
          correct: Math.round(totalCorrect / sessions.length),
          total: Math.round(totalQuestions / sessions.length),
          percentage: averagePercentage,
        },
        duration: averageDuration,
        sessionCount: sessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des statistiques',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}