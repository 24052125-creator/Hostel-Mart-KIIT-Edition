"use client";

import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { Product } from "@/types";
import { AddProductModal } from "@/components/AddProductModal";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/hooks/use-store";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { getStoreByUserId } from "@/lib/api/stores";
import { useRouter } from "next/navigation";

export default function MyStore() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { store, removeStore, setStore } = useStore();
  const router = useRouter();

  // Validate store and fetch products on component mount
  useEffect(() => {
    const validateStoreAndLoadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        
        if (!token || !userRaw) {
          setError("Please log in to view your products");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userRaw);
        const userId = user._id || user.id;

        if (!userId) {
          setError("User ID not found");
          setLoading(false);
          return;
        }

        // Validate store exists in backend
        if (store) {
          const backendStore = await getStoreByUserId(userId, token);
          
          if (!backendStore) {
            // Store was deleted from backend, clear localStorage
            console.log("Store not found in backend, clearing localStorage");
            removeStore();
            setError("Your store was deleted. Redirecting to dashboard...");
            setTimeout(() => {
              router.push("/dasboard");
            }, 2000);
            setLoading(false);
            return;
          } else {
            // Store exists, sync localStorage with backend data
            setStore(backendStore);
          }
        } else {
          // No store in localStorage, redirect to dashboard
          setError("No store found. Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dasboard");
          }, 2000);
          setLoading(false);
          return;
        }

        // Store is valid, fetch products
        const fetchedProducts = await fetchProducts(userId, token);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    validateStoreAndLoadProducts();
  }, []); // Run only once on mount

  const handleSaveProduct = async (productData: Product) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      if (!store?._id) {
        setError("Store information not found. Please set up your store first.");
        return;
      }

      if (editingProduct && editingProduct._id) {
        // Update existing product
        const updatedProduct = await updateProduct(editingProduct._id, productData, token);
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      } else {
        // Create new product
        const productWithStore = { ...productData, storeId: store._id };
        const newProduct = await createProduct(productWithStore, token);
        setProducts(prev => [...prev, newProduct]);
      }
      
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      await deleteProduct(productId, token);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return;

      const updatedProduct = await updateProduct(productId, { stock: newStock }, token);
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: updatedProduct.stock } : p));
    } catch (err) {
      console.error("Error updating stock:", err);
      setError(err instanceof Error ? err.message : "Failed to update stock");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="w-full text-center font-extrabold text-6xl text-indigo-400 mt-6 mb-8">
        My Store
      </header>

      <div className="flex-1 px-8 pb-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <p className="text-xl font-medium mb-2">Your store is empty</p>
            <p className="text-sm">Click the + button to add your first product</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="group relative flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <FaPlus className="text-2xl" />
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl transform translate-x-2 group-hover:translate-x-0 transition-transform">
            Add Product
          </span>
        </button>
      </div>

      {isModalOpen && (
        <AddProductModal
          onClose={closeModal}
          onAdd={handleSaveProduct}
          initialData={editingProduct}
        />
      )}
    </div>
  );
}

