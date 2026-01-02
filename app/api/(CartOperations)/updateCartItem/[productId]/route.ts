import Product from "@/models/Product";
import decodeToken from "@/app/api/auth";
import Cart from "@/models/Cart";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const decoded = await decodeToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.id;
    const { productId } = await params;
    const { quantity } = await req.json();

    if (quantity < 0)
      return NextResponse.json(
        { message: "Invalid quantity" },
        { status: 400 }
      );

    // Check stock availability
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (product && quantity > product.stock) {
        return NextResponse.json(
          { message: `Only ${product.stock} items available in stock` },
          { status: 400 }
        );
      }
    }

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { message: "Product not in cart" },
        { status: 404 }
      );
    }
    // Update quantity
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // If cart is empty, reset storeId
    if (cart.items.length === 0) {
      cart.storeId = null;
    }

    await cart.save();

    return NextResponse.json(
      { message: "Cart updated", cart },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

}
