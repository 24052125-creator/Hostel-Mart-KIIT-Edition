"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { FaArrowLeft, FaTrash, FaPlus, FaMinus, FaShoppingCart, FaStore } from "react-icons/fa";
import { toast } from "sonner";
import { placeOrder } from "@/lib/api/orders";

export default function CartPage() {
  const router = useRouter();
  const { cart, clearCartOnly, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = React.useState(false);
  

  const handleUpdateQuantity = async (productId: string, delta: number) => {
    await updateQuantity(productId, delta);
  };

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
    toast.info("Item removed from cart");
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to place an order");
        router.push("/login");
        return;
      }

      const orderData = {
        storeId: cart.storeId,
        items: cart.items,
        totalAmount: total
      };

      await placeOrder(orderData, token);
      
      toast.success("Order Placed Successfully");
      await clearCartOnly();
      
      // Store a flag or redirect to my orders
      localStorage.setItem("lastOrderId", "placed"); // Simple flag to trigger UI change elsewhere
      
      router.push("/orders");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const total = cart?.items.reduce((acc, item) => {
    const price = parseFloat(item.price || "0");
    return acc + (price * item.quantity);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-black text-gray-900">Your Cart</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-4xl text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
             <p className="text-gray-500 max-w-xs mx-auto mb-8">You haven't added anything to your cart yet.</p>
             <button 
               onClick={() => router.push("/products")}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
             >
                Start Shopping
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               {cart.items.map((item) => (
                 <div key={item.productId} className="flex items-center gap-4 py-6 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                       {item.image && item.image.length > 0 ? (
                         <img src={item.image[0]} alt={item.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300"><FaShoppingCart /></div>
                       )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                       <p className="text-indigo-600 font-extrabold">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                       <button 
                         onClick={() => handleUpdateQuantity(item.productId, -1)}
                         className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                       >
                         <FaMinus />
                       </button>
                       <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                       <button 
                         onClick={() => handleUpdateQuantity(item.productId, 1)}
                         disabled={item.stock <= 0}
                         className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                       >
                         <FaPlus />
                       </button>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                 </div>
               ))}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</span>
               </div>
               <button 
                 onClick={handlePlaceOrder}
                 disabled={loading}
                 className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? "Placing Order..." : "Place Order"}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
