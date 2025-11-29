import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'DreamTeam@2024';

// Durée de validité du token : 7 jours
const TOKEN_EXPIRATION = '7d';
const COOKIE_NAME = 'auth-token';

export interface SessionPayload {
  authenticated: boolean;
  expiresAt: Date;
}

/**
 * Vérifie si le mot de passe fourni correspond au mot de passe admin
 */
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Crée un token JWT pour l'authentification
 */
export async function createToken(): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const token = await new SignJWT({
    authenticated: true,
    expiresAt: expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      authenticated: payload.authenticated as boolean,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Récupère la session depuis les cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Définit le cookie d'authentification
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
    path: '/',
  });
}

/**
 * Supprime le cookie d'authentification
 */
export async function deleteAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    return false;
  }

  // Vérifier si le token n'est pas expiré
  return session.authenticated && new Date() < session.expiresAt;
}