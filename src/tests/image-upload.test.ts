import { describe, it, expect } from "vitest";
import { validateImageFile } from "../lib/cloudinary/client";

describe("Device Image File Validation & Handling", () => {
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
    // Create a dummy file larger than 2MB with 2.5MB size
    const largeContent = new ArrayBuffer(2.5 * 1024 * 1024);
    const largeFile = new File([largeContent], "large_photo.png", { type: "image/png" });

    // Validate against 2MB limit (2 * 1024 * 1024)
    const result = validateImageFile(largeFile, 2 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds the maximum allowed limit");
  });
});
