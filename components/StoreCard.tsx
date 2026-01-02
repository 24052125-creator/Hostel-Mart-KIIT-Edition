import React from "react";
import { FaStore, FaMapMarkerAlt, FaLayerGroup } from "react-icons/fa";
import { StoreData } from "@/lib/api/stores";

interface StoreCardProps {
  store: StoreData;
  onClick?: (storeId: string) => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  return (
    <div 
      onClick={() => onClick?.(store._id)}
      className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer active:scale-95 flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
          <FaStore className="text-2xl" />
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {store.name}
        </h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <FaMapMarkerAlt className="text-indigo-400" />
            </div>
            <span>{store.hostel}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <FaLayerGroup className="text-indigo-400" />
            </div>
            <span>Floor: {store.floor}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
        <span className="text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Visit Store <span>→</span>
        </span>
        <div className="flex -space-x-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
               <div className="w-full h-full bg-indigo-100" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
