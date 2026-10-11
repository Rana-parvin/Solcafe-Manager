import { describe, it, expect, vi } from "vitest";
import { validateImageFile, validateProductAspectRatio } from "../lib/cloudinary/client";

describe("Device Image File Validation & Aspect Ratio Handling", () => {
  it("should validate supported image MIME types correctly", () => {
    const validPng = new File(["dummy content"], "coffee.png", { type: "image/png" });
    const validJpg = new File(["dummy content"], "latte.jpg", { type: "image/jpeg" });
    const validWebp = new File(["dummy content"], "banner.webp", { type: "image/webp" });

    expect(validateImageFile(validPng).valid).toBe(true);
    expect(validateImageFile(validJpg).valid).toBe(true);
    expect(validateImageFile(validWebp).valid).toBe(true);
  });

  it("should reject unsupported file types like pdf, exe, or text", () => {
    const pdfFile = new File(["pdf content"], "document.pdf", { type: "application/pdf" });
    const txtFile = new File(["text content"], "script.txt", { type: "text/plain" });

    const pdfResult = validateImageFile(pdfFile);
    expect(pdfResult.valid).toBe(false);
    expect(pdfResult.error).toContain("supported image format");

    const txtResult = validateImageFile(txtFile);
    expect(txtResult.valid).toBe(false);
  });

  it("should enforce maximum allowed file size", () => {
    const largeContent = new ArrayBuffer(2.5 * 1024 * 1024);
    const largeFile = new File([largeContent], "large_photo.png", { type: "image/png" });

    const result = validateImageFile(largeFile, 2 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds the maximum allowed limit");
  });

  it("should accept valid 16:9 image aspect ratios (e.g. 1200x675, 1920x1080, 800x450)", () => {
    expect(validateProductAspectRatio(1200, 675).valid).toBe(true);
    expect(validateProductAspectRatio(1920, 1080).valid).toBe(true);
    expect(validateProductAspectRatio(800, 450).valid).toBe(true);
    expect(validateProductAspectRatio(1600, 900).valid).toBe(true);
  });

  it("should reject non-16:9 images (e.g. 800x800 square, 600x800 portrait) with a clear error message", () => {
    const squareResult = validateProductAspectRatio(800, 800);
    expect(squareResult.valid).toBe(false);
    expect(squareResult.error).toContain("Invalid image size. Please upload a product image with a 16:9 aspect ratio");
    expect(squareResult.error).toContain("Selected image: 800 × 800 px");

    const portraitResult = validateProductAspectRatio(600, 800);
    expect(portraitResult.valid).toBe(false);
    expect(portraitResult.error).toContain("Selected image: 600 × 800 px");
  });

  it("should verify an invalid image does not trigger an upload request", async () => {
    const mockUploadRequest = vi.fn();

    const squareDims = { width: 800, height: 800 };
    const validation = validateProductAspectRatio(squareDims.width, squareDims.height);

    if (validation.valid) {
      await mockUploadRequest();
    }

    expect(validation.valid).toBe(false);
    expect(mockUploadRequest).not.toHaveBeenCalled();
  });
});
