import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const reqSchema = z.object({
  name: z.string().optional(),
  image: z.array(z.string()).optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  tags: z.array(z.enum(["fixed price", "negotiable", "doorstep delivery", "at mrp"])).optional(),
  price: z.string().optional(),
  stock: z.number().optional()
})
export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  try {
    await connectDB();
    const decodedToken = await decodeToken(token);
    if (!decodedToken)
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    const user = await User.findById(decodedToken.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const body = await req.json();
    const parsedBody = reqSchema.safeParse(body);
    if (!parsedBody.success) {
      console.log(parsedBody.error);
      return NextResponse.json({ message: "Invalid Request Data" }, { status: 400 });
    }
    // const productId=params.productId;
    const { productId } = await params;
    console.log(productId);
    if (!productId)
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    // console.log(typeof productId, productId);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: parsedBody.data },
      { new: true }
    );
    if (!updatedProduct) {
      console.log(updatedProduct);
      return NextResponse.json(
        { message: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}