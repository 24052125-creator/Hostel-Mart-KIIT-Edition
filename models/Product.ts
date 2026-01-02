import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true
        },
        image:
        {
            type: [String],
            required: true
        },
        description:
        {
            type: String,
            required: false
        },
        size:
        {
            type: String,
            required: true
        },
        tags:
        {
            type: [String],
            required: false,
            enum: ["fixed price", "negotiable", "doorstep delivery", "at mrp"],
        },
        price:
        {
            type: String,
            required: true
        },
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stock:
        {
            type: Number,
            required: true,
            default: 0
        },
        storeId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },
    },
);
export default mongoose.models.Product || mongoose.model("Product", productSchema);
