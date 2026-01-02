const API_BASE_URL = "/api";

export interface StoreData {
    _id: string;
    name: string;
    hostel: string;
    floor: string;
    userId: string;
}

/**
 * Fetch store by user ID
 */
export async function getStoreByUserId(userId: string, token: string): Promise<StoreData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/getStoreByUserId/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // If store doesn't exist, return null instead of throwing
            if (response.status === 400) {
                return null;
            }
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch store");
        }

        const data = await response.json();
        // The API returns a single store object
        return data.store || null;
    } catch (error) {
        console.error("Error fetching store:", error);
        throw error;
    }
}

/**
 * Fetch all stores
 */
export async function getAllStores(): Promise<StoreData[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllStores`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch all stores");
        }

        const data = await response.json();
        return data.stores || [];
    } catch (error) {
        console.error("Error fetching all stores:", error);
        throw error;
    }
}
/**
 * Fetch store by ID
 */
export async function getStoreByID(storeId: string): Promise<StoreData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/getStoreByStoreId/${storeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch store");
        }

        const data = await response.json();
        return data.store || null;
    } catch (error) {
        console.error("Error fetching store by ID:", error);
        throw error;
    }
}
