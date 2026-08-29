import { request } from "@/services/strapi/courses";

/**
 * Fetches quiz progress records for the current authenticated student in a course.
 * @param {string|number} courseId
 */
export async function getQuizProgresses(courseId) {
  if (!courseId) return { data: [] };
  const params = new URLSearchParams({
    "filters[courseId][documentId][$eq]": String(courseId),
    "populate[quizId]": "true",
  });
  return request(`/quizprogresses?${params.toString()}`);
}

/**
 * Submits quiz attempt results for the current authenticated student.
 * @param {Object} payload { courseId, quizId, result, totalMarks, percentage }
 */
export async function submitQuizProgress({ courseId, quizId, result, totalMarks, percentage }) {
  if (!courseId || !quizId) {
    throw new Error("Both courseId and quizId are required to submit quiz progress.");
  }
  const numericResult = Number(result) || 0;
  const numericTotalMarks = Number(totalMarks) || 0;
  const computedPercentage = numericTotalMarks > 0
    ? Number(((numericResult / numericTotalMarks) * 100).toFixed(2))
    : Number(percentage) || 0;

  return request("/quizprogresses", {
    method: "POST",
    body: JSON.stringify({
      data: {
        courseId: String(courseId),
        quizId: String(quizId),
        result: numericResult,
        totalMarks: numericTotalMarks,
        percentage: computedPercentage,
      },
    }),
  });
}
