import { useLocalStorage } from 'usehooks-ts';
import { toast } from 'sonner';

export interface CartItem {
    productId: string;
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

export function useCart() {
    const [cart, setCart, removeCart] = useLocalStorage<CartData | null>('cart', null);

    const addToCart = (product: any, storeId: string): boolean => {
        // Enforce single-store restriction
        if (cart && cart.items.length > 0 && cart.storeId !== storeId) {
            toast.error("Cart contains items from another store. Please clear cart first.");
            return false;
        }

        const existingItem = cart?.items.find(item => item.productId === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + 1 > (product.stock || 0)) {
            toast.error(`Only ${product.stock || 0} items available in stock`);
            return false;
        }

        setCart((prevCart) => {
            const currentCart = (prevCart && prevCart.storeId === storeId)
                ? prevCart
                : { storeId, items: [] };

            const existingItemIndex = currentCart.items.findIndex(item => item.productId === product._id);

            if (existingItemIndex > -1) {
                const updatedItems = [...currentCart.items];
                updatedItems[existingItemIndex].quantity += 1;
                return { ...currentCart, items: updatedItems };
            } else {
                const newItem: CartItem = {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    stock: product.stock // Added stock to CartItem for easy checking in CartPage
                };
                return { ...currentCart, items: [...currentCart.items, newItem] };
            }
        });
        return true;
    };

    return { cart, setCart, removeCart, addToCart };
}
