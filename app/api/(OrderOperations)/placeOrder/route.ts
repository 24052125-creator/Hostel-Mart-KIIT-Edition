import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import decodeToken from "../../auth";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

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

        // 1. Validate Stock
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
            }
        }

        // 2. Decrement Stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
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
