import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../mongodb";
import Store from "@/models/Store";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        await connectDB();
        const { storeId } = await params;

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, store }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching store by ID:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
