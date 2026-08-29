"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPublicCourse, getLessonsForCourse, getCourseImageUrl } from "@/services/strapi/courses";
import { getQuizzes, normalizeQuiz } from "@/services/strapi/quizzes";
import { checkUserEnrollment } from "@/services/strapi/enrolls";
import { getLessonProgresses, markLessonComplete } from "@/services/strapi/lessonProgress";
import { getQuizProgresses, submitQuizProgress } from "@/services/strapi/quizProgress";

function LessonVideoPlayer({ lesson }) {
  const rawVideo = lesson?.videourl;
  let videoUrl = "";

  if (Array.isArray(rawVideo) && rawVideo.length > 0) {
    videoUrl = rawVideo[0]?.url || rawVideo[0]?.data?.attributes?.url || "";
  } else if (rawVideo && typeof rawVideo === "object") {
    videoUrl = rawVideo.url || rawVideo.data?.attributes?.url || "";
  } else if (typeof rawVideo === "string") {
    videoUrl = rawVideo;
  }

  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
    const base = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_STRAPI_API_URL ||
      "http://localhost:1337"
    ).replace(/\/api\/?$/, "");
    videoUrl = `${base}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`;
  }

  if (!videoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500">
        <svg className="h-16 w-16 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-400">No video attached to this lesson.</p>
        <p className="mt-1 text-xs text-slate-600">Review the written description below to complete the lesson.</p>
      </div>
    );
  }

  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("vimeo.com")) {
    let embedUrl = videoUrl;
    if (videoUrl.includes("watch?v=")) {
      embedUrl = videoUrl.replace("watch?v=", "embed/");
    } else if (videoUrl.includes("youtu.be/")) {
      const id = videoUrl.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <iframe
          src={embedUrl}
          title={lesson.title || "Lesson Video"}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      <video
        key={videoUrl}
        controls
        controlsList="nodownload"
        className="h-full w-full object-contain"
      >
        <source src={videoUrl} />
        Your browser does not support HTML5 video streaming.
      </video>
    </div>
  );
}

