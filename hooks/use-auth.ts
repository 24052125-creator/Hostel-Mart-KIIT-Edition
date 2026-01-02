"use client";

import { useEffect, useState } from "react";
import { checkTokenValidity } from "@/lib/auth";

/**
 * Custom hook to monitor JWT token validity
 * Automatically logs out user when token expires
 */
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check token validity on mount
        const isValid = checkTokenValidity();
        setIsAuthenticated(isValid);

        // Set up interval to check token every minute
        const intervalId = setInterval(() => {
            const isValid = checkTokenValidity();
            setIsAuthenticated(isValid);
        }, 60000); // Check every 60 seconds

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    return { isAuthenticated };
}
