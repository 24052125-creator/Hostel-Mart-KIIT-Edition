import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/mongodb";
import ChatMessage from "@/models/ChatMessage";
import Order from "@/models/Order";
import Store from "@/models/Store";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get user from token
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
            id: string;
        };
        const userId = decoded.id;

        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId is required" },
                { status: 400 }
            );
        }

        // Verify access to order
        let order;
        try {
            order = await Order.findById(orderId);
        } catch (e) {
            return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
        }

        if (!order) {
            console.log("DEBUG CHAT: Order not found", orderId);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const isBuyer = order.buyerId.toString() === userId;
        const store = await Store.findById(order.storeId);
        const isSeller = store && store.userId.toString() === userId;

        console.log("DEBUG CHAT:", {
            tokenUserId: userId,
            orderId,
            buyerId: order.buyerId.toString(),
            storeId: order.storeId,
            storeOwnerId: store?.userId?.toString(),
            isBuyer,
            isSeller
        });

        if (!isBuyer && !isSeller) {
            return NextResponse.json({ error: "Unauthorized access to this chat" }, { status: 403 });
        }

        // Get all messages for this order
        const messages = await ChatMessage.find({ chatId: orderId })
            .populate('senderId', 'userName')
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
