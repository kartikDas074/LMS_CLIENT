import { request, publicRequest } from "@/services/strapi/courses";

/**
 * Creates an enrollment record for the current authenticated student.
 * The backend determines the authenticated user from the session.
 * @param {string|number} courseId Document ID or ID of the course
 */
export async function createEnrollment(courseId) {
  if (!courseId) {
    throw new Error("Course identifier is required for enrollment.");
  }
  return request("/enrolls", {
    method: "POST",
    body: JSON.stringify({
      data: {
        courseId: String(courseId),
      },
    }),
  });
}

/**
 * Fetches only the current authenticated student's enrollments.
 */
export async function getMyEnrollments() {
  return request("/enrolls/my");
}

/**
 * Fetches all enrollments belonging to the current authenticated student.
 * @deprecated Use getMyEnrollments instead.
 */
export async function getUserEnrollments() {
  return getMyEnrollments();
}

/**
 * Checks if the current authenticated student is enrolled in a specific course.
 * @param {string|number} courseId
 */
export async function checkUserEnrollment(courseId) {
  if (!courseId) return false;
  try {
    const response = await getMyEnrollments();
    const records = response?.data || (Array.isArray(response) ? response : []);
    return records.some((item) => {
      const course = item.courseId;
      if (!course) return false;
      return String(course.documentId) === String(courseId) || String(course.id) === String(courseId);
    });
  } catch (error) {
    console.error("[enrolls] Failed to check enrollment status:", error);
    return false;
  }
}
