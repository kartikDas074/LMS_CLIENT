"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicCourse, getCourseImageUrl } from "@/services/strapi/courses";
import { useAuth } from "@/context/AuthContext";
import { createEnrollment, checkUserEnrollment } from "@/services/strapi/enrolls";

const LEVEL_COLORS = {
  Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Advanced: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 w-full rounded-2xl bg-slate-900" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-2xl bg-slate-900" />
          <div className="h-32 rounded-2xl bg-slate-900" />
          <div className="h-32 rounded-2xl bg-slate-900" />
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-slate-900" />
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailClient({ documentId }) {
  const router = useRouter();
  const { user, isAuthenticated, role } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const loading = Boolean(documentId) && course === null && !fetchError;
  const error = !documentId ? "Course identifier is missing." : fetchError;

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;

    getPublicCourse(documentId)
      .then((response) => {
        const data = response?.data || response;
        if (isMounted) setCourse(data || null);
      })
      .catch((err) => {
        if (isMounted) setFetchError(err.message || "Course not found.");
      });

    if (isAuthenticated && role === "student") {
      checkUserEnrollment(documentId).then((enrolled) => {
        if (isMounted) setIsEnrolled(enrolled);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [documentId, isAuthenticated, role]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${documentId}`);
      return;
    }
    if (role !== "student") {
      setEnrollError("Only students can enroll in courses.");
      return;
    }
    
    setIsEnrolling(true);
    setEnrollError("");
    try {
      await createEnrollment(documentId);
      setIsEnrolled(true);
      router.push(`/my-courses/${documentId}`);
    } catch (err) {
      setEnrollError(err.message || "Failed to enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const image = course ? getCourseImageUrl(course.thumbnail) : "";
  const instructor = course?.instructor?.username || course?.instructor?.email || null;
  const level = course?.level || "";
  const duration = course?.duration;
  const price = Number(course?.price || 0);
  const topics = Array.isArray(course?.topic) ? course.topic.filter(Boolean) : [];
  const skills = Array.isArray(course?.skills) ? course.skills.filter(Boolean) : [];
  const extraSupport = course?.extraSupport?.trim() || "";

  if (loading) {
    return (
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SkeletonDetail />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-100">Course not found</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              The course you are looking for does not exist or is no longer available.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. HERO / COURSE HEADER */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
            {/* Left: Meta */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {level && (
                  <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${LEVEL_COLORS[level] || "border-slate-700 bg-slate-800 text-slate-300"}`}>
                    {level}
                  </span>
                )}
                {duration != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                    <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {duration} min
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
                {course.title}
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed line-clamp-3">
                {course.shortDescription || "No short description available."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {instructor && (
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-orange-300">
                      {instructor.charAt(0).toUpperCase()}
                    </span>
                    {instructor}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                  <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${price.toFixed(2)}
                </span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {enrollError && (
                  <div className="w-full text-red-400 text-xs mb-2">{enrollError}</div>
                )}
                {isEnrolled ? (
                  <Link
                    href={`/my-courses/${documentId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition hover:brightness-110"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    {!isEnrolling && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                )}
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-orange-500/40 hover:text-orange-300"
                >
                  Browse All Courses
                </Link>
              </div>
            </div>

            {/* Right: Thumbnail */}
            <div className="relative h-64 sm:h-80 lg:h-auto min-h-[280px] bg-slate-950">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={course.title || "Course thumbnail"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-orange-400">
                  <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 16.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)]">
          {/* Left Column */}
          <div className="space-y-8">
            {/* 2. COURSE DESCRIPTION */}
            {course.description && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-100">About this course</h2>
                <div className="mt-4 text-sm sm:text-base text-slate-400 leading-7 whitespace-pre-line">
                  {course.description}
                </div>
              </section>
            )}

            {/* 3. WHAT YOU WILL LEARN + 5. SKILLS / TOPICS */}
            {(topics.length > 0 || skills.length > 0) && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-100">What you will learn</h2>
                <div className="mt-5 space-y-6">
                  {topics.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Topics</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {topics.map((topic) => (
                          <li key={topic} className="flex items-start gap-2.5 text-sm text-slate-300">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 6. EXTRA SUPPORT */}
            {extraSupport && (
              <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-slate-900/70 to-slate-900/70 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Extra Support</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{extraSupport}</p>
                  </div>
                </div>
              </section>
            )}

            {/* 8. CURRICULUM PLACEHOLDER */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-100">Course Curriculum</h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                The full curriculum, lessons, and quizzes for this course will be available soon. Check back later for updates.
              </p>
            </section>

            {/* 9. FINAL CTA */}
            <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-slate-900/70 to-slate-900/70 p-6 sm:p-8 text-center sm:text-left">
              <div className="sm:flex sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Start Learning Today</h2>
                  <p className="mt-2 text-sm text-slate-400 max-w-xl">
                    Build real-world skills with <span className="text-orange-300 font-semibold">{course.title}</span> and move one step closer to your goals.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end gap-2">
                  <span className="text-2xl font-extrabold text-slate-100">${price.toFixed(2)}</span>
                  {enrollError && (
                    <div className="w-full text-red-400 text-xs text-right mt-1">{enrollError}</div>
                  )}
                  {isEnrolled ? (
                    <Link
                      href={`/my-courses/${documentId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition hover:brightness-110"
                    >
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:brightness-110 disabled:opacity-70"
                    >
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                      {!isEnrolling && (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Course Info */}
          <div className="space-y-6">
            {/* 3. COURSE INFORMATION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Course Information</h3>
              <dl className="mt-4 divide-y divide-slate-800">
                {[
                  ["Level", level || "Not specified"],
                  ["Duration", duration != null ? `${duration} minutes` : "Not specified"],
                  ["Price", `$${price.toFixed(2)}`],
                  ["Instructor", instructor || "Not specified"],
                  ["Topics", topics.length > 0 ? `${topics.length} topic${topics.length === 1 ? "" : "s"}` : "Not specified"],
                  ["Skills", skills.length > 0 ? `${skills.length} skill${skills.length === 1 ? "" : "s"}` : "Not specified"],
                ].map(([label, value]) => (
                  <div key={label} className="py-3 first:pt-0">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{label}</dt>
                    <dd className="mt-1 text-sm text-slate-300">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 7. ENROLLMENT CTA */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-slate-900/70 to-slate-900/70 p-6">
              <h3 className="text-base font-semibold text-slate-100">Ready to enroll?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Get instant access to <span className="text-orange-300 font-medium">{course.title}</span> and start learning at your own pace.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Price</p>
                  <p className="text-lg font-extrabold text-slate-100">${price.toFixed(2)}</p>
                </div>
                {isEnrolled ? (
                  <Link
                    href={`/my-courses/${documentId}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/10 transition hover:brightness-110"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110 disabled:opacity-70"
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-400 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Back to all courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
