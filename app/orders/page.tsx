"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMyOrders, updateOrderStatus } from "@/lib/api/orders";
import { FaArrowLeft, FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle, FaComment } from "react-icons/fa";
import { toast } from "sonner";
import { ImagePreview } from "@/components/ImagePreview";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const data = await fetchMyOrders(token);
        setOrders(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <FaClock className="text-amber-500" />;
      case "accepted": return <FaCheckCircle className="text-blue-500" />;
      case "completed": return <FaCheckCircle className="text-green-500" />;
      case "rejected":
      case "cancelled": return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <FaArrowLeft />
            <span>Store</span>
          </button>
          <h1 className="text-xl font-black text-gray-900">My Orders</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-bold">Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="text-4xl text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
             <p className="text-gray-500 max-w-xs mx-auto mb-8">You haven't placed any orders yet. Start exploring the campus marketplaces!</p>
             <button 
               onClick={() => router.push("/products")}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
             >
                Start Shopping
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {order.storeId?.name || "Store"}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Order #{order._id.slice(-6)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-xs font-bold capitalize">
                      {getStatusIcon(order.status)}
                      <span className={
                        order.status === 'pending' ? 'text-amber-600' :
                        order.status === 'accepted' ? 'text-blue-600' :
                        order.status === 'completed' ? 'text-green-600' :
                        'text-red-600'
                      }>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image && item.image.length > 0 ? (
                          <img 
                            src={item.image[0]} 
                            alt={item.name} 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => setPreviewImage(item.image[0])}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs"><FaShoppingBag /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Total Amount</p>
                    <p className="text-xl font-black text-indigo-600">₹{order.totalAmount}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/orders/${order._id}/chat`)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <FaComment />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
       {/* Full Screen Image Preview Overlay */}
       <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
