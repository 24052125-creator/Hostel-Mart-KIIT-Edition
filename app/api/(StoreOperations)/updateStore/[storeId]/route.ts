import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Store from "@/models/Store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const reqSchema = z.object({
  name: z.string().optional(),
  hostel: z.string().optional(),
  floor: z.string().optional()
});
// update store means to update the Name, hostel and floor
export async function PUT(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const decodedToken = await decodeToken(token);
    if (!decodedToken)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const { storeId } = await params;
    if (!storeId) {
      console.log("storeId: ", storeId);
      return NextResponse.json({ error: "Store Id is required" }, { status: 404 });
    }
    const body = await req.json();
    const parsedBody = reqSchema.safeParse(body);
    if (!parsedBody.success)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    const store = await Store.findById(storeId);
    if (!store)
      return NextResponse.json({ error: "Store Not Found" }, { status: 404 });
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: parsedBody.data },
      { new: true }
    );
    if (!updatedStore)
      return NextResponse.json({ error: "Failed to update journal" }, { status: 500 });
    return NextResponse.json({ message: "Store Updated Successfully", store: updatedStore });
  }
  catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// export async function GET(req: Request) {
//   return new Response("Works!");
// }
