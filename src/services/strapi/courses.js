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
    const details = data?.error?.details?.errors?.map((item) => item.message).filter(Boolean).join(" ");
    const error = new Error(details || data?.error?.message || data?.message || `Request failed (HTTP ${response.status}).`);
    error.status = response.status;
    error.response = data;
    console.error("[strapi] Request failed", { path, status: response.status, response: data });
    throw error;
  }
  return data;
}

export function getCourseImageUrl(thumbnail) {
  const media = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;
  const url = media?.url || media?.data?.attributes?.url;
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getCourses({ page = 1, pageSize = 10, search = "" } = {}) {
  const params = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
    "populate[thumbnail]": "true",
    "populate[instructor]": "true",
    sort: "createdAt:desc",
  });
  if (search.trim()) {
    const fields = ["title", "shortDescription", "description", "topic", "skills"];
    fields.forEach((field, index) => params.set(`filters[$or][${index}][${field}][$containsi]`, search.trim()));
  }
  return request(`/courses?${params.toString()}`);
}

export async function getCourse(documentId) {
  return request(`/courses/${encodeURIComponent(documentId)}?populate[thumbnail]=true&populate[instructor]=true`);
}

export async function getLessonsForCourse(courseId) {
  const params = new URLSearchParams({
    "filters[courseId][documentId][$eq]": String(courseId),
    sort: "lessonOrder:asc",
    "populate[videourl]": "true",
  });
  return request(`/lessons?${params.toString()}`);
}

export async function updateCourse(documentId, course, thumbnailId, instructorId) {
  if (!documentId) throw new Error("The course documentId is missing.");
  if (thumbnailId == null) throw new Error("The existing course thumbnail could not be resolved.");
  if (instructorId == null) throw new Error("The existing course instructor could not be resolved.");
  const data = {
    title: course.title.trim(),
    shortDescription: course.shortDescription.trim(),
    description: course.description.trim(),
    level: course.level,
    topic: Array.isArray(course.topic) ? course.topic.map((item) => String(item).trim()).filter(Boolean) : [],
    skills: Array.isArray(course.skills) ? course.skills.map((item) => String(item).trim()).filter(Boolean) : [],
    price: Number(course.price),
    thumbnail: [thumbnailId],
    instructor: instructorId,
  };
  if (course.duration !== "" && course.duration !== undefined && course.duration !== null) data.duration = Number(course.duration);
  if (course.extraSupport !== undefined && course.extraSupport !== null) data.extraSupport = String(course.extraSupport).trim();
    if (process.env.NODE_ENV !== "production") console.debug("[courses] Updating course", { documentId, payload: { data } });
  return request(`/courses/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export async function deleteCourse(documentId) {
  return request(`/courses/${encodeURIComponent(documentId)}`, { method: "DELETE" });
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

export { COURSE_LEVELS, request };
