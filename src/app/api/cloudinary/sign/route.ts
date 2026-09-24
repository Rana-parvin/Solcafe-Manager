import { NextResponse } from "next/server";
import { generateCloudinarySignature } from "@/lib/cloudinary/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "solcafe_products";
    const signData = generateCloudinarySignature(folder);
    return NextResponse.json(signData);
  } catch (error) {
    console.error("Cloudinary signing error:", error);
    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature" },
      { status: 500 }
    );
  }
}
