const API_BASE_URL = "/api";

export interface CartItem {
    productId: any;
    name: string;
    price: string;
    image: string[];
    quantity: number;
    stock: number;
}

export interface CartData {
    storeId: string;
    items: CartItem[];
}

/**
 * Add an item to the backend cart
 */
export async function addToCartAPI(storeId: string, productId: string, quantity: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/addProduct/${storeId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
    }
    return response.json();
}

/**
 * Fetch all cart items from backend
 */
export async function getCartAPI(userId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/getAllCartItems/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch cart");
    }
    const data = await response.json();
    // The API seems to return an array "cart" which actually contains one cart object
    return data.cart && data.cart[0] ? data.cart[0] : null;
}

/**
 * Update cart item quantity
 */
export async function updateCartItemAPI(productId: string, quantity: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/updateCartItem/${productId}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update cart");
    }
    return response.json();
}

/**
 * Remove an item from the cart
 */
export async function removeCartItemAPI(productId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/deleteCartItem/${productId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove from cart");
    }
    return response.json();
}

/**
 * Clear the entire cart
 */
export async function clearCartAPI(userId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/deleteCart/${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to clear cart");
    }
    return response.json();
}

/**
 * Get cart count (for badges)
 */
export async function getCartCountAPI(token: string) {
    const response = await fetch(`${API_BASE_URL}/cartSummary`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        return 0;
    }
    const data = await response.json();
    return data.count || 0;
}
