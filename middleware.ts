import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic JWT decode for Edge Runtime
function isTokenValid(token: string | undefined): boolean {
    if (!token) return false;
    try {
        const payload = token.split('.')[1];
        if (!payload) return false;
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

        // Check expiration (exp is in seconds)
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    } catch (e) {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    const authenticated = isTokenValid(token);

    // Define public routes
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register';

    // Allow access to public routes, static files, and API routes
    if (
        isPublicRoute ||
        pathname.includes('/_next') ||
        pathname.includes('/api/login') ||
        pathname.includes('/api/register') ||
        pathname.includes('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Redirect to login if unauthenticated for protected routes
    if (!authenticated) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
