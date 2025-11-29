import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryModel from '@/lib/models/category';
import { categorySchema } from '@/lib/validations/category';

// GET - Liste toutes les catégories
export async function GET() {
  try {
    await connectDB();

    const categories = await CategoryModel.find()
      .populate('categoryType')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des catégories',
      },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation des données
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { name, icon, categoryType } = validation.data;

    // Créer la catégorie
    const category = await CategoryModel.create({
      name,
      icon,
      categoryType,
    });

    // Populate pour retourner les données complètes
    await category.populate('categoryType');

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Catégorie créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la catégorie',
      },
      { status: 500 }
    );
  }
}