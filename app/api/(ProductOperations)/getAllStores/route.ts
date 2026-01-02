import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../mongodb";
import Store from "@/models/Store";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const stores = await Store.find({}).sort({ name: 1 });
    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
