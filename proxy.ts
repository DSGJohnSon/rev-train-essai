import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées (backoffice uniquement)
  const protectedRoutes = ['/dashboard', '/questions', '/categories', '/category-types'];
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Si ce n'est pas une route protégée, laisser passer
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Pour les routes protégées, vérifier l'authentification
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