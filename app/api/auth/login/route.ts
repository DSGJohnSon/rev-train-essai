import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Vérification du mot de passe
    if (!verifyPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mot de passe incorrect',
        },
        { status: 401 }
      );
    }

    // Création du token
    const token = await createToken();

    // Définition du cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Authentification réussie',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la connexion',
      },
      { status: 500 }
    );
  }
}