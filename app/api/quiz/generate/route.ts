import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/lib/models/question';
import Category from '@/lib/models/category';
import { generateQuizSchema } from '@/lib/validations/quiz';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validatedData = generateQuizSchema.parse(body);
    const { questionCount, selectedCategories, bannedCategories } =
      validatedData;

    // Construction de la requête MongoDB
    let query: any = {};

    // Si des catégories sont sélectionnées, filtrer par ces catégories
    if (selectedCategories.length > 0) {
      query.categories = { $in: selectedCategories };
    }

    // Si des catégories sont bannies, les exclure
    if (bannedCategories.length > 0) {
      query.categories = query.categories || {};
      if (query.categories.$in) {
        // Si on a déjà un filtre $in, on doit exclure les bannies de cette liste
        query.categories = {
          $in: selectedCategories,
          $nin: bannedCategories,
        };
      } else {
        // Sinon, on exclut simplement les bannies
        query.categories = { $nin: bannedCategories };
      }
    }

    // Compter le nombre total de questions disponibles
    const totalAvailable = await Question.countDocuments(query);

    if (totalAvailable === 0) {
      return NextResponse.json(
        {
          error: 'Aucune question disponible avec ces critères',
          totalAvailable: 0,
        },
        { status: 404 }
      );
    }

    if (questionCount > totalAvailable) {
      return NextResponse.json(
        {
          error: `Seulement ${totalAvailable} question(s) disponible(s) avec ces critères`,
          totalAvailable,
        },
        { status: 400 }
      );
    }

    // Récupérer les questions de manière aléatoire
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: questionCount } },
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

    // Formater les questions pour le frontend
    const formattedQuestions = questions.map((q) => ({
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
      totalAvailable,
      settings: {
        questionCount,
        selectedCategories,
        bannedCategories,
      },
    });
  } catch (error) {
    console.error('Error generating quiz:', error);

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
        error: 'Erreur lors de la génération du quiz',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}