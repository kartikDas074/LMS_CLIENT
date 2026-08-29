"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments } from "@/services/strapi/enrolls";
import { getLessonsForCourse, getCourseImageUrl } from "@/services/strapi/courses";
import { getLessonProgresses } from "@/services/strapi/lessonProgress";

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  const accessError = !isAuthenticated
    ? null
    : role !== "student"
      ? "My Courses is reserved for student accounts."
      : null;

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=/my-courses");
      return;
    }

    if (role !== "student") {
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        const response = await getMyEnrollments();
        const items = response?.data || (Array.isArray(response) ? response : []);
        if (!isMounted) return;

        setEnrollments(Array.isArray(items) ? items : []);

        const progressEntries = await Promise.all(
          items.map(async (item) => {
            const course = item.courseId;
            if (!course) return null;

            const courseDocId = course.documentId || course.id;
            try {
              const [lessonsRes, progressRes] = await Promise.all([
                getLessonsForCourse(courseDocId).catch(() => ({ data: [] })),
                getLessonProgresses(courseDocId).catch(() => ({ data: [] })),
              ]);

              const lessons = lessonsRes?.data || (Array.isArray(lessonsRes) ? lessonsRes : []);
              const progressList = progressRes?.data || (Array.isArray(progressRes) ? progressRes : []);
              
              const completedCount = progressList.filter((p) => p.completed || p.attributes?.completed).length;
              const totalLessons = lessons.length;
              const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              return [
                courseDocId,
                { completedCount, totalLessons, percentage },
              ];
            } catch {
              return [courseDocId, { completedCount: 0, totalLessons: 0, percentage: 0 }];
            }
          })
        );

        if (isMounted) {
          const map = {};
          progressEntries.filter(Boolean).forEach(([id, data]) => {
            map[id] = data;
          });
          setCourseProgressMap(map);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load enrolled courses.");
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, role, router]);

  if (accessError) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center sm:p-12">
            <h1 className="text-xl font-bold text-slate-100">Access Restricted</h1>
            <p className="mt-2 text-sm text-slate-400">{accessError}</p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || isLoadingData) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-900" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 animate-pulse rounded-2xl bg-slate-900" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center sm:p-12">
            <h1 className="text-xl font-bold text-slate-100">Access Restricted</h1>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              My Enrolled Courses
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Welcome back, <span className="text-orange-400 font-semibold">{user?.username}</span>! Track your progress and continue learning.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-orange-500/40 hover:text-orange-300"
          >
            Explore More Courses
          </Link>
        </div>

        {/* Content */}
        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-100">No Enrolled Courses Yet</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              You haven&apos;t enrolled in any courses yet. Browse our catalog and start your learning path today.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110"
            >
              Browse Courses
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.courseId;
              if (!course) return null;

              const docId = course.documentId || course.id;
              const image = getCourseImageUrl(course.thumbnail);
              const instructorName = course.instructor?.username || course.instructor?.email || "Instructor";
              const progress = courseProgressMap[docId] || { completedCount: 0, totalLessons: 0, percentage: 0 };

              return (
                <div
                  key={enrollment.id || docId}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition-all hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={course.title || "Course thumbnail"}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-orange-400">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-xs">
                        {course.level || "Course"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold text-slate-100 line-clamp-1">
                      {course.title}
                    </h2>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                      {course.shortDescription || course.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-orange-400">
                        {instructorName.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{instructorName}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 border-t border-slate-800/80 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Course Progress</span>
                        <span className="text-orange-400 font-semibold">{progress.percentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {progress.completedCount} of {progress.totalLessons} lessons completed
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/my-courses/${docId}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110"
                    >
                      Continue Learning
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
