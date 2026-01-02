import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import { CartItem } from "@/hooks/use-cart";
import Cart from "@/models/Cart";
import { NextRequest, NextResponse } from "next/server";


export default async function handler(req:NextRequest, {params}:{params:{userId:String}}) {
  try {
    await connectDB();

    // Extract token from headers (or wherever you store it)
  const token=req.headers.get("Authorization")?.split(" ")[1]; // e.g., "Bearer <token>"
    if (!token) return NextResponse.json({message:"Unauthorised"},{status:401});

    const decodedToken = await decodeToken(token);
    if (!decodedToken) return NextResponse.json({message:"Unauthorised"},{status:401});
    const userId =  decodedToken?.id; // adjust according to your token payload

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });

    // Calculate total items
    const count = cart ? cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) : 0;

    return NextResponse.json({ count },{status:200});
  } catch (err) {
    console.error(err);
    return NextResponse.json({message:"Server error"},{status:500});
  }
}
