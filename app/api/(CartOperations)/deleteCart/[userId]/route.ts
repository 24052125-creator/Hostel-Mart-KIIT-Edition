import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Cart from "@/models/Cart";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    // get token 
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    try {
        await connectDB();
        const decodedToken = await decodeToken(token);
        if (!decodedToken)
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        const { userId } = await params;
        console.log("USER ID:", userId, typeof userId);
        if (!userId) {
            return NextResponse.json({ error: "User Id is required" }, { status: 404 });
            console.log("USER ID:", userId, typeof userId);
        }
        const cart = await Cart.findOne({ userId })
        if (!cart)
            return NextResponse.json({ error: "cart is already empty" }, { status: 400 });
        await cart.deleteOne();
        return NextResponse.json({ message: "Cart cleared successfully" });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}