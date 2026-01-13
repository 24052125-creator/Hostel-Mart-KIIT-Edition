import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { updateProduct } from '@/lib/api/products';
import {
    addToCartAPI,
    getCartAPI,
    updateCartItemAPI,
    removeCartItemAPI,
    clearCartAPI,
    CartItem,
    CartData
} from '@/lib/api/cart';

export function useCart() {
    const [cart, setCartState] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(userStr);
            const backendCart = await getCartAPI(user._id || user.id, token);

            if (backendCart && backendCart.items) {
                // Flatten populated items
                backendCart.items = backendCart.items.map((item: any) => {
                    if (item.productId && typeof item.productId === 'object') {
                        const product = item.productId;
                        return {
                            ...item,
                            productId: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            stock: product.stock
                        };
                    }
                    return item;
                });
            }

            setCartState(backendCart);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and migration
    useEffect(() => {
        const syncCart = async () => {
            const token = localStorage.getItem('token');
            const localCartStr = localStorage.getItem('cart');

            if (token && localCartStr) {
                try {
                    const localCart = JSON.parse(localCartStr) as CartData;
                    if (localCart.items.length > 0) {
                        toast.info("Syncing your local cart to the cloud...");
                        for (const item of localCart.items) {
                            try {
                                await addToCartAPI(localCart.storeId, item.productId, item.quantity, token);
                            } catch (error: any) {
                                console.warn(`Failed to sync item ${item.productId}:`, error.message);
                                // Continue syncing other items
                            }
                        }
                        toast.success("Cart synced successfully!");
                    }
                    localStorage.removeItem('cart'); // Remove local after sync
                } catch (error) {
                    console.error("Migration failed:", error);
                }
            }
            await fetchCart();
        };

        syncCart();
    }, [fetchCart]);



    const addToCart = async (product: any, storeId: string): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to add items to cart");
            return false;
        }

        if (cart && cart.items.length > 0 && cart.storeId && cart.storeId.toString() !== storeId.toString()) {
            toast.error("Cart contains items from another store. Please clear cart first.");
            return false;
        }

        if (product.stock <= 0) {
            toast.error(`Item is out of stock`);
            return false;
        }


        try {
            // Add to Backend Cart
            await addToCartAPI(storeId, product._id || product.productId, 1, token);

            // Refresh local state
            await fetchCart();
            toast.success("Added to cart");
            return true;
        } catch (error: any) {
            toast.error(error.message || "Failed to add to cart");
            return false;
        }
    };

    const updateQuantity = async (productId: string, delta: number) => {
        const token = localStorage.getItem('token');
        if (!token || !cart) return;

        const item = cart.items.find(i => i.productId === productId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) return;

        if (delta > 0 && (item.stock || 0) <= 0) {
            toast.error("No more stock available");
            return;
        }

        try {
            // Update Backend Cart
            await updateCartItemAPI(productId, newQty, token);

            // Refresh local state
            await fetchCart();
        } catch (error: any) {
            toast.error(error.message || "Failed to update quantity");
        }
    };

    const removeFromCart = async (productId: string) => {
        const token = localStorage.getItem('token');
        if (!token || !cart) return;

        const item = cart.items.find(i => i.productId === productId);
        if (!item) return;

        try {
            // Remove from Backend Cart
            await removeCartItemAPI(productId, token);

            // Refresh local state
            await fetchCart();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove item");
        }
    };

    const clearCartOnly = async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;

        try {
            const user = JSON.parse(userStr);
            await clearCartAPI(user._id || user.id, token);
            setCartState(null);
        } catch (error: any) {
            console.error("Failed to clear cart:", error);
        }
    };

    const clearCart = async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr || !cart) return;

        try {
            const user = JSON.parse(userStr);
            // Clear Backend Cart
            await clearCartAPI(user._id || user.id, token);

            setCartState(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to clear cart");
        }
    };

    const removeCart = () => {
        // This is now redundant but kept for compatibility
        setCartState(null);
    };

    return {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearCartOnly,
        removeCart,
        refreshCart: fetchCart
    };
}
