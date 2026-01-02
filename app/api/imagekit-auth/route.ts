import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
        const privateKey = process.env.PRIVATE_KEY;
        const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

        if (!publicKey || !privateKey || !urlEndpoint) {
            return NextResponse.json({ error: "Missing ImageKit configuration in .env" }, { status: 500 });
        }

        const imagekit = new ImageKit({
            publicKey: publicKey.trim(),
            privateKey: privateKey.trim(),
            urlEndpoint: urlEndpoint.trim(),
        });

        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error("ImageKit Auth Error:", error);
        return NextResponse.json({ error: "Auth failed" }, { status: 500 });
    }
}
