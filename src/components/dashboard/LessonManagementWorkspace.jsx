"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";
import { getCourse, getLessonsForCourse, getCourseImageUrl } from "@/services/strapi/courses";
import { deleteLesson } from "@/services/strapi/lessons";
import { fetchCurrentUser, getStoredToken } from "@/lib/auth";

export default function LessonManagement({ role, courseId, selectedLessonId }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
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
          setAuthError("You are not authorized to manage lessons for this course.");
          setState("error");
          if (active) return;
        }

        if (active) setCourse(loadedCourse);

        // Fetch lessons
        const lessonsResponse = await getLessonsForCourse(courseId);
        if (active) {
          setLessons(lessonsResponse?.data || []);
          setState("ready");
        }
      } catch (loadError) {
        console.error("[lessons] Failed to load", loadError);
        if (active) {
          setError(loadError.message || "Unable to load lessons.");
          setState("error");
        }
      }
    }

    load();
    return () => { active = false; };
  }, [courseId, role]);

  const handleDelete = useCallback(
    async (lesson) => {
      if (!window.confirm(`Delete Lesson?\n\nAre you sure you want to delete "${lesson.title}"?\n\nThis action cannot be undone.`))
        return;

      setDeleting(lesson.documentId || lesson.id);
      try {
        await deleteLesson(lesson.documentId || lesson.id);
        setLessons((current) => current.filter((l) => (l.documentId || l.id) !== (lesson.documentId || lesson.id)));
      } catch (deleteError) {
        console.error("[lessons] Failed to delete lesson", deleteError);
        setError(deleteError.message || "Unable to delete lesson.");
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
            <p className="mt-2 text-xs text-slate-500">{lessons.length} lessons</p>
            <Link
              href={`/dashboard/${role}/courses`}
              className="mt-4 inline-flex w-full justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-orange-500/40 hover:text-orange-300"
            >
              ← Back to Courses
            </Link>
          </div>
        </Card>

        {/* Lessons List */}
        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-300">Lessons</h3>
            <Link
              href={`/dashboard/${role}/lessons/${courseIdKey}/add`}
              className="inline-flex rounded-lg bg-orange-500/15 px-2 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/25"
              title="Add Lesson"
            >
              <Icon name="plus" size={12} />
            </Link>
          </div>

          {lessons.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">No lessons yet</p>
          ) : (
            <nav className="space-y-1">
              {lessons.map((lesson) => {
                const lessonIdKey = lesson.documentId || lesson.id;
                const isSelected = selectedLessonId === lessonIdKey;
                return (
                  <Link
                    key={lessonIdKey}
                    href={`/dashboard/${role}/lessons/${courseIdKey}/${lessonIdKey}`}
                    className={`block rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-orange-500/15 text-orange-300"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-800/60 text-xs font-semibold">
                        {String(lesson.lessonOrder || 0).padStart(2, "0")}
                      </span>
                      <span className="line-clamp-1 flex-1">{lesson.title}</span>
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
        {/* Header with selected lesson or empty state */}
        {!selectedLessonId ? (
          <Card className="border-dashed p-12 text-center">
            <Icon name="book" size={48} className="mx-auto text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-300">Select a lesson</h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a lesson from the sidebar to view, edit, or delete it.
            </p>
            <Link
              href={`/dashboard/${role}/lessons/${courseIdKey}/add`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
            >
              <Icon name="plus" size={16} />
              Add First Lesson
            </Link>
          </Card>
        ) : (
          <>
            {/* Lesson details will be rendered by parent or component wrapper */}
            {selectedLessonId && (
              <LessonDetails
                lessonId={selectedLessonId}
                courseId={courseIdKey}
                role={role}
                onDelete={() => {
                  // Refresh lessons
                  window.location.reload();
                }}
              />
            )}
          </>
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

// Sub-component for lesson details in management view
function LessonDetails({ lessonId, courseId, role, onDelete }) {
  const [lesson, setLesson] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { getLesson } = await import("@/services/strapi/lessons");
        const response = await getLesson(lessonId);
        if (active) {
          setLesson(response?.data || response);
          setState("ready");
        }
      } catch (loadError) {
        console.error("[lessons] Failed to load lesson", loadError);
        if (active) {
          setError("Unable to load lesson.");
          setState("error");
        }
      }
    }

    load();
    return () => { active = false; };
  }, [lessonId]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${lesson.title}"?\n\nThis action cannot be undone.`)) return;

    setDeleting(true);
    try {
      const { deleteLesson } = await import("@/services/strapi/lessons");
      await deleteLesson(lessonId);
      onDelete();
    } catch (deleteError) {
      console.error("[lessons] Failed to delete lesson", deleteError);
      setError(deleteError.message || "Unable to delete lesson.");
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

  if (state === "error" || !lesson) {
    return (
      <Card className="border-red-400/20 bg-red-500/10 p-6">
        <p className="text-sm text-red-200">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{lesson.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{lesson.description}</p>
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span>Duration: {lesson.duration || "N/A"} min</span>
            <span>Lesson #{String(lesson.lessonOrder || 0).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${role}/lessons/${courseId}/${lessonId}`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-orange-300"
          >
            View
          </Link>
          <Link
            href={`/dashboard/${role}/lessons/${courseId}/${lessonId}/edit`}
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
