import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Cart from "@/models/Cart";
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
    console.log("Product ID:", productId, typeof productId);
    const userId = decodedToken.id;
    if (!productId) {
      return NextResponse.json({ error: "Product Id is required" }, { status: 404 });
      console.log("Product ID:", productId, typeof productId);
    }
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength)
      return NextResponse.json(
        { error: "Product not found in cart" },
        { status: 404 }
      );

    // Reset storeId if cart is empty
    if (cart.items.length === 0) {
      cart.storeId = null;
    }
    await cart.save();

    return NextResponse.json(
      { message: "Product deleted successfully", cart },
      { status: 200 }
    );

    if (!cart)
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}