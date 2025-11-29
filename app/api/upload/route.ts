import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage, validateImageFile } from '@/lib/image-optimizer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as 'questions' | 'answers') || 'questions';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun fichier fourni',
        },
        { status: 400 }
      );
    }

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimiser et sauvegarder l'image
    const result = await optimizeImage({
      buffer,
      folder,
      originalName: file.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        size: result.size,
      },
      message: 'Image uploadée et optimisée avec succès',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      },
      { status: 500 }
    );
  }
}