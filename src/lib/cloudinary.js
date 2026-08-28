/**
 * Cloudinary Direct Upload Utility
 * Handles client-side validation and direct unsigned uploads to Cloudinary.
 * No Cloudinary API secrets are exposed to the client.
 */

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

/**
 * Validates selected file for image MIME type and file size.
 * @param {File} file
 * @param {Object} options
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateImageFile(file, options = {}) {
  const maxSizeMB = options.maxSizeMB || MAX_IMAGE_SIZE_MB;

  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPEG, PNG, WebP, GIF, or SVG).",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Image size must be less than ${maxSizeMB}MB. (Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Uploads an image directly to Cloudinary using an unsigned upload preset.
 * @param {File} file
 * @returns {Promise<{ url: string, publicId: string, format: string, width: number, height: number }>}
 */
export async function uploadToCloudinary(file) {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error(
      "Cloudinary Cloud Name is not configured. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local"
    );
  }

  if (!uploadPreset) {
    throw new Error(
      "Cloudinary Upload Preset is not configured. Please check NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `Upload failed with status code ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
  };
}

export async function uploadVideoToCloudinary(file) {
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
  if (!file) throw new Error("No video selected.");
  if (!allowedTypes.includes(file.type)) throw new Error("Please select a valid video file (MP4, WebM, MOV, AVI, or MKV).");
  if (file.size > 500 * 1024 * 1024) throw new Error("Video size must be less than 500MB.");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary video upload is not configured.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, { method: "POST", body: formData });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || `Video upload failed (HTTP ${response.status}).`);
  return { url: data.secure_url || data.url, publicId: data.public_id, format: data.format, resourceType: data.resource_type || "video", bytes: data.bytes };
}
