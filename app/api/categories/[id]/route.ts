import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryModel from '@/lib/models/category';
import QuestionModel from '@/lib/models/question';
import { categorySchema } from '@/lib/validations/category';
import mongoose from 'mongoose';

// GET - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }

    const category = await CategoryModel.findById(id)
      .populate('categoryType')
      .lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Catégorie non trouvée',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la catégorie',
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }

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

    // Mettre à jour la catégorie
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { name, icon, categoryType },
      { new: true, runValidators: true }
    ).populate('categoryType');

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Catégorie non trouvée',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie modifiée avec succès',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la modification de la catégorie',
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }

    // Vérifier si des questions utilisent cette catégorie
    const questionsCount = await QuestionModel.countDocuments({
      categories: id,
    });

    if (questionsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer cette catégorie car ${questionsCount} question(s) l'utilisent`,
        },
        { status: 409 }
      );
    }

    // Supprimer la catégorie
    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Catégorie non trouvée',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la catégorie',
      },
      { status: 500 }
    );
  }
}