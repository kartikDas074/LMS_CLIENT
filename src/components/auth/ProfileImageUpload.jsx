"use client";

import { useState, useRef } from "react";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";

export default function ProfileImageUpload({ value, onChange, error: externalError }) {
  const [previewUrl, setPreviewUrl] = useState(value?.url || "");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSuccess, setIsSuccess] = useState(Boolean(value?.url));
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsSuccess(false);

    // Client-side validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    // Set local preview & file meta
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    // Perform Cloudinary Upload
    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setIsSuccess(true);
      setPreviewUrl(result.url);
      if (onChange) {
        onChange({
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setUploadError(err.message || "Failed to upload image. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setFileName("");
    setFileSize("");
    setUploadError("");
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange({
        url: "",
        publicId: "",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[#e6edf3]">
        Profile Picture <span className="text-[#7d8590] font-normal">(Optional)</span>
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 rounded-xl border border-dashed border-[#30363d] bg-[#0d1117] p-3.5 transition-colors hover:border-[#8b949e]">
        {/* Avatar Preview */}
        <div className="relative flex-shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#30363d] bg-[#161b22] flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-8 w-8 text-[#7d8590]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}

            {/* Uploading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <svg
                  className="h-5 w-5 animate-spin text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>

          {/* Success Check Badge */}
          {isSuccess && !isUploading && (
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
        </div>

        {/* Action Controls & Info */}
        <div className="flex-1 space-y-1 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5 text-[#8b949e]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              {previewUrl ? "Change image" : "Choose image"}
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          {fileName && (
            <div className="text-xs text-[#8b949e] truncate max-w-xs">
              <span className="text-[#c9d1d9]">{fileName}</span> ({fileSize})
            </div>
          )}

          {!fileName && (
            <p className="text-[11px] text-[#7d8590]">
              Direct Cloudinary upload (JPEG, PNG, WebP up to 5MB)
            </p>
          )}

          {isUploading && (
            <p className="text-xs text-indigo-400 font-medium">
              Uploading directly to Cloudinary...
            </p>
          )}

          {isSuccess && !isUploading && (
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Image attached to profile
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {(uploadError || externalError) && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{uploadError || externalError}</span>
        </div>
      )}
    </div>
  );
}
