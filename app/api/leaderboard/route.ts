import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuizSession from '@/lib/models/quiz-session';
import RevisionSession from '@/lib/models/revision-session';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Récupérer les meilleures sessions de quiz
    const quizSessions = await QuizSession.find()
      .sort({ 'score.percentage': -1, completedAt: -1 })
      .limit(limit)
      .select('pseudonym score duration completedAt')
      .lean();

    // Récupérer les meilleures sessions de révision
    const revisionSessions = await RevisionSession.find()
      .sort({ completedAt: -1 })
      .limit(limit)
      .select('pseudonym stats duration completedAt')
      .lean();

    // Formater les sessions de quiz
    const formattedQuizSessions = quizSessions.map((session: any) => ({
      _id: session._id.toString(),
      pseudonym: session.pseudonym,
      mode: 'quiz' as const,
      score: session.score.percentage,
      details: `${session.score.correct}/${session.score.total}`,
      duration: session.duration,
      completedAt: session.completedAt,
    }));

    // Formater les sessions de révision avec calcul du taux de réussite
    const formattedRevisionSessions = revisionSessions.map((session: any) => {
      const successRate =
        session.stats.totalAnswers > 0
          ? Math.round((session.stats.correctAnswers / session.stats.totalAnswers) * 100)
          : 0;

      return {
        _id: session._id.toString(),
        pseudonym: session.pseudonym,
        mode: 'revision' as const,
        score: successRate,
        details: `${session.stats.questionsValidated} questions validées`,
        duration: session.duration,
        completedAt: session.completedAt,
      };
    });

    // Combiner et trier par score puis par date
    const allSessions = [...formattedQuizSessions, ...formattedRevisionSessions]
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      })
      .slice(0, limit);

    return NextResponse.json({
      leaderboard: allSessions,
      total: allSessions.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération du classement',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}