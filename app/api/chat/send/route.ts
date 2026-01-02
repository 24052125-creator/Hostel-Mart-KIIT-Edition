import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/mongodb";
import ChatMessage from "@/models/ChatMessage";
import Order from "@/models/Order";
import Store from "@/models/Store";
import jwt from "jsonwebtoken";
import { z } from "zod";

const sendMessageSchema = z.object({
    orderId: z.string(),
    text: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest) {
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

        // Parse and validate request body
        const body = await req.json();
        const validation = sendMessageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { orderId, text } = validation.data;

        // Get order and verify access
        const order = await Order.findById(orderId).populate("storeId");
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user is buyer or seller
        const isBuyer = order.buyerId.toString() === userId;
        const store = await Store.findById(order.storeId);
        const isSeller = store && store.userId.toString() === userId;

        if (!isBuyer && !isSeller) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Create message
        const message = await ChatMessage.create({
            chatId: orderId,
            orderId: orderId,
            senderId: userId,
            senderType: isBuyer ? "buyer" : "seller",
            text: text.trim(),
        });

        return NextResponse.json(
            {
                message: "Message sent successfully",
                data: message,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
