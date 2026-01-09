import decodeToken from "@/app/api/auth";
import connectDB from "@/app/api/mongodb";
import Store from "@/models/Store";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const decodedToken = await decodeToken(token);

        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storeId } = await params;

        if (!storeId) {
            return NextResponse.json({ error: "Store Id is required" }, { status: 400 });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return NextResponse.json({ error: "Store Not Found" }, { status: 404 });
        }

        // Verify ownership
        if (store.userId.toString() !== decodedToken.id) {
            return NextResponse.json({ error: "You can only delete your own store" }, { status: 403 });
        }

        await Store.findByIdAndDelete(storeId);

        // Note: In a real app, you might also want to delete all products associated with this store.
        // await Product.deleteMany({ storeId });

        return NextResponse.json({ message: "Store Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting store:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
