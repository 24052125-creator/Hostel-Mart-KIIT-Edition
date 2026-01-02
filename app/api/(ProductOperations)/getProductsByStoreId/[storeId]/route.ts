import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../mongodb";
import Product from "@/models/Product";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        await connectDB();
        const { storeId } = await params;

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
        }

        const products = await Product.find({ storeId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching products by store ID:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
