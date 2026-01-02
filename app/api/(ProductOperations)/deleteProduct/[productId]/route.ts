import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    try {
        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken)
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        const { productId } = await params;
        const product = await Product.findById(productId);
        if (!product)
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        console.log(productId);
        await Product.findByIdAndDelete(productId);
        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}