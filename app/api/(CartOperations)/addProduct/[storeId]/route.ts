import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../mongodb";
import decodeToken from "@/app/api/auth";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const decodedToken = await decodeToken(token);
    if (!decodedToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = decodedToken?.id;
    await connectDB();

    const { storeId } = await params;
    const { productId, quantity } = await req.json();
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid productId or quantity" },
        { status: 400 }
      );
    }
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Product must belong to same store
    if (product.storeId.toString() !== storeId) {
      return NextResponse.json(
        { message: "Product does not belong to this store" },
        { status: 400 }
      );
    }

    // 3️⃣ Find user's cart
    let cart = await Cart.findOne({ userId });

    // 3.5️⃣ Check Stock availability
    const existingItem = cart?.items.find((item: any) => item.productId.toString() === productId);
    const totalRequestedQty = (existingItem?.quantity || 0) + quantity;

    if (totalRequestedQty > product.stock) {
      return NextResponse.json(
        { message: `Cannot add more items. Only ${product.stock} available in stock.` },
        { status: 400 }
      );
    }

    // 4️⃣ If cart exists and has items → storeId must match
    if (cart && cart.items.length > 0) {
      if (cart.storeId && cart.storeId.toString() !== storeId) {
        return NextResponse.json(
          {
            message:
              "Cart contains items from another store. Please clear cart first."
          },
          { status: 400 }
        );
      }
    }

    // 5️⃣ Create cart if not exists
    if (!cart) {
      cart = await Cart.create({
        userId,
        storeId,
        items: []
      });
    }

    // 6️⃣ Add or update product
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    // 7️⃣ Save cart
    await cart.save();
    return NextResponse.json(
      { message: "Item added to cart", cart },
      { status: 200 }
    );
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}