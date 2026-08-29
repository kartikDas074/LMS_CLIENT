import { request } from "@/services/strapi/courses";

const unwrap = (response) => response?.data || response;

export async function getQuizzes({ courseId, search = "" } = {}) {
  const params = new URLSearchParams({
    "populate[courseId]": "true",
    sort: "createdAt:desc",
  });
  if (courseId) params.set("filters[courseId][documentId][$eq]", String(courseId));
  if (search.trim()) params.set("filters[title][$containsi]", search.trim());
  return request(`/quizzes?${params.toString()}`);
}

export async function getQuiz(quizId) {
  return request(`/quizzes/${encodeURIComponent(quizId)}?populate[courseId][populate][instructor]=true`);
}

export async function createQuiz({ title, description, timelimit, courseId, questions }) {
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quiz";
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
  return request("/quizzes", {
    method: "POST",
    body: JSON.stringify({ data: { courseId, title: title.trim(), description: description.trim(), question: { questions }, timelimit: Number(timelimit), quizNo: `${slug}-${suffix}` } }),
  });
}

export async function updateQuiz(quizId, changedData) {
  if (!changedData || Object.keys(changedData).length === 0) {
    return Promise.resolve({ data: {} });
  }
  return request(`/quizzes/${encodeURIComponent(quizId)}`, {
    method: "PUT",
    body: JSON.stringify({ data: changedData }),
  });
}

export async function deleteQuiz(quizId) {
  return request(`/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" });
}

export function normalizeQuiz(value) {
  const quiz = unwrap(value) || {};
  const questionValue = quiz.question?.questions ? quiz.question.questions : Array.isArray(quiz.question) ? quiz.question : [];
  return { ...quiz, questions: questionValue.map((item) => ({ question: item.question || "", options: [0, 1, 2, 3].map((index) => item.options?.[index] || ""), correctAnswer: Number.isInteger(item.correctAnswer) ? item.correctAnswer : 0, marks: item.marks || 1 })) };
}
