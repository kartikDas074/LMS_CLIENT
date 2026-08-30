import { getStoredToken, refreshAccessToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { API_BASE_URL } from "@/config/api";

async function publicRequest(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: 60 } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || "Unable to load published blogs.");
  return data;
}

async function request(path, options = {}, allowRefresh = true) {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to manage blogs.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request(path, options, false);
  }

  if (!response.ok) {
    const errorDetails = data?.error?.details;
    const detailMsg = Array.isArray(errorDetails?.errors)
      ? errorDetails.errors.map((item) => `${item.path ? item.path.join(".") + ": " : ""}${item.message}`).join("; ")
      : typeof errorDetails === "object" && errorDetails !== null
      ? JSON.stringify(errorDetails)
      : "";

    const errorMessage = detailMsg || data?.error?.message || data?.message || `HTTP ${response.status} Error`;

    console.error("[blogs] API Error", {
      path,
      status: response.status,
      name: data?.error?.name,
      message: data?.error?.message,
      details: data?.error?.details,
    });

    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export function getBlogImageUrl(image) {
  const media = Array.isArray(image) ? image[0] : image;
  const url = media?.url || media?.data?.attributes?.url;
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .flatMap((block) => (block.children || []).map((child) => child.text || ""))
    .join("\n\n");
}

export function textToBlocks(value) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((text) => ({ type: "paragraph", children: [{ type: "text", text }] }))
    .filter((block) => block.children[0].text.trim());
}

export function generateSlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getUniqueSlug(title, currentDocumentId = null) {
  const baseSlug = generateSlug(title) || "blog-post";
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const existingRes = await publicRequest(`/blogs?filters[slug][$eq]=${encodeURIComponent(candidateSlug)}`);
      const existingList = existingRes?.data || [];

      // Filter out current document being edited
      const conflict = existingList.find((item) => (item.documentId || item.id) !== currentDocumentId);
      if (!conflict) return candidateSlug;

      counter += 1;
      candidateSlug = `${baseSlug}-${counter}`;
    } catch {
      return candidateSlug;
    }
  }
}

export async function getBlogs({ page = 1, pageSize = 10, search = "", status = "all" } = {}) {
  const params = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
    "populate[image]": "true",
    "populate[creator]": "true",
    sort: "createdAt:desc",
  });
  if (search.trim()) params.set("filters[title][$containsi]", search.trim());
  // For authenticated management views, use Strapi v5 status query param
  if (status === "published") params.set("status", "published");
  if (status === "draft") params.set("status", "draft");
  return request(`/blogs?${params.toString()}`);
}

export async function getPublishedBlogs() {
  // Strapi v5 with draftAndPublish enabled automatically returns only published
  // documents to unauthenticated requests — no publishedAt filter needed.
  return publicRequest("/blogs?populate[image]=true&populate[creator]=true&sort=publishedAt:desc");
}

export async function getPublishedBlog(documentId) {
  return publicRequest(`/blogs/${encodeURIComponent(documentId)}?populate[image]=true&populate[creator]=true`);
}

export async function getBlog(documentId) {
  const path = `/blogs/${encodeURIComponent(documentId)}?populate[image]=true&populate[creator]=true`;
  return getStoredToken() ? request(path) : publicRequest(path);
}

async function imageId(file) {
  if (!file) return null;
  const uploaded = await uploadToCloudinary(file);
  const asset = await request("/course-assets/cloudinary", {
    method: "POST",
    body: JSON.stringify({ ...uploaded, name: file.name }),
  });
  // Strapi media relations MUST use integer media file ID
  const mediaId = Number(asset?.id);
  if (!mediaId || isNaN(mediaId)) {
    throw new Error("Unable to resolve integer media ID for uploaded image asset.");
  }
  return mediaId;
}

export async function createBlog(blog, imageFile, currentUser) {
  const creatorId = Number(currentUser?.id);
  if (!creatorId || isNaN(creatorId)) {
    throw new Error("Unable to identify valid logged-in Strapi user ID. Please sign in again.");
  }

  const slug = await getUniqueSlug(blog.title);
  const data = {
    title: blog.title.trim(),
    Description: textToBlocks(blog.body),
    slug,
    creator: creatorId,
  };

  const mediaId = await imageId(imageFile);
  if (mediaId != null) {
    data.image = [mediaId];
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[blogs] Creating blog payload:", JSON.stringify({ data }));
  }

  return request("/blogs", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function updateBlog(documentId, blog, existingImageId, imageFile, existingBlog = null) {
  if (!documentId) throw new Error("Blog document ID is missing for update.");

  // Resolve slug
  let slug = existingBlog?.slug;
  if (!existingBlog || existingBlog.title.trim() !== blog.title.trim() || !slug) {
    slug = await getUniqueSlug(blog.title, documentId);
  }

  const data = {
    title: blog.title.trim(),
    Description: textToBlocks(blog.body),
    slug,
  };

  // Preserve existing creator ID if available
  const existingCreatorId = Number(existingBlog?.creator?.id || existingBlog?.creator);
  if (existingCreatorId && !isNaN(existingCreatorId)) {
    data.creator = existingCreatorId;
  }

  // Handle image updates safely
  if (imageFile) {
    const newMediaId = await imageId(imageFile);
    if (newMediaId != null) data.image = [newMediaId];
  } else if (existingImageId != null) {
    const mediaId = Number(existingImageId);
    if (!isNaN(mediaId)) data.image = [mediaId];
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[blogs] Updating blog payload:", JSON.stringify({ data }));
  }

  return request(`/blogs/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export async function publishBlog(documentId) {
  // Strapi v5: set publishedAt to publish a draft document via the core REST endpoint
  return request(`/blogs/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: JSON.stringify({ data: { publishedAt: new Date().toISOString() } }),
  });
}

export async function unpublishBlog(documentId) {
  // Strapi v5: set publishedAt to null to move a published document back to draft
  return request(`/blogs/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: JSON.stringify({ data: { publishedAt: null } }),
  });
}

export async function setBlogPublication(documentId, publish) {
  return publish ? publishBlog(documentId) : unpublishBlog(documentId);
}

export async function deleteBlog(documentId) {
  return request(`/blogs/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
}