"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import CourseCard from "@/components/public/CourseCard";
import CourseCardSkeleton from "@/components/public/CourseCardSkeleton";
import { getPublicCourses } from "@/services/strapi/courses";

export default function CoursesClient() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    getPublicCourses()
      .then((response) => {
        const items = response?.data || [];
        if (isMounted) setCourses(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Unable to load courses.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter((course) => {
      const title = course.title?.toLowerCase() || "";
      const description = course.shortDescription?.toLowerCase() || "";
      const instructor = course.instructor?.username?.toLowerCase() || "";
      const level = course.level?.toLowerCase() || "";
      return title.includes(q) || description.includes(q) || instructor.includes(q) || level.includes(q);
    });
  }, [courses, searchQuery]);

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-400" />
            Public Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
            Explore Courses
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Browse our full catalog of courses. Pick a topic, set your pace, and start learning from expert instructors.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8">
          <div className="relative max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, instructor, or topic..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* Course Count */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>
            {loading ? "Loading courses..." : `Showing ${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"}`}
          </span>
          {courses.length > 0 && (
            <span>Powered by LearnHub LMS</span>
          )}
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="mt-10 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
            <p className="text-sm font-medium text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <CourseCardSkeleton key={idx} />)
              : filteredCourses.map((course) => (
                  <CourseCard key={course.documentId || course.id} course={course} />
                ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="mt-16 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">No courses found</p>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your search or browse all available courses.</p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
