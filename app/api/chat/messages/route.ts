import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/mongodb";
import ChatMessage from "@/models/ChatMessage";
import Order from "@/models/Order";
import Store from "@/models/Store";
import jwt from "jsonwebtoken";

const TIMEOUT = 30000; // 30 seconds
const POLL_INTERVAL = 1000; // Check every 1 second

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
        const lastMessageId = searchParams.get("lastMessageId");

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
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const isBuyer = order.buyerId.toString() === userId;
        const store = await Store.findById(order.storeId);
        const isSeller = store && store.userId.toString() === userId;

        if (!isBuyer && !isSeller) {
            console.log("DEBUG POLLING UNAUTHORIZED:", {
                userId,
                orderId,
                isBuyer,
                isSeller
            });
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Long polling logic
        let elapsed = 0;
        while (elapsed < TIMEOUT) {
            const query: any = { chatId: orderId };

            if (lastMessageId) {
                query._id = { $gt: lastMessageId };
            }

            const messages = await ChatMessage.find(query)
                .sort({ createdAt: 1 })
                .lean();

            if (messages.length > 0) {
                return NextResponse.json(messages);
            }

            // Wait before next check
            await sleep(POLL_INTERVAL);
            elapsed += POLL_INTERVAL;
        }

        // Timeout reached, return empty array
        return NextResponse.json([]);
    } catch (error) {
        console.error("Error polling messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
