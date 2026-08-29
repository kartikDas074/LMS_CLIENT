import { request } from "@/services/strapi/courses";

/**
 * Fetches student progress list for a specific course (Admin, Content Manager, and Instructor only).
 * @param {string|number} courseId
 */
export async function getCourseStudentProgress(courseId) {
  if (!courseId) {
    throw new Error("Course identifier is required to view student progress.");
  }
  return request(`/student-progress?courseId=${encodeURIComponent(courseId)}`);
}
