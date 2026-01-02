import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import decodeToken from "../../auth";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await User.findById(decodedToken.id);
        if (!user)
            return NextResponse.json({ message: "User not found" }, { status: 404 });

        const body = await req.json();
        const { storeId, items, totalAmount } = body;

        if (!storeId || !items || items.length === 0 || !totalAmount) {
            return NextResponse.json({ message: "Missing order details" }, { status: 400 });
        }

        const newOrder = new Order({
            buyerId: user._id,
            buyerName: user.userName,
            storeId,
            items,
            totalAmount,
            status: "pending"
        });

        const savedOrder = await newOrder.save();
        return NextResponse.json({ message: "Order Placed Successfully", order: savedOrder }, { status: 201 });
    } catch (error: any) {
        console.error("Error placing order:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
