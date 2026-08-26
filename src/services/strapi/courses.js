import { getStoredToken, refreshAccessToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "http://localhost:1337/api"
).replace(/\/$/, "");

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

async function request(path, options = {}, allowRefresh = true) {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to create a course.");

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
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return request(path, options, false);
    }
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || `Request failed (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function registerCloudinaryCourseAsset(asset, fileName) {
  return request("/course-assets/cloudinary", {
    method: "POST",
    body: JSON.stringify({ ...asset, name: fileName }),
  });
}

export function resolveCourseInstructor({ currentUser } = {}) {
  if (currentUser?.id == null) {
    throw new Error("The authenticated user could not be resolved as the course instructor.");
  }

  return Number(currentUser.id);
}

export async function createCourse(course, thumbnailFile, options = {}) {
  const uploaded = await uploadToCloudinary(thumbnailFile);
  const asset = await registerCloudinaryCourseAsset(uploaded, thumbnailFile.name);

  return request("/courses", {
    method: "POST",
    body: JSON.stringify({
      data: {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnail: [asset.id],
        level: course.level,
        ...(course.duration === "" ? {} : { duration: Number(course.duration) }),
        topic: course.topic,
        skills: course.skills,
        price: Number(course.price),
        instructor: resolveCourseInstructor(options),
        ...(course.extraSupport ? { extraSupport: course.extraSupport } : {}),
      },
    }),
  });
}

export { COURSE_LEVELS };
