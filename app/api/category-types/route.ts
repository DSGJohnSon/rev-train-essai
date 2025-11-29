import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryTypeModel from '@/lib/models/category-type';
import { categoryTypeSchema } from '@/lib/validations/category-type';

// GET - Liste tous les types de catégories
export async function GET() {
  try {
    await connectDB();

    const categoryTypes = await CategoryTypeModel.find()
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categoryTypes,
    });
  } catch (error) {
    console.error('Error fetching category types:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des types de catégories',
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau type de catégorie
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validation = categoryTypeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Vérifier si le type existe déjà
    const existing = await CategoryTypeModel.findOne({ name });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un type de catégorie avec ce nom existe déjà',
        },
        { status: 409 }
      );
    }

    // Créer le type
    const categoryType = await CategoryTypeModel.create({ name });

    return NextResponse.json(
      {
        success: true,
        data: categoryType,
        message: 'Type de catégorie créé avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du type de catégorie',
      },
      { status: 500 }
    );
  }
}