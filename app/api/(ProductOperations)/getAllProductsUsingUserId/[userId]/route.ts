import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    try {
        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken)
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        const { userId } = await params;
        if (!userId) {
            console.log("userId: ", userId);
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }
        const product = await Product.find({ userId });
        console.log(product);
        if (!product) {
            console.log(product);
            return NextResponse.json({ message: "Failed to load products" }, { status: 500 });
        }
        return NextResponse.json({ product }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}