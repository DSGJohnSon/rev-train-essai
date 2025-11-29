import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await deleteAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la déconnexion',
      },
      { status: 500 }
    );
  }
}