import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    console.log("Token:", token);
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
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
    const store = await Store.findOne({ userId });
    if (!store)
      return NextResponse.json({ message: "Store not created yet" }, { status: 400 });

    return NextResponse.json({ store }, { status: 200 });
  }
  catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}