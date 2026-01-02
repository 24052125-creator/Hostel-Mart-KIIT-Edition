"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCommentDots, FaSpinner, FaInbox } from "react-icons/fa";
import { toast } from "sonner";

interface Order {
  _id: string;
  buyerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function SellerChatsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const storeRaw = localStorage.getItem("store");

        if (!token || !storeRaw) {
          router.push("/dasboard");
          return;
        }

        const store = JSON.parse(storeRaw);

        const res = await fetch(
          `/api/getStoreOrders/${store._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        // Show all orders for now to ensure chat is accessible
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="text-4xl text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Chats
          </h1>
          <p className="text-gray-600">
            Chat with buyers about their active orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FaInbox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Active Chats
            </h2>
            <p className="text-gray-500">
              You don't have any active orders to chat about
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() =>
                  router.push(`/dasboard/my-store/orders/${order._id}/chat`)
                }
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCommentDots className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {order.buyerName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{order._id.slice(-8)} • ₹{order.totalAmount}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status:{" "}
                        <span className="capitalize font-medium">
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium">
                    Open Chat →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