function QuizRunner({ quiz, onFinish, onCancel }) {
  const normalized = normalizeQuiz(quiz);
  const questions = normalized.questions || [];

  const [answers, setAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    Math.max(30, Math.round((Number(quiz.timelimit) || 5) * 60))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  const calculateScore = useCallback(() => {
    let score = 0;
    let total = 0;
    questions.forEach((q, index) => {
      const marks = Number(q.marks) || 1;
      total += marks;
      if (answers[index] === q.correctAnswer) {
        score += marks;
      }
    });
    const pct = total > 0 ? Number(((score / total) * 100).toFixed(2)) : 0;
    return { score, total, percentage: pct };
  }, [questions, answers]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const { score, total, percentage } = calculateScore();
    try {
      await onFinish({ result: score, totalMarks: total, percentage });
    } catch (err) {
      console.error("[quiz] Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, calculateScore, onFinish]);

  const handleAbandon = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let total = 0;
    questions.forEach((q) => {
      total += Number(q.marks) || 1;
    });

    try {
      await onFinish({ result: 0, totalMarks: total, percentage: 0 });
    } catch (err) {
      console.error("[quiz] Abandon error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, questions, onFinish]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleSubmit]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Quiz Header & Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <span className="inline-flex items-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
            Active Quiz Attempt
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-100">{quiz.title}</h3>
          {quiz.description && <p className="mt-1 text-xs text-slate-400">{quiz.description}</p>}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-sm font-bold ${timeLeftSeconds < 60 ? "border-rose-500/40 bg-rose-500/10 text-rose-300 animate-pulse" : "border-slate-800 bg-slate-950 text-amber-300"}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedTime}
          </div>
          <button
            type="button"
            onClick={handleAbandon}
            disabled={isSubmitting}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
          >
            Cancel / Abandon Quiz
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-slate-200">
                <span className="text-orange-400 font-bold mr-1.5">{qIndex + 1}.</span> {q.question}
              </p>
              <span className="shrink-0 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {q.marks || 1} {q.marks === 1 ? "mark" : "marks"}
              </span>
            </div>

            <div className="grid gap-2.5 pt-1">
              {q.options.map((option, optIndex) => {
                if (!option) return null;
                const isSelected = answers[qIndex] === optIndex;
                return (
                  <label
                    key={optIndex}
                    className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? "border-orange-500/60 bg-orange-500/15 text-orange-200 font-semibold"
                        : "border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={isSelected}
                      onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))}
                      className="sr-only"
                    />
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-orange-400 bg-orange-500" : "border-slate-700 bg-slate-950"}`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-5 gap-4">
        <p className="text-xs text-slate-400">
          Answered {Object.keys(answers).length} of {questions.length} questions
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting Quiz..." : "Submit Quiz Attempt"}
        </button>
      </div>
    </div>
  );
}

function QuizChart({ quizzes, progressMap }) {
  if (!quizzes || quizzes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quiz Performance Breakdown</h3>
      <div className="space-y-3 pt-2">
        {quizzes.map((quiz) => {
          const qDocId = quiz.documentId || quiz.id;
          const prog = progressMap[qDocId];
          const attempted = Boolean(prog);
          const percentage = attempted ? Number(prog.percentage || 0) : 0;

          return (
            <div key={qDocId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md">
                  {quiz.title}
                </span>
                <span className={`font-semibold ${attempted ? (percentage >= 70 ? "text-emerald-400" : "text-amber-400") : "text-slate-500"}`}>
                  {attempted ? `${percentage}% (${prog.result}/${prog.totalMarks})` : "0% (Not Attempted)"}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    attempted
                      ? percentage >= 70
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-slate-800"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CourseLearningPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseDocumentId = unwrappedParams?.courseDocumentId;

  const { isAuthenticated, isLoading: authLoading, role } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonProgressMap, setLessonProgressMap] = useState({});
  const [quizProgressMap, setQuizProgressMap] = useState({});
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [completingLessonId, setCompletingLessonId] = useState(null);

  const accessError = !isAuthenticated
    ? null
    : role !== "student"
      ? "Only student accounts can access the course learning flow."
      : null;
  const missingCourseError = !courseDocumentId ? "Course identifier is missing." : null;
  const isEffectivelyLoading = isLoadingData && !accessError && !missingCourseError;

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/my-courses/${courseDocumentId}`);
      return;
    }

    if (role !== "student" || !courseDocumentId) {
      return;
    }

    let isMounted = true;

    async function loadLearningContent() {
      try {
        const enrolled = await checkUserEnrollment(courseDocumentId);
        if (!isMounted) return;

        if (!enrolled) {
          setIsEnrolled(false);
          setIsLoadingData(false);
          return;
        }
        setIsEnrolled(true);

        const [courseRes, lessonsRes, quizzesRes, lProgressRes, qProgressRes] = await Promise.all([
          getPublicCourse(courseDocumentId),
          getLessonsForCourse(courseDocumentId),
          getQuizzes({ courseId: courseDocumentId }),
          getLessonProgresses(courseDocumentId),
          getQuizProgresses(courseDocumentId),
        ]);

        if (!isMounted) return;

        const courseData = courseRes?.data || courseRes;
        const lessonsData = lessonsRes?.data || (Array.isArray(lessonsRes) ? lessonsRes : []);
        const quizzesData = quizzesRes?.data || (Array.isArray(quizzesRes) ? quizzesRes : []);
        const lProgressList = lProgressRes?.data || (Array.isArray(lProgressRes) ? lProgressRes : []);
        const qProgressList = qProgressRes?.data || (Array.isArray(qProgressRes) ? qProgressRes : []);

        // Sort lessons createdAt asc
        const sortedLessons = [...lessonsData].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA - dateB;
        });

        setCourse(courseData);
        setLessons(sortedLessons);
        setQuizzes(quizzesData);
        if (sortedLessons.length > 0) {
          setSelectedLesson(sortedLessons[0]);
        }

        // Build lesson progress lookup map
        const lpMap = {};
        lProgressList.forEach((lp) => {
          const les = lp.lessonId;
          const lesId = les?.documentId || les?.id || lp.lessonId;
          if (lesId && (lp.completed || lp.attributes?.completed)) {
            lpMap[lesId] = true;
          }
        });
        setLessonProgressMap(lpMap);

        // Build quiz progress lookup map
        const qpMap = {};
        qProgressList.forEach((qp) => {
          const qz = qp.quizId;
          const qzId = qz?.documentId || qz?.id || qp.quizId;
          if (qzId) {
            qpMap[qzId] = qp;
          }
        });
        setQuizProgressMap(qpMap);

      } catch (err) {
        if (isMounted) setLoadError(err.message || "Failed to load learning content.");
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadLearningContent();

    return () => {
      isMounted = false;
    };
  }, [courseDocumentId, isAuthenticated, authLoading, role, router]);

  const handleMarkComplete = async (lessonDocId) => {
    if (!lessonDocId || lessonProgressMap[lessonDocId] || completingLessonId) return;

    setCompletingLessonId(lessonDocId);
    try {
      await markLessonComplete({
        courseId: courseDocumentId,
        lessonId: lessonDocId,
      });

      setLessonProgressMap((prev) => ({
        ...prev,
        [lessonDocId]: true,
      }));
    } catch (err) {
      console.error("[learning] Mark complete error:", err);
    } finally {
      setCompletingLessonId(null);
    }
  };

  const handleQuizFinish = async (resultPayload) => {
    if (!activeQuiz) return;
    const qDocId = activeQuiz.documentId || activeQuiz.id;

    try {
      const res = await submitQuizProgress({
        courseId: courseDocumentId,
        quizId: qDocId,
        ...resultPayload,
      });

      const newProgress = res?.data || res || {
        result: resultPayload.result,
        totalMarks: resultPayload.totalMarks,
        percentage: resultPayload.percentage,
      };

      setQuizProgressMap((prev) => ({
        ...prev,
        [qDocId]: newProgress,
      }));
    } catch (err) {
      console.error("[learning] Submit quiz error:", err);
      // Fallback local update if backend returned 400 because duplicate or recorded
      setQuizProgressMap((prev) => ({
        ...prev,
        [qDocId]: {
          result: resultPayload.result,
          totalMarks: resultPayload.totalMarks,
          percentage: resultPayload.percentage,
        },
      }));
    } finally {
      setActiveQuiz(null);
    }
  };

  if (accessError) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-orange-500/20 bg-slate-900/80 p-8 text-center sm:p-12 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Access Restricted</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{accessError}</p>
            <Link
              href={`/courses/${courseDocumentId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110"
            >
              Go to Course Details & Enroll
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (missingCourseError) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h1 className="text-xl font-bold text-slate-100">Error Loading Course</h1>
            <p className="mt-2 text-sm text-slate-400">{missingCourseError}</p>
            <Link
              href="/my-courses"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || isLoadingData) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-900" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.4fr)]">
            <div className="space-y-6">
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-slate-900" />
              <div className="h-32 animate-pulse rounded-2xl bg-slate-900" />
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-orange-500/20 bg-slate-900/80 p-8 text-center sm:p-12 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Access Restricted</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Please enroll in this course first to access the video lessons, study materials, and quizzes.
            </p>
            <div className="pt-2">
              <Link
                href={`/courses/${courseDocumentId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110"
              >
                Go to Course Details & Enroll
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h1 className="text-xl font-bold text-slate-100">Error Loading Course</h1>
            <p className="mt-2 text-sm text-slate-400">{loadError || "Course content is not available."}</p>
            <Link
              href="/my-courses"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Course progress calculations
  const totalLessons = lessons.length;
  const completedLessonsCount = lessons.filter((l) => lessonProgressMap[l.documentId || l.id]).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const selLessonDocId = selectedLesson?.documentId || selectedLesson?.id;
  const isCurrentCompleted = Boolean(lessonProgressMap[selLessonDocId]);

  return (
    <div className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/my-courses" className="hover:text-orange-400 transition">
              My Courses
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-200 truncate max-w-xs">{course.title}</span>
          </div>
          <Link
            href="/my-courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Enrolled Courses
          </Link>
        </div>

        {/* Main 2-Column Learning Layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.4fr)]">
          {/* LEFT / MAIN AREA */}
          <div className="space-y-8">
            {activeQuiz ? (
              <QuizRunner
                quiz={activeQuiz}
                onFinish={handleQuizFinish}
                onCancel={() => setActiveQuiz(null)}
              />
            ) : selectedLesson ? (
              <div className="space-y-6">
                {/* Lesson Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
                      Lesson {lessons.findIndex((l) => (l.documentId || l.id) === selLessonDocId) + 1} of {totalLessons}
                    </span>
                    {isCurrentCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-100">{selectedLesson.title}</h2>
                </div>

                {/* Video Player */}
                <LessonVideoPlayer lesson={selectedLesson} />

                {/* Lesson Details & Complete Action */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-200">Lesson Description</h3>
                      {selectedLesson.duration != null && (
                        <p className="text-xs text-slate-500 mt-0.5">Duration: {selectedLesson.duration} minutes</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMarkComplete(selLessonDocId)}
                      disabled={isCurrentCompleted || completingLessonId === selLessonDocId}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition ${
                        isCurrentCompleted
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default"
                          : "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 hover:brightness-110 disabled:opacity-50"
                      }`}
                    >
                      {isCurrentCompleted ? (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </>
                      ) : completingLessonId === selLessonDocId ? (
                        "Updating..."
                      ) : (
                        "Complete Lesson"
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedLesson.description || "No description provided for this lesson."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
                No lessons available for this course yet.
              </div>
            )}

            {/* Course Progress Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Course Progress</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {completedLessonsCount} / {totalLessons} lessons completed
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-orange-400">{progressPercentage}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Quiz Results Chart Section */}
            <QuizChart quizzes={quizzes} progressMap={quizProgressMap} />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Lessons Navigation Sidebar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Course Content</h3>
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  {totalLessons} lessons
                </span>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {lessons.map((lesson, idx) => {
                  const lesDocId = lesson.documentId || lesson.id;
                  const isSelected = (selectedLesson?.documentId || selectedLesson?.id) === lesDocId && !activeQuiz;
                  const isDone = Boolean(lessonProgressMap[lesDocId]);

                  return (
                    <button
                      key={lesDocId}
                      type="button"
                      onClick={() => {
                        setActiveQuiz(null);
                        setSelectedLesson(lesson);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                        isSelected
                          ? "border border-orange-500/50 bg-orange-500/10 text-orange-200"
                          : "border border-slate-800/80 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-orange-500 text-white"
                          : "border border-slate-700 bg-slate-900 text-slate-500"
                      }`}>
                        {isDone ? (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden leading-tight">
                        <p className={`text-xs font-semibold line-clamp-1 ${isSelected ? "text-orange-300" : "text-slate-200"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration != null && (
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {lesson.duration} mins
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quizzes Sidebar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Course Quizzes</h3>
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  {quizzes.length} available
                </span>
              </div>

              {quizzes.length === 0 ? (
                <p className="text-xs text-slate-500">No quizzes available for this course yet.</p>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => {
                    const qDocId = quiz.documentId || quiz.id;
                    const progress = quizProgressMap[qDocId];
                    const isAttempted = Boolean(progress);
                    const isActive = (activeQuiz?.documentId || activeQuiz?.id) === qDocId;

                    return (
                      <div
                        key={qDocId}
                        className={`rounded-xl border p-3 space-y-2 transition ${
                          isActive
                            ? "border-orange-500/60 bg-orange-500/10"
                            : isAttempted
                            ? "border-slate-800 bg-slate-950/70"
                            : "border-slate-800 bg-slate-900/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{quiz.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Time limit: {quiz.timelimit || 5} min
                            </p>
                          </div>

                          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            isAttempted
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          }`}>
                            {isAttempted ? "Attempted" : "Available"}
                          </span>
                        </div>

                        {isAttempted ? (
                          <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Your Result:</span>
                            <span className="font-bold text-emerald-400">
                              {progress.result} / {progress.totalMarks} ({progress.percentage}%)
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveQuiz(quiz)}
                            disabled={isActive}
                            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 transition disabled:opacity-50"
                          >
                            {isActive ? "Quiz In Progress" : "Start Quiz"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
