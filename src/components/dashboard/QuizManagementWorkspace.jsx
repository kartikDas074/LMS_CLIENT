"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";
import { getCourse, getCourseImageUrl } from "@/services/strapi/courses";
import { getQuizzes, deleteQuiz } from "@/services/strapi/quizzes";
import { fetchCurrentUser, getStoredToken } from "@/lib/auth";

export default function QuizManagementWorkspace({ role, courseId, selectedQuizId }) {
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      setError("");
      setAuthError("");

      try {
        const [courseResponse, currentUser] = await Promise.all([
          getCourse(courseId),
          fetchCurrentUser(getStoredToken()).catch(() => null),
        ]);

        const loadedCourse = courseResponse?.data || courseResponse;
        if (!loadedCourse?.documentId && !loadedCourse?.id) throw new Error("Course not found.");

        // Authorization check for instructors
        if (role === "instructor" && String(loadedCourse.instructor?.id) !== String(currentUser?.id)) {
          setAuthError("You are not authorized to manage quizzes for this course.");
          setState("error");
          if (active) return;
        }

        if (active) setCourse(loadedCourse);

        // Fetch quizzes for this course
        const quizzesResponse = await getQuizzes({ courseId });
        if (active) {
          setQuizzes(quizzesResponse?.data || []);
          setState("ready");
        }
      } catch (loadError) {
        console.error("[quizzes] Failed to load", loadError);
        if (active) {
          setError(loadError.message || "Unable to load quizzes.");
          setState("error");
        }
      }
    }

    load();
    return () => { active = false; };
  }, [courseId, role]);

  const handleDelete = useCallback(
    async (quiz) => {
      if (!window.confirm(`Delete Quiz?\n\nAre you sure you want to delete "${quiz.title}"?\n\nThis action cannot be undone.`))
        return;

      setDeleting(quiz.documentId || quiz.id);
      try {
        await deleteQuiz(quiz.documentId || quiz.id);
        setQuizzes((current) => current.filter((q) => (q.documentId || q.id) !== (quiz.documentId || quiz.id)));
      } catch (deleteError) {
        console.error("[quizzes] Failed to delete quiz", deleteError);
        setError(deleteError.message || "Unable to delete quiz.");
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  if (state === "loading") {
    return (
      <div className="flex h-screen gap-6">
        <div className="w-64 shrink-0 animate-pulse space-y-4">
          <div className="h-32 rounded-xl bg-slate-800" />
          <div className="h-8 w-3/4 rounded bg-slate-800" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 rounded bg-slate-800/60" />
            ))}
          </div>
        </div>
        <div className="flex-1 animate-pulse">
          <div className="h-40 rounded-xl bg-slate-800" />
        </div>
      </div>
    );
  }

  if (state === "error" || !course) {
    return (
      <EmptyState
        title="Unable to load course"
        description={authError || error || "This course could not be loaded."}
      />
    );
  }

  const courseIdKey = course.documentId || course.id;

  return (
    <div className="grid min-h-screen gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
        {/* Course Card */}
        <Card className="overflow-hidden p-0">
          <div className="relative h-24 bg-gradient-to-br from-slate-800 to-slate-900">
            {getCourseImageUrl(course.thumbnail) ? (
              <img src={getCourseImageUrl(course.thumbnail)} alt="" className="h-full w-full object-cover opacity-60" />
            ) : (
              <div className="flex h-full items-center justify-center text-orange-400">
                <Icon name="book" size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>
          <div className="p-4">
            <h2 className="line-clamp-2 text-sm font-semibold text-white">{course.title}</h2>
            <p className="mt-2 text-xs text-slate-500">{quizzes.length} quizzes</p>
            <Link
              href={`/dashboard/${role}/courses`}
              className="mt-4 inline-flex w-full justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-orange-500/40 hover:text-orange-300"
            >
              ← Back to Courses
            </Link>
          </div>
        </Card>

        {/* Quizzes List */}
        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-300">Quizzes</h3>
            <Link
              href={`/dashboard/${role}/quizzes/${courseIdKey}/add`}
              className="inline-flex rounded-lg bg-orange-500/15 px-2 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/25"
              title="Add Quiz"
            >
              <Icon name="plus" size={12} />
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">No quizzes yet</p>
          ) : (
            <nav className="space-y-1">
              {quizzes.map((quiz) => {
                const quizIdKey = quiz.documentId || quiz.id;
                const isSelected = selectedQuizId === quizIdKey;
                return (
                  <Link
                    key={quizIdKey}
                    href={`/dashboard/${role}/quizzes/${courseIdKey}/${quizIdKey}`}
                    className={`block rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-orange-500/15 text-orange-300"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-800/60 text-xs font-semibold">
                        {quizzes.indexOf(quiz) + 1}
                      </span>
                      <span className="line-clamp-1 flex-1">{quiz.title}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </Card>
      </aside>

      {/* Main Content */}
      <main className="space-y-6">
        {!selectedQuizId ? (
          <Card className="border-dashed p-12 text-center">
            <Icon name="clipboard-check" size={48} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-300">Select a quiz</h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a quiz from the sidebar to view, edit, or delete it.
            </p>
            <Link
              href={`/dashboard/${role}/quizzes/${courseIdKey}/add`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
            >
              <Icon name="plus" size={16} />
              Create First Quiz
            </Link>
          </Card>
        ) : (
          <QuizDetails
            quizId={selectedQuizId}
            courseId={courseIdKey}
            role={role}
            onDelete={() => {
              window.location.reload();
            }}
          />
        )}

        {error && (
          <Card className="border-red-400/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </Card>
        )}
      </main>
    </div>
  );
}

// Sub-component for quiz details in management view
function QuizDetails({ quizId, courseId, role, onDelete }) {
  const [quiz, setQuiz] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { getQuiz, normalizeQuiz } = await import("@/services/strapi/quizzes");
        const response = await getQuiz(quizId);
        if (active) {
          setQuiz(normalizeQuiz(response));
          setState("ready");
        }
      } catch (loadError) {
        console.error("[quizzes] Failed to load quiz", loadError);
        if (active) {
          setError("Unable to load quiz.");
          setState("error");
        }
      }
    }

    load();
    return () => { active = false; };
  }, [quizId]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${quiz.title}"?\n\nThis action cannot be undone.`)) return;

    setDeleting(true);
    try {
      const { deleteQuiz } = await import("@/services/strapi/quizzes");
      await deleteQuiz(quizId);
      onDelete();
    } catch (deleteError) {
      console.error("[quizzes] Failed to delete quiz", deleteError);
      setError(deleteError.message || "Unable to delete quiz.");
      setDeleting(false);
    }
  }

  if (state === "loading") {
    return (
      <Card className="animate-pulse p-8">
        <div className="h-8 w-1/2 rounded bg-slate-800" />
        <div className="mt-6 h-40 rounded bg-slate-800/70" />
      </Card>
    );
  }

  if (state === "error" || !quiz) {
    return (
      <Card className="border-red-400/20 bg-red-500/10 p-6">
        <p className="text-sm text-red-200">{error}</p>
      </Card>
    );
  }

  const totalMarks = quiz.questions.reduce((total, q) => total + Number(q.marks || 0), 0);

  return (
    <Card className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{quiz.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>{quiz.questions.length} questions</span>
            <span>Time: {quiz.timelimit} minutes</span>
            <span>Total marks: {totalMarks}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${role}/quizzes/${courseId}/${quizId}`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-orange-300"
          >
            View
          </Link>
          <Link
            href={`/dashboard/${role}/quizzes/${courseId}/${quizId}/edit`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </Card>
  );
}
