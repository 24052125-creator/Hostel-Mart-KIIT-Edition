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
 * Handle logout - clear localStorage and redirect
 */
export function handleLogout(showToast: boolean = false, redirectTo: string = '/'): void {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    localStorage.removeItem('role');
    localStorage.removeItem('lastOrderId');

    // Clear the token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";

    if (showToast) {
        toast.error('Your session has expired. Please login again.');
    }

    // Redirect to home page
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
