"use client";

import { useParams, useRouter } from "next/navigation";
import { ChatBox } from "@/components/ChatBox";
import { FaArrowLeft } from "react-icons/fa";

export default function SellerChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dasboard/my-store/orders")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Active Orders</span>
        </button>

        {/* Chat Container */}
        <ChatBox orderId={orderId} userType="seller" />
      </div>
    </div>
  );
}
