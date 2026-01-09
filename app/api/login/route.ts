import { NextRequest, NextResponse } from "next/server";
import connectDB from "../mongodb";
import { z } from "zod";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const reqSchema = z.object({
    userName: z.string(),
    password: z.string().min(6),
});
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const parsedBody = reqSchema.safeParse(body);

        if (!parsedBody.success)
            return NextResponse.json({
                message: "Invalid request body"
            }, { status: 400 });

        const { userName, password } = parsedBody.data;
        const existingUser = await User.findOne({ userName });
        if (!existingUser)
            return NextResponse.json({ message: "User does not exist" }, { status: 400 });
        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if (!isValidPassword)
            return NextResponse.json({ message: "Password does not match" }, { status: 400 });
        if (!process.env.SECRET_KEY) {
            console.log("No secret Key found");
            throw new Error("No secret key found");
        }
        const token = jwt.sign(
            {
                id: existingUser._id,
                userName: existingUser.userName,
                kiitMailId: existingUser.kiitMailId
            },
            process.env.SECRET_KEY,
            { expiresIn: "8h" }

        );
        const response = NextResponse.json(
            {
                message: "Logged in successfully!",
                token,
                user: {
                    _id: existingUser._id,
                    userName: existingUser.userName,
                    kiitMailId: existingUser.kiitMailId
                }
            }, { status: 200 });

        // Set the token in an HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 8 * 60 * 60, // 8 hours
            path: "/",
        });

        return response;
    }
    catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};