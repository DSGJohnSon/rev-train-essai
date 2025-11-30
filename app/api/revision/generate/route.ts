import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/lib/models/question';
import { generateRevisionSchema } from '@/lib/validations/revision';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validatedData = generateRevisionSchema.parse(body);
    const { selectedCategories } = validatedData;

    console.log('Selected categories:', selectedCategories);

    // Construction de la requête MongoDB
    let query: any = {};

    // Si des catégories sont sélectionnées, filtrer par ces catégories
    if (selectedCategories.length > 0) {
      // Convertir les IDs en ObjectId si nécessaire
      const mongoose = require('mongoose');
      const categoryObjectIds = selectedCategories.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (e) {
          console.error('Invalid category ID:', id);
          return id;
        }
      });
      query.categories = { $in: categoryObjectIds };
      console.log('Query:', JSON.stringify(query));
    }

    // Compter le nombre total de questions disponibles
    const totalQuestions = await Question.countDocuments(query);

    if (totalQuestions === 0) {
      return NextResponse.json(
        {
          error: 'Aucune question disponible avec ces critères',
          totalQuestions: 0,
        },
        { status: 404 }
      );
    }

    // Récupérer toutes les questions correspondantes (pas de limite pour la révision)
    const questions = await Question.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $lookup: {
          from: 'categorytypes',
          localField: 'categories.categoryType',
          foreignField: '_id',
          as: 'categoryTypes',
        },
      },
    ]);

    // Mélanger les questions de manière aléatoire
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    // Formater les questions pour le frontend
    const formattedQuestions = shuffledQuestions.map((q) => ({
      _id: q._id.toString(),
      title: q.title,
      illustration: q.illustration,
      answers: q.answers.map((a: any) => ({
        id: a.id,
        type: a.type,
        text: a.text,
        image: a.image,
        // Ne pas envoyer isCorrect au frontend pour éviter la triche
        isCorrect: false,
      })),
      correctAnswers: [], // Ne pas envoyer les réponses correctes
      categories: q.categories.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
        icon: c.icon,
        categoryType: c.categoryType,
      })),
      hasMultipleCorrectAnswers: q.correctAnswers.length > 1,
    }));

    return NextResponse.json({
      questions: formattedQuestions,
      totalQuestions,
      settings: {
        selectedCategories,
      },
    });
  } catch (error) {
    console.error('Error generating revision:', error);

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
        error: 'Erreur lors de la génération de la révision',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}