"use client";

import Link from "next/link";
import { getCourseImageUrl } from "@/services/strapi/courses";

const LEVEL_COLORS = {
  Beginner: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Advanced: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function CourseCard({ course }) {
  const image = getCourseImageUrl(course.thumbnail);
  const instructor =
    course.instructor?.username || course.instructor?.firstName || null;
  const level = course.level || "Course";
  const levelClass =
    LEVEL_COLORS[level] || "bg-slate-500/10 text-slate-300 border-slate-500/20";
  const price = Number(course.price || 0);
  const topics = Array.isArray(course.topic)
    ? course.topic.filter(Boolean)
    : [];
  const skills = Array.isArray(course.skills)
    ? course.skills.filter(Boolean)
    : [];

  const MAX_TOPIC_PILLS = 3;
  const remainingTopics = Math.max(0, topics.length - MAX_TOPIC_PILLS);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10">
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={course.title || "Course thumbnail"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-orange-400/50">
            <svg
              className="h-14 w-14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 16.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        {/* Level badge */}
        <div
          className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm border ${levelClass}`}
        >
          {level}
        </div>
        {/* Duration badge */}
        {course.duration != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-sm border border-slate-700/60">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {course.duration} min
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-slate-100 group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {course.shortDescription || "No description provided."}
        </p>

        {/* Instructor */}
        {instructor && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[9px] font-bold text-orange-300">
              {instructor.charAt(0).toUpperCase()}
            </span>
            <span className="text-slate-400">{instructor}</span>
          </div>
        )}

        {/* Topic pills */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, MAX_TOPIC_PILLS).map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/50"
              >
                {topic}
              </span>
            ))}
            {remainingTopics > 0 && (
              <span className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-700/40">
                +{remainingTopics} more
              </span>
            )}
          </div>
        )}

        {/* Skill pills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-orange-500/15 bg-orange-500/5 px-2 py-0.5 text-[10px] font-medium text-orange-300/80"
              >
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="self-center text-[10px] text-slate-500">
                +{skills.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Price + View Details */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              Price
            </span>
            <span className="text-base font-bold text-slate-100">
              ${price.toFixed(2)}
            </span>
          </div>
          <Link
            href={`/courses/${course.documentId}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-orange-500/10 transition hover:brightness-110"
          >
            View Details
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
