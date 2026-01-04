import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import decodeToken from "../../auth";
import { z } from "zod";
import Product from "@/models/Product";
import User from "@/models/User";
const reqSchema = z.object({
  name: z.string(),
  image: z.array(z.string()),
  description: z.string().optional(),
  size: z.string(),
  tags: z.array(z.enum(["fixed price", "negotiable", "doorstep delivery", "at mrp"])).optional(),
  price: z.coerce.string(),
  stock: z.number().min(0, "Stock cannot be negative"),
  storeId: z.string()
})
// product jab add karenge tbhi toh product id generate hogaa
export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const decodedToken = await decodeToken(token);
    if (!decodedToken)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const user = await User.findById(decodedToken.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const body = await req.json();
    const parsedBody = reqSchema.safeParse(body);
    if (!parsedBody.success) {
      console.log("Validation Error:", parsedBody.error);
      return NextResponse.json({
        message: "Invalid Request Data",
        error: parsedBody.error.issues.map((issue: { message: string }) => issue.message).join(", ")
      }, { status: 400 });
    }
    const { name, image, description, size, tags, price, stock, storeId } = parsedBody.data;
    const newProduct = new Product(
      {
        name,
        image,
        description,
        size,
        tags,
        price,
        stock,
        userId: user._id,
        storeId
      }
    )
    const savedProduct = await newProduct.save();
    return NextResponse.json({ message: "Product Added Successfully", product: savedProduct }, { status: 201 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}