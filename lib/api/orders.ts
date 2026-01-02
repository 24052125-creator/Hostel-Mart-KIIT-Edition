const API_BASE_URL = "/api";

export async function placeOrder(orderData: any, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/placeOrder`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to place order");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in placeOrder API:", error);
        throw error;
    }
}

export async function fetchMyOrders(token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/getMyOrders`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch orders");
        }

        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error("Error in fetchMyOrders API:", error);
        throw error;
    }
}

export async function fetchStoreOrders(storeId: string, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/getStoreOrders/${storeId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch store orders");
        }

        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error("Error in fetchStoreOrders API:", error);
        throw error;
    }
}

export async function updateOrderStatus(orderId: string, status: string, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/updateOrderStatus`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update order status");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}
