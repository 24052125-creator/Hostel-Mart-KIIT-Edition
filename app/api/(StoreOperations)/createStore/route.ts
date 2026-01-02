import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import decodeToken from "../../auth";
import { z } from "zod";
import Store from "@/models/Store";
import User from "@/models/User";
const reqSchema = z.object
  ({
    name: z.string(),
    hostel: z.string(),
    floor: z.string(),
    image: z.string().optional(),
  });
export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  try {
    await connectDB();
    const decodedToken = await decodeToken(token);
    if (!decodeToken)
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    const user = await User.findById(decodedToken?.id);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const existingStore = await Store.findOne({ userId: user._id });
    if (existingStore) {
      return NextResponse.json(
        { message: "You already created a store. Only one store allowed per user." },
        { status: 400 }
      );
    }
    const body = await req.json();
    console.log(body)
    const parsedBody = reqSchema.safeParse(body);
    if (!parsedBody.success) {
      console.log(parsedBody.error);
      return NextResponse.json({ message: "Invalid Request Data" }, { status: 400 });
    }
    const { name, hostel, floor, image } = parsedBody.data;
    const newStore = new Store(
      {
        name,
        hostel,
        floor,
        image,
        userId: user._id,
      }
    )
    await newStore.save();
    return NextResponse.json({ message: "Store Created Successfully" }, { status: 201 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}