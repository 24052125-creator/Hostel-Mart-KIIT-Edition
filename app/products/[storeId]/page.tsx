"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductsByStoreId } from "@/lib/api/products";
import { getStoreByID, StoreData } from "@/lib/api/stores";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { FaArrowLeft, FaShoppingCart, FaStore, FaShoppingBag } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

export default function StoreProductsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { addToCart, cart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, storeData] = await Promise.all([
          fetchProductsByStoreId(storeId),
          getStoreByID(storeId)
        ]);
        setProducts(productsData);
        setStore(storeData);
      } catch (error) {
        console.error("Error loading store products:", error);
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      loadData();
    }
  }, [storeId]);

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart(product, storeId);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const cartItemCount = cart && cart.storeId === storeId 
    ? cart.items.reduce((acc, item) => acc + item.quantity, 0) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="flex flex-col items-center">
             <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <FaStore className="text-indigo-600" />
                {store?.name || "Store"}
             </h1>
             <p className="text-xs text-gray-500 font-medium">
                {store?.hostel} • Floor {store?.floor}
             </p>
          </div>

          <button 
            onClick={() => router.push("/cart")}
            className="relative p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all font-bold group"
          >
            <FaShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-in zoom-in">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-bold">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaStore className="text-4xl text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h2>
             <p className="text-gray-500 max-w-xs mx-auto">This store hasn't added any products to their listing yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                mode="customer"
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Go to Cart / My Order Button */}
      {cartItemCount > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => router.push("/cart")}
            className="w-full max-w-md bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-100"
          >
            <FaShoppingCart />
            <span>Go to Cart ({cartItemCount})</span>
          </button>
        </div>
      ) : localStorage.getItem("lastOrderId") === "placed" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => router.push("/orders")}
            className="w-full max-w-md bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 shadow-green-100"
          >
            <FaShoppingBag />
            <span>Go to My Orders</span>
          </button>
        </div>
      )}
    </div>
  );
}
