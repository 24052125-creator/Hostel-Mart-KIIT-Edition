import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../mongodb";
import decodeToken from "../../../auth";
import Order from "@/models/Order";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { storeId } = await params;
        const orders = await Order.find({ storeId }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching store orders:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
