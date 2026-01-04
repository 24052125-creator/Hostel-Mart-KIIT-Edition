import { Product } from "@/types";

const API_BASE_URL = "/api";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Fetch all products for a specific user
 */
export async function fetchProducts(userId: string, token: string): Promise<Product[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllProductsUsingUserId/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch products");
        }

        const data = await response.json();
        return data.product || [];
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

/**
 * Create a new product
 */
export async function createProduct(
    productData: Omit<Product, "_id">,
    token: string
): Promise<Product> {
    try {
        const response = await fetch(`${API_BASE_URL}/addProduct`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create product");
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(
    productId: string,
    productData: Partial<Product>,
    token: string
): Promise<Product> {
    try {
        const response = await fetch(`${API_BASE_URL}/updateProduct/${productId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Create product API failed:", response.status, errorData);
            throw new Error(errorData.error || "Failed to update product");
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/deleteProduct/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete product");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}
/**
 * Fetch all products for a specific store
 */
export async function fetchProductsByStoreId(storeId: string): Promise<Product[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getProductsByStoreId/${storeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch products");
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error("Error fetching products by store ID:", error);
        throw error;
    }
}
