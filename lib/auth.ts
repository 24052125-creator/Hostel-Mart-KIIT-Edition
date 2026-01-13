import { toast } from "sonner";

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        // exp is in seconds, Date.now() is in milliseconds
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
}

/**
 * Handle logout - clear localStorage, call API to clear cookie, and redirect
 */
export async function handleLogout(showToast: boolean = false, redirectTo: string = '/'): Promise<void> {
    // 1. Clear the token cookie via API (since it's httpOnly)
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
        console.error('Error calling logout API:', error);
        // Fallback: try to clear it client-side anyway (won't work for httpOnly but safe to have)
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";
    }

    // 2. Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    localStorage.removeItem('role');
    localStorage.removeItem('lastOrderId');

    if (showToast) {
        toast.error('You have been logged out.');
    }

    // 3. Redirect to destination
    if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
    }
}

/**
 * Check token validity and auto-logout if expired
 */
export function checkTokenValidity(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    if (isTokenExpired(token)) {
        handleLogout(true);
        return false;
    }

    return true;
}
