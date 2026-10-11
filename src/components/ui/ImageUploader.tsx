"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import {
  uploadImageToCloudinary,
  validateImageFile,
  getImageDimensions,
  validateProductAspectRatio,
} from "@/lib/cloudinary/client";

export interface ImageUploaderProps {
  /** The current remote or saved image URL */
  value?: string;
  /** Callback fired when the image URL or selected File changes */
  onChange: (url: string, file?: File | null) => void;
  /** Callback fired when a new local File is chosen */
  onFileSelect?: (file: File | null) => void;
  /** Target upload folder name */
  folder?: string;
  /** Form field label */
  label?: string;
  /** Helper text or description */
  description?: string;
  /** Default fallback image URL */
  defaultImage?: string;
  /** Disable the component */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Aspect ratio hint for preview box ('square' | 'wide' | 'avatar') */
  aspectRatio?: "square" | "wide" | "avatar";
  /** Max allowed file size in bytes (default: 10MB) */
  maxSizeBytes?: number;
  /** Whether to allow manual text URL entry option */
  allowUrlInput?: boolean;
  /** Enforce required 16:9 aspect ratio validation for product images (default: true) */
  require16by9?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = "",
  onChange,
  onFileSelect,
  folder = "solcafe_uploads",
  label,
  description,
  defaultImage = "/images/appicon_large_size_final.png",
  disabled = false,
  className = "",
  aspectRatio = "wide",
  maxSizeBytes = 10 * 1024 * 1024,
  allowUrlInput = true,
  require16by9 = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedDimensions, setDetectedDimensions] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState(value);

  useEffect(() => {
    setUrlInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const executeUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setIsSuccess(false);

    try {
      const res = await uploadImageToCloudinary(file, folder);
      if (res.success && res.url) {
        setIsSuccess(true);
        onChange(res.url, file);
      } else {
        setUploadError(res.error || "Image upload failed. Please try again.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "An unexpected error occurred during image upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset current file input so user can re-select same file if needed
    e.target.value = "";

    // Clear previous states before starting validation
    setUploadError(null);
    setIsSuccess(false);
    setDetectedDimensions(null);
    setIsUploading(false);
    setIsValidating(true);

    // 1. Basic Type & Size Validation
    const typeSizeValidation = validateImageFile(file, maxSizeBytes);
    if (!typeSizeValidation.valid) {
      setSelectedFile(null);
      setLocalPreviewUrl(null);
      setUrlInputValue("");
      setUploadError(typeSizeValidation.error || "Invalid file selection.");
      onChange("", null);
      if (onFileSelect) onFileSelect(null);
      setIsValidating(false);
      return;
    }

    // 2. Dimension & 16:9 Aspect Ratio Validation
    try {
      const dims = await getImageDimensions(file);
      setDetectedDimensions(`${dims.width} × ${dims.height} px`);

      if (require16by9) {
        const ratioValidation = validateProductAspectRatio(dims.width, dims.height);
        if (!ratioValidation.valid) {
          // Reject invalid aspect ratio: clear state & NEVER trigger upload
          setSelectedFile(null);
          setLocalPreviewUrl(null);
          setUrlInputValue("");
          setUploadError(
            ratioValidation.error ||
              `Invalid image size. Please upload a product image with a 16:9 aspect ratio, such as 1200 × 675 pixels. Selected image: ${dims.width} × ${dims.height} px. Required aspect ratio: 16:9.`
          );
          onChange("", null);
          if (onFileSelect) onFileSelect(null);
          setIsValidating(false);
          return;
        }
      }
    } catch (dimErr: any) {
      setSelectedFile(null);
      setLocalPreviewUrl(null);
      setUrlInputValue("");
      setUploadError(
        dimErr?.message || "Unable to read image dimensions. Please select a valid 16:9 image."
      );
      onChange("", null);
      if (onFileSelect) onFileSelect(null);
      setIsValidating(false);
      return;
    }

    // 3. Validation Succeeded: Set file state, end validation phase, then start upload phase
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
    setIsValidating(false);

    // 4. Start Upload
    executeUpload(file);
  };

  const handleRetryUpload = () => {
    if (selectedFile) {
      executeUpload(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setUploadError(null);
    setDetectedDimensions(null);
    setIsSuccess(false);
    setUrlInputValue("");
    onChange("", null);
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleApplyUrl = () => {
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setUploadError(null);
    setDetectedDimensions(null);
    setIsSuccess(false);
    onChange(urlInputValue, null);
  };

  const activePreview = localPreviewUrl || value;
  const isCustomImage = Boolean(localPreviewUrl || value);

  const aspectClasses =
    aspectRatio === "wide"
      ? "w-full h-40 rounded-2xl"
      : aspectRatio === "avatar"
      ? "w-20 h-20 rounded-full"
      : "w-28 h-28 sm:w-32 sm:h-32 rounded-2xl";

  const isBusy = isValidating || isUploading;

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#2B211E]">
          {label}
        </label>
      )}

      {description && (
        <p className="text-[11px] text-[#756B66]">{description}</p>
      )}

      {require16by9 && (
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] text-[11px] text-[#756B66] flex items-center justify-between font-medium">
          <span>Required Product Format: <strong>16:9 Aspect Ratio</strong></span>
          <span className="text-[#C88A2B] font-bold">Recommended: 1200 × 675 px</span>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D9] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className={`relative overflow-hidden bg-white border border-[#E8E1D9] flex items-center justify-center shrink-0 shadow-xs ${aspectClasses}`}
          >
            {activePreview ? (
              <Image
                src={activePreview}
                alt="Product Image Preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-3 text-[#9A918B]">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-semibold">No Image Selected</span>
              </div>
            )}

            {isBusy && (
              <div className="absolute inset-0 bg-[#241614]/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-[#F5D58A] animate-pulse z-10">
                <RefreshCw className="w-6 h-6 animate-spin mb-1" />
                <span className="text-[10px] font-bold tracking-tight text-center">
                  {isValidating ? "Checking Ratio..." : "Uploading..."}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isBusy}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isBusy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B2522] hover:bg-[#241614] text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#C88A2B]" />
                <span>Upload Product Image (16:9)</span>
              </button>

              {allowUrlInput && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={disabled || isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2B211E] font-semibold text-xs border border-[#D8CEC5] transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-[#756B66]" />
                  <span>{showUrlInput ? "Hide Link" : "Paste URL"}</span>
                </button>
              )}

              {isCustomImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled || isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FDE8E8] hover:bg-[#F8B4B4]/40 text-[#C94A4A] font-bold text-xs border border-[#F7B6B6] transition-colors"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {isValidating && (
              <div className="flex items-center gap-2 text-[#C88A2B] text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking image dimensions and 16:9 ratio...</span>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-[#C88A2B] text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading selected image...</span>
              </div>
            )}

            {isSuccess && !uploadError && !isBusy && (
              <div className="flex items-center gap-1.5 text-[#3A8F5B] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Image validated (16:9) & uploaded successfully!</span>
                {detectedDimensions && <span className="text-[11px] text-[#756B66] font-mono">({detectedDimensions})</span>}
              </div>
            )}

            {localPreviewUrl && !isSuccess && !isBusy && !uploadError && (
              <div className="text-[11px] text-[#3A8F5B] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valid 16:9 ratio ({detectedDimensions || "16:9"}). Ready for upload.</span>
              </div>
            )}
          </div>
        </div>

        {showUrlInput && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E8E1D9]">
            <input
              type="text"
              placeholder="https://..."
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              className="flex-1 bg-white border border-[#E8E1D9] rounded-xl px-3 py-2 text-xs text-[#2B211E] placeholder-[#9A918B] focus:outline-none focus:border-[#C88A2B]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3.5 py-2 rounded-xl bg-[#3B2522] hover:bg-[#241614] text-white text-xs font-bold"
            >
              Apply
            </button>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F7B6B6] text-[#C94A4A] text-xs flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-[#A82A2A]">Invalid Product Image</p>
                <p className="text-xs text-[#C94A4A] mt-0.5 leading-relaxed">{uploadError}</p>
              </div>
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={handleRetryUpload}
                disabled={isBusy}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C94A4A] hover:bg-[#B33E3E] text-white font-bold text-xs transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
