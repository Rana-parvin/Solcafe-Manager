import crypto from "crypto";

export interface CloudinarySignResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function generateCloudinarySignature(folder = "solcafe_products"): CloudinarySignResult {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
  };
}
