import connectDB from "@/app/api/mongodb";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        await connectDB();
        const { productId } = await params;

        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
