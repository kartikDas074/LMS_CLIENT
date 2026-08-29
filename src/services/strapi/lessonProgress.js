import { request } from "@/services/strapi/courses";

/**
 * Fetches lesson progress records for the current authenticated student in a course.
 * @param {string|number} courseId
 */
export async function getLessonProgresses(courseId) {
  if (!courseId) return { data: [] };
  const params = new URLSearchParams({
    "filters[courseId][documentId][$eq]": String(courseId),
    "populate[lessonId]": "true",
  });
  return request(`/lesson-progresses?${params.toString()}`);
}

/**
 * Marks a lesson as completed for the current authenticated student.
 * @param {Object} payload { courseId, lessonId }
 */
export async function markLessonComplete({ courseId, lessonId }) {
  if (!courseId || !lessonId) {
    throw new Error("Both courseId and lessonId are required to mark lesson progress.");
  }
  return request("/lesson-progresses", {
    method: "POST",
    body: JSON.stringify({
      data: {
        courseId: String(courseId),
        lessonId: String(lessonId),
        completed: true,
      },
    }),
  });
}
