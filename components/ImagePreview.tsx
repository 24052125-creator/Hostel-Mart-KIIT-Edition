"use client";

import React from "react";
import { FaTimes } from "react-icons/fa";

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

export function ImagePreview({ src, onClose }: ImagePreviewProps) {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 active:scale-95 z-50"
        onClick={onClose}
      >
        <FaTimes size={24} />
      </button>
      <img 
        src={src} 
        alt="Preview" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
}
