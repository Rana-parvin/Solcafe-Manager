import { NextResponse } from "next/server";
import { generateCloudinarySignature } from "@/lib/cloudinary/server";

export async function GET() {
  try {
    const signData = generateCloudinarySignature();
    return NextResponse.json(signData);
  } catch (error) {
    console.error("Cloudinary signing error:", error);
    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature" },
      { status: 500 }
    );
  }
}
