import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionModel from '@/lib/models/question';
import QuestionHistoryModel from '@/lib/models/question-history';
import { questionSchema } from '@/lib/validations/question';

// GET - Liste toutes les questions avec filtres
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construire le filtre
    const filter: any = {};

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      QuestionModel.find(filter)
        .populate('categories')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des questions',
      },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle question
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Créer la question avec conversion des IDs
    const questionData = {
      title,
      illustration,
      answers,
      correctAnswers,
      categories: categories.map((id) => new mongoose.Types.ObjectId(id)),
      version: 1,
    };

    const question = await QuestionModel.create(questionData);

    // Sauvegarder dans l'historique (version 1 - création)
    const snapshot = question.toObject();
    await QuestionHistoryModel.create({
      questionId: question._id,
      version: 1,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      changeType: 'created',
      changedAt: new Date(),
    });

    // Populate pour retourner les données complètes
    const populatedQuestion = await QuestionModel.findById(question._id).populate('categories').lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedQuestion,
        message: 'Question créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la question',
      },
      { status: 500 }
    );
  }
}