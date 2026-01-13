"use client";

import React, { useState, useEffect } from "react";
import { fetchStoreOrders, updateOrderStatus } from "@/lib/api/orders";
import { useStore } from "@/hooks/use-store";
import { FaInbox, FaUser, FaShoppingBag, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

export default function ActiveOrdersPage() {
  const { store } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadStoreOrders = async () => {
      if (!store?._id) return;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const data = await fetchStoreOrders(store._id, token);
        setOrders(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load store orders");
      } finally {
        setLoading(false);
      }
    };
    
    if (store) {
      loadStoreOrders();
    }
  }, [store]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Active Orders</h1>
        <p className="text-gray-500 font-medium">Manage incoming orders for {mounted ? (store?.name || "your store") : "your store"}</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-bold">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center p-12">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FaInbox className="text-3xl text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
          <p className="text-gray-500 max-w-xs">When customers buy from your store, their orders will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FaUser size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                       {order.buyerName}
                       <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">Buyer</span>
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Order #{order._id.slice(-6)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 bg-gray-50/50 rounded-3xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">Order Items</p>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                         {item.image && item.image.length > 0 ? (
                           <img src={item.image[0]} alt={item.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><FaShoppingBag size={14} /></div>
                         )}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-indigo-600">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {order.status === 'pending' && (
                  <>
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          if (!token) return;
                          await updateOrderStatus(order._id, "accepted", token);
                          toast.success("Order accepted!");
                          window.location.reload(); 
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-100"
                    >
                      <FaCheck />
                      <span>Accept</span>
                    </button>
                    <button 
                       onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          if (!token) return;
                          await updateOrderStatus(order._id, "rejected", token);
                          toast.success("Order rejected");
                          window.location.reload();
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                {order.status === 'accepted' && (
                   <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          if (!token) return;
                          await updateOrderStatus(order._id, "completed", token);
                          toast.success("Order completed!");
                          window.location.reload();
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                    >
                      <FaCheck />
                      <span>Mark Completed</span>
                    </button>
                )}

                {(order.status === 'completed' || order.status === 'rejected' || order.status === 'cancelled') && (
                    <div className="w-full py-4 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl">
                      Status: <span className="uppercase">{order.status}</span>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
