import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier l'authentification pour les routes protégées
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Rediriger vers la page de login si pas de token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier la validité du token
  const session = await verifyToken(token);

  if (!session || !session.authenticated || new Date() > session.expiresAt) {
    // Token invalide ou expiré, rediriger vers login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api/auth/* (routes d'authentification)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, sitemap.xml, robots.txt (fichiers publics)
     * - images dans /public
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};