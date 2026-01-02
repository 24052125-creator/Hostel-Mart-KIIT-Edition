import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: { type: String, required: true },
                price: { type: String, required: true },
                quantity: { type: Number, required: true },
                image: [String],
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending",
        },
        buyerName: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
