import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RevisionSession from '@/lib/models/revision-session';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoriesParam = searchParams.get('categories');
    const pseudonym = searchParams.get('pseudonym');
    
    if (!categoriesParam) {
      return NextResponse.json(
        { error: 'Les catégories sont requises' },
        { status: 400 }
      );
    }

    const categoryIds = categoriesParam.split(',').map(id => new mongoose.Types.ObjectId(id));

    // Construire la requête
    const query: any = {
      'settings.selectedCategories': { $in: categoryIds }
    };

    // Si un pseudonyme est fourni, filtrer par pseudonyme
    if (pseudonym) {
      query.pseudonym = pseudonym;
    }

    // Récupérer les sessions avec ces catégories
    const sessions = await RevisionSession.find(query).select('duration');

    if (sessions.length === 0) {
      return NextResponse.json({
        averageDuration: null,
        sessionCount: 0,
      });
    }

    // Calculer la durée moyenne
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageDuration = Math.round(totalDuration / sessions.length);

    // Formater la durée moyenne
    const hours = Math.floor(averageDuration / 3600);
    const minutes = Math.floor((averageDuration % 3600) / 60);
    const seconds = averageDuration % 60;
    
    let formattedDuration = '';
    if (hours > 0) {
      formattedDuration = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formattedDuration = `${minutes}m ${seconds}s`;
    } else {
      formattedDuration = `${seconds}s`;
    }

    return NextResponse.json({
      averageDuration,
      formattedDuration,
      sessionCount: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching revision stats:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des statistiques',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}