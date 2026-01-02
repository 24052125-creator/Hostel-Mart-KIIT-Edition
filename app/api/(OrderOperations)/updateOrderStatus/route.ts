import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import decodeToken from "../../auth";
import Order from "@/models/Order";
import Store from "@/models/Store";

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ message: "Missing orderId or status" }, { status: 400 });
        }

        const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // Authorization Logic
        // Buyer can: Cancel (if pending/accepted?), Complete (if accepted?)
        // Seller can: Accept (if pending), Reject (if pending), Complete (if accepted)

        const userId = decodedToken.id;
        const isBuyer = order.buyerId.toString() === userId;

        let isSeller = false;
        // Check if user owns the store of this order
        const store = await Store.findById(order.storeId);
        if (store && store.userId.toString() === userId) {
            isSeller = true;
        }

        if (!isBuyer && !isSeller) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // State Transition Rules
        // 1. Pending -> Accepted/Rejected (Seller only)
        // 2. Pending -> Cancelled (Buyer only)
        // 3. Accepted -> Completed (Seller or Buyer)
        // 4. Accepted -> Cancelled (Buyer? Maybe restrictive)

        const currentStatus = order.status;

        // Seller Actions
        if (isSeller) {
            if (status === "accepted" && currentStatus !== "pending") {
                return NextResponse.json({ message: "Order must be pending to accept" }, { status: 400 });
            }
            if (status === "rejected" && currentStatus !== "pending") {
                return NextResponse.json({ message: "Order must be pending to reject" }, { status: 400 });
            }
            if (status === "completed" && currentStatus !== "accepted") {
                return NextResponse.json({ message: "Order must be accepted to complete" }, { status: 400 });
            }
        }

        // Buyer Actions
        if (isBuyer) {
            if (status === "cancelled" && currentStatus !== "pending") {
                return NextResponse.json({ message: "Can only cancel pending orders" }, { status: 400 });
            }
            if (status === "completed") {
                return NextResponse.json({ message: "Only seller can mark as completed" }, { status: 403 });
            }
            // Prevent Buyer from accepting/rejecting
            if (status === "accepted" || status === "rejected") {
                return NextResponse.json({ message: "Only seller can accept/reject" }, { status: 403 });
            }
        }

        // Apply Update
        order.status = status;
        await order.save();

        return NextResponse.json({ message: "Order status updated", order }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
