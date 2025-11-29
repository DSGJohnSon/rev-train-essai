import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RevisionSession from '@/lib/models/revision-session';
import { saveRevisionSessionSchema } from '@/lib/validations/revision';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validatedData = saveRevisionSessionSchema.parse(body);
    const { pseudonym, settings, stats, duration } = validatedData;

    // Convertir les IDs de catégories en ObjectId
    const selectedCategories = settings.selectedCategories.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Créer la session
    const session = new RevisionSession({
      pseudonym,
      mode: 'revision',
      settings: {
        selectedCategories,
      },
      stats: {
        totalAnswers: stats.totalAnswers,
        correctAnswers: stats.correctAnswers,
        incorrectAnswers: stats.incorrectAnswers,
        questionsValidated: stats.questionsValidated,
      },
      duration,
      completedAt: new Date(),
    });

    await session.save();

    // Calculer le taux de réussite
    const successRate =
      stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
        : 0;

    // Formater la durée
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    let formattedDuration = '';
    if (hours > 0) {
      formattedDuration = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formattedDuration = `${minutes}m ${seconds}s`;
    } else {
      formattedDuration = `${seconds}s`;
    }

    return NextResponse.json(
      {
        message: 'Session sauvegardée avec succès',
        session: {
          _id: session._id.toString(),
          pseudonym: session.pseudonym,
          stats: session.stats,
          successRate,
          duration: session.duration,
          formattedDuration,
          completedAt: session.completedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving revision session:', error);

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

    const sessions = await RevisionSession.find({ pseudonym })
      .sort({ completedAt: -1 })
      .limit(limit)
      .select('stats duration completedAt settings');

    // Ajouter le taux de réussite à chaque session
    const sessionsWithRate = sessions.map((session) => {
      const successRate =
        session.stats.totalAnswers > 0
          ? Math.round(
              (session.stats.correctAnswers / session.stats.totalAnswers) * 100
            )
          : 0;

      const hours = Math.floor(session.duration / 3600);
      const minutes = Math.floor((session.duration % 3600) / 60);
      const seconds = session.duration % 60;
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        formattedDuration = `${minutes}m ${seconds}s`;
      } else {
        formattedDuration = `${seconds}s`;
      }

      return {
        _id: session._id,
        stats: session.stats,
        successRate,
        duration: session.duration,
        formattedDuration,
        completedAt: session.completedAt,
        settings: session.settings,
      };
    });

    return NextResponse.json({
      sessions: sessionsWithRate,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching revision sessions:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des sessions',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}