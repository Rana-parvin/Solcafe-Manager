"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary/client";

export interface ImageUploaderProps {
  /** The current remote or saved image URL */
  value?: string;
  /** Callback fired when the image URL or selected File changes */
  onChange: (url: string, file?: File | null) => void;
  /** Callback fired when a new local File is chosen */
  onFileSelect?: (file: File | null) => void;
  /** Target Cloudinary folder name */
  folder?: string;
  /** Form field label */
  label?: string;
  /** Helper text or description */
  description?: string;
  /** Default fallback image URL (defaults to SolCafe app icon) */
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
  aspectRatio = "square",
  maxSizeBytes = 10 * 1024 * 1024,
  allowUrlInput = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    const validation = validateImageFile(file, maxSizeBytes);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file selection.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setIsSuccess(false);

    try {
      const res = await uploadImageToCloudinary(file, folder);
      if (res.success && res.url) {
        setIsSuccess(true);
        onChange(res.url, file);
      } else {
        setUploadError(res.error || "Cloud upload failed. Please try again.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, maxSizeBytes);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file selected.");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsSuccess(false);

    if (onFileSelect) {
      onFileSelect(file);
    }

    executeUpload(file);
    e.target.value = "";
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
    setIsSuccess(false);
    onChange(urlInputValue, null);
  };

  const activePreview = localPreviewUrl || value || defaultImage;
  const isCustomImage = Boolean(localPreviewUrl || value);

  const aspectClasses =
    aspectRatio === "wide"
      ? "w-full h-32"
      : aspectRatio === "avatar"
      ? "w-20 h-20 rounded-full"
      : "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl";

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

      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className={`relative overflow-hidden bg-white border border-[#E8E1D9] flex items-center justify-center shrink-0 shadow-xs ${aspectClasses}`}
          >
            {activePreview ? (
              <Image
                src={activePreview}
                alt="Image Preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-[#9A918B]" />
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-[#241614]/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-[#F5D58A] animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin mb-1" />
                <span className="text-[9px] font-bold tracking-tight text-center">Uploading</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#3B2522] hover:bg-[#241614] text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Upload from device</span>
              </button>

              {allowUrlInput && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-[#FAF8F5] text-[#2B211E] font-medium text-xs border border-[#D8CEC5] transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-[#756B66]" />
                  <span>{showUrlInput ? "Hide Link Input" : "Paste URL"}</span>
                </button>
              )}

              {isCustomImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FDE8E8] hover:bg-[#F8B4B4]/40 text-[#C94A4A] font-semibold text-xs border border-[#F7B6B6] transition-colors"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-[#C88A2B] text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading image to Cloudinary storage...</span>
              </div>
            )}

            {isSuccess && !uploadError && !isUploading && (
              <div className="flex items-center gap-1.5 text-[#3A8F5B] text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cloudinary image upload complete! Stored securely.</span>
              </div>
            )}

            {localPreviewUrl && !isSuccess && !isUploading && !uploadError && (
              <div className="text-[11px] text-[#C88A2B] font-semibold">
                Local device preview active ({selectedFile?.name}).
              </div>
            )}
          </div>
        </div>

        {showUrlInput && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E8E1D9]">
            <input
              type="text"
              placeholder="https://res.cloudinary.com/..."
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              className="flex-1 bg-white border border-[#E8E1D9] rounded-lg px-3 py-1.5 text-xs text-[#2B211E] placeholder-[#9A918B] focus:outline-none focus:border-[#C88A2B]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-lg bg-[#3B2522] hover:bg-[#241614] text-white text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-lg bg-[#FDE8E8] border border-[#F7B6B6] text-[#C94A4A] text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#A82A2A]">Image Upload Failed</p>
                <p className="text-[11px] text-[#C94A4A] mt-0.5">{uploadError}</p>
              </div>
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={handleRetryUpload}
                disabled={isUploading}
                className="shrink-0 px-2.5 py-1 rounded bg-[#C94A4A] hover:bg-[#B33E3E] text-white font-bold text-[11px] transition-colors"
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
