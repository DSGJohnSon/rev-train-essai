import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryTypeModel from '@/lib/models/category-type';
import CategoryModel from '@/lib/models/category';
import { categoryTypeSchema } from '@/lib/validations/category-type';
import mongoose from 'mongoose';

// GET - Récupérer un type de catégorie par ID
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

    const categoryType = await CategoryTypeModel.findById(id).lean();

    if (!categoryType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type de catégorie non trouvé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryType,
    });
  } catch (error) {
    console.error('Error fetching category type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du type de catégorie',
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier un type de catégorie
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

    // Vérifier si un autre type avec ce nom existe déjà
    const existing = await CategoryTypeModel.findOne({
      name,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un type de catégorie avec ce nom existe déjà',
        },
        { status: 409 }
      );
    }

    // Mettre à jour le type
    const categoryType = await CategoryTypeModel.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!categoryType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type de catégorie non trouvé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryType,
      message: 'Type de catégorie modifié avec succès',
    });
  } catch (error) {
    console.error('Error updating category type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la modification du type de catégorie',
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un type de catégorie
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

    // Vérifier si des catégories utilisent ce type
    const categoriesCount = await CategoryModel.countDocuments({
      categoryType: id,
    });

    if (categoriesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer ce type car ${categoriesCount} catégorie(s) l'utilisent`,
        },
        { status: 409 }
      );
    }

    // Supprimer le type
    const categoryType = await CategoryTypeModel.findByIdAndDelete(id);

    if (!categoryType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type de catégorie non trouvé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Type de catégorie supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting category type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du type de catégorie',
      },
      { status: 500 }
    );
  }
}