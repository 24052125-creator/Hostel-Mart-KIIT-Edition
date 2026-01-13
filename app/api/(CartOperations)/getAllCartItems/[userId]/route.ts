import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Cart from "@/models/Cart";
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
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return NextResponse.json({ message: "Cart is Empty", cart: null }, { status: 200 });
        }
        return NextResponse.json({ cart }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}