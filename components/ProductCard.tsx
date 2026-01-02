import React from "react";
import { Product } from "@/types";
import { FaTag, FaEdit, FaTrash, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import { useState } from "react";

import { ImagePreview } from "./ImagePreview";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onStockUpdate?: (productId: string, newStock: number) => void;
  mode?: "owner" | "customer";
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onAddToCart,
  onStockUpdate,
  mode = "owner" 
}: ProductCardProps) {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [localStock, setLocalStock] = useState(product.stock || 0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync localStock with product.stock when it changes externally (e.g., via modal)
  React.useEffect(() => {
    setLocalStock(product.stock || 0);
  }, [product.stock]);

  const handleStockSave = () => {
    if (onStockUpdate && product._id) {
      onStockUpdate(product._id, localStock);
    }
    setIsEditingStock(false);
  };

  const handleEnterEditMode = () => {
    setLocalStock(product.stock || 0);
    setIsEditingStock(true);
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Simulation of Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {product.image && product.image.length > 0 ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
              src={product.image[0]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(product.image?.[0] || null);
              }}
            />
        ) : (
             <span className="text-gray-400 font-medium">No Image</span>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">
            {product.size}
        </div>
        
        {/* Action Buttons Overlay */}
        {mode === "owner" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button 
               onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
               className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
               title="Edit Product"
             >
               <FaEdit />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete?.(product._id!); }}
               className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg"
               title="Delete Product"
             >
               <FaTrash />
             </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{product.name}</h3>
           <span className="font-extrabold text-green-600">₹{product.price}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {product.description || "No description provided."}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
            {product.tags && product.tags.map((tag) => (
              <span key={tag} className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1
                  ${tag === 'negotiable' ? 'bg-amber-100 text-amber-700' : 
                    tag === 'fixed price' ? 'bg-blue-100 text-blue-700' :
                    tag === 'doorstep delivery' ? 'bg-green-100 text-green-700' : 
                    tag === 'at mrp' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }
              `}>
                  <FaTag className="text-[10px]" />
                  {tag}
              </span>
            ))}
        </div>

        {/* Stock Management */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Availability</span>
            <span className={`text-sm font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {mode === "owner" 
                ? (product.stock > 0 ? `${product.stock} in stock` : "Out of stock")
                : (product.stock > 0 ? "In stock" : "Out of stock")
              }
            </span>
          </div>

          {mode === "owner" && (
            <div className="flex items-center gap-2">
              {isEditingStock ? (
                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-indigo-100 animate-in slide-in-from-right-2 duration-200">
                  <button 
                    onClick={() => setLocalStock(prev => Math.max(0, prev - 1))}
                    className="p-1.5 text-indigo-600 hover:bg-white rounded-md transition-colors"
                  >
                    <FaMinus size={12} />
                  </button>
                  <input 
                    type="number"
                    value={localStock}
                    onChange={(e) => setLocalStock(Number(e.target.value))}
                    className="w-12 bg-transparent text-center font-bold text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={() => setLocalStock(prev => prev + 1)}
                    className="p-1.5 text-indigo-600 hover:bg-white rounded-md transition-colors"
                  >
                    <FaPlus size={12} />
                  </button>
                  <button 
                    onClick={handleStockSave}
                    className="ml-1 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <FaCheck size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEnterEditMode}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100/50"
                >
                  Update Stock
                </button>
              )}
            </div>
          )}
        </div>

        {mode === "customer" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            disabled={product.stock <= 0}
            className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:active:scale-100"
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        )}
      </div>
      
       {/* Full Screen Image Preview Overlay */}
       <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
