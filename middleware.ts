import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Robust JWT decode for Edge Runtime
function isTokenValid(token: string | undefined): boolean {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = parts[1];
        // Add padding if necessary
        const padding = '='.repeat((4 - (payload.length % 4)) % 4);
        const base64 = (payload + padding).replace(/-/g, '+').replace(/_/g, '/');

        const decoded = JSON.parse(atob(base64));

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

    // 1. Define public routes
    const isMainPublicRoute =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register';

    const isPublicApiRoute =
        pathname === '/api/login' ||
        pathname === '/api/register' ||
        pathname === '/api/logout';

    // 2. If user is authenticated and tries to access login/register, redirect to landing
    if (authenticated && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Allow access to public routes, static files, and internal Next.js assets
    if (
        isMainPublicRoute ||
        isPublicApiRoute ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public/') // Just in case
    ) {
        return NextResponse.next();
    }

    // 4. Protect ALL other routes (including non-public API routes)
    if (!authenticated) {
        // For API routes, return a 401 instead of redirecting to login page
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

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
