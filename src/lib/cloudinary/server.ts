import crypto from "crypto";

export interface CloudinarySignResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function generateCloudinarySignature(folder = "solcafe_products"): CloudinarySignResult {
  let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  let apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  let apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  // Support parsing directly from CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
  if (process.env.CLOUDINARY_URL && (!cloudName || !apiKey || !apiSecret)) {
    try {
      const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    } catch (e) {
      console.warn("Failed to parse CLOUDINARY_URL", e);
    }
  }

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
