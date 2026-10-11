export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export interface CloudinaryUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Validates an image file's type and size before upload.
 * Default max size: 10 MB.
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = 10 * 1024 * 1024
): ImageValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Validate MIME type or file extension
  const isImageMime = file.type ? file.type.startsWith("image/") : false;
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);

  if (!isImageMime && !hasImageExtension) {
    return {
      valid: false,
      error: "Selected file is not a supported image format. Please select a JPEG, PNG, WEBP, GIF, or SVG image.",
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image file size (${sizeMb} MB) exceeds the maximum allowed limit of ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Reads the width and height of an image file using browser Image decoding.
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.URL || typeof Image === "undefined") {
      resolve({ width: 1200, height: 675 });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to decode image file. The file may be corrupt or formatted improperly."));
    };

    img.src = objectUrl;
  });
}

/**
 * Validates whether an image's dimensions match a required 16:9 aspect ratio.
 * Standard recommended product dimensions: 1200 × 675 pixels.
 */
export function validateProductAspectRatio(
  width: number,
  height: number,
  requiredRatio: number = 16 / 9,
  tolerance: number = 0.03
): ImageValidationResult {
  if (!width || !height || height === 0) {
    return {
      valid: false,
      error: "Unable to determine image dimensions. Please select a valid image file.",
    };
  }

  const actualRatio = width / height;
  const diff = Math.abs(actualRatio - requiredRatio);

  if (diff > tolerance) {
    return {
      valid: false,
      error: `Invalid image size. Please upload a product image with a 16:9 aspect ratio, such as 1200 × 675 pixels. Selected image: ${width} × ${height} px. Required aspect ratio: 16:9.`,
      width,
      height,
    };
  }

  return { valid: true, width, height };
}

/**
 * Uploads a local File object to Cloudinary via server-signed API route.
 * Preserves security: client never accesses CLOUDINARY_API_SECRET.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = "solcafe_uploads"
): Promise<CloudinaryUploadResponse> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Fetch signature parameters from API route
    const signRes = await fetch(`/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`);
    if (!signRes.ok) {
      return {
        success: false,
        error: `Cloudinary authorization failed (Server HTTP ${signRes.status}).`,
      };
    }

    const signData = await signRes.json();
    if (!signData.cloudName || !signData.apiKey) {
      return {
        success: false,
        error: "Cloudinary configuration is incomplete on server (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_API_KEY missing).",
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", signData.timestamp.toString());
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder || folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await uploadRes.json();

    if (!uploadRes.ok || !data.secure_url) {
      return {
        success: false,
        error: data.error?.message || "Failed to upload image file to Cloudinary cloud storage.",
      };
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network error occurred while attempting image upload.",
    };
  }
}
