import { NextResponse } from 'next/server';
import { seedCategoryTypes } from '@/lib/seed';

export async function POST() {
  try {
    // Vérifier que nous sommes en développement
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Seed endpoint is disabled in production' },
        { status: 403 }
      );
    }

    await seedCategoryTypes();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed database',
      },
      { status: 500 }
    );
  }
}