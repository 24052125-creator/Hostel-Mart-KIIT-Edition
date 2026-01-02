"use client";

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Product } from "@/types";
import FileUpload from "./FileUpload";
import { ImagePreview } from "./ImagePreview";

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
  initialData?: Product | null;
}

type Tag = "fixed price" | "negotiable" | "doorstep delivery" | "at mrp";

export function AddProductModal({ onClose, onAdd, initialData }: AddProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>( initialData || {
    name: "",
    price: "",
    size: "",
    description: "",
    tags: [],
    image: [],
    stock: 0,
  });

  // Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const availableTags: Tag[] = ["fixed price", "negotiable", "doorstep delivery", "at mrp"];

  const toggleTag = (tag: Tag) => {
    setFormData((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleImageUpload = (url: string) => {
    console.log("handleImageUpload called with:", url);
    setFormData(prev => {
      const updatedImages = [...(prev.image || []), url];
      console.log("Updated formData images:", updatedImages);
      return {
        ...prev,
        image: updatedImages
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.size && formData.stock !== undefined) {
       onAdd(formData as Product);
       // Reset form handled by unmount, but good practice if reused
       onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              name="name"
              required
              value={formData.name || ""}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="e.g. Vintage Denim Jacket"
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                name="price"
                type="number"
                required
                value={formData.price || ""}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="499"
                onChange={handleChange}
              />
            </div>
            <div className="w-1/3">
               <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
               <input
                name="size"
                required
                value={formData.size || ""}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="e.g. M, L"
                onChange={handleChange}
              />
            </div>
            <div className="w-1/3">
               <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
               <input
                name="stock"
                type="number"
                required
                min="0"
                value={formData.stock}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="10"
                onChange={handleChange}
              />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    formData.tags?.includes(tag)
                      ? "bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
             <textarea
                name="description"
                rows={3}
                value={formData.description || ""}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                placeholder="Describe your product..."
                 onChange={handleChange}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
             
             {/* New Image Upload Component */}
             <FileUpload onSuccess={handleImageUpload} />

             {formData.image && formData.image.length > 0 && (
               <div className="mt-3 flex gap-2 overflow-x-auto py-2">
                 {formData.image.map((url, index) => (
                   <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 group cursor-pointer hover:opacity-90 transition-opacity">
                     <img 
                      src={url} 
                      alt={`Product ${index}`} 
                      className="w-full h-full object-cover" 
                      onClick={() => setPreviewImage(url)} 
                    />
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         setFormData(prev => ({ ...prev, image: prev.image?.filter((_, i) => i !== index) }));
                       }}
                       className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                     >
                       <FaTimes size={10} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-200 transition-all mt-4 sticky bottom-0"
          >
            {initialData ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </div>

       {/* Full Screen Image Preview Overlay */}
       <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
