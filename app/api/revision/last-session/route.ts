import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RevisionSession from '@/lib/models/revision-session';

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
    const sessions = await RevisionSession.find(query)
      .select('stats duration completedAt');

    if (sessions.length === 0) {
      return NextResponse.json({
        average: null,
      });
    }

    // Calculer les moyennes
    const totalCorrectAnswers = sessions.reduce((sum, session) => sum + session.stats.correctAnswers, 0);
    const totalAnswers = sessions.reduce((sum, session) => sum + session.stats.totalAnswers, 0);
    const totalIncorrectAnswers = sessions.reduce((sum, session) => sum + session.stats.incorrectAnswers, 0);
    const totalQuestionsValidated = sessions.reduce((sum, session) => sum + session.stats.questionsValidated, 0);
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);

    const averageSuccessRate = totalAnswers > 0
      ? Math.round((totalCorrectAnswers / totalAnswers) * 100)
      : 0;

    const averageDuration = Math.round(totalDuration / sessions.length);

    // Formater la durée moyenne
    const hours = Math.floor(averageDuration / 3600);
    const minutes = Math.floor((averageDuration % 3600) / 60);
    const seconds = averageDuration % 60;
    let formattedDuration = '';
    if (hours > 0) {
      formattedDuration = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formattedDuration = `${minutes}m ${seconds}s`;
    } else {
      formattedDuration = `${seconds}s`;
    }

    return NextResponse.json({
      average: {
        stats: {
          totalAnswers: Math.round(totalAnswers / sessions.length),
          correctAnswers: Math.round(totalCorrectAnswers / sessions.length),
          incorrectAnswers: Math.round(totalIncorrectAnswers / sessions.length),
          questionsValidated: Math.round(totalQuestionsValidated / sessions.length),
        },
        successRate: averageSuccessRate,
        duration: averageDuration,
        formattedDuration,
        sessionCount: sessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching revision average:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération de la moyenne',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}