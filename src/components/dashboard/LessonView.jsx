"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";
import { getLesson } from "@/services/strapi/lessons";
import Icon from "@/components/dashboard/Icon";

const formatVideoUrl = (videourl) => {
  if (!videourl) return null;
  const video = Array.isArray(videourl) ? videourl[0] : videourl;
  if (!video) return null;
  if (typeof video === "string") return video;
  if (video.url) {
    if (/^https?:\/\//i.test(video.url)) return video.url;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api";
    const apiBase = base.replace(/\/api\/?$/, "");
    return `${apiBase}${video.url.startsWith("/") ? "" : "/"}${video.url}`;
  }
  return null;
};

export default function LessonView({ lessonId, role = "admin" }) {
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getLesson(lessonId);
        if (active) {
          setLesson(response?.data || response);
          setState("ready");
        }
      } catch (loadError) {
        console.error("[lessons] Failed to load lesson", loadError);
        if (active) {
          setError(loadError.message || "Unable to load lesson.");
          setState("error");
        }
      }
    }
    load();
    return () => { active = false; };
  }, [lessonId]);

  if (state === "loading") {
    return (
      <Card className="mx-auto max-w-6xl animate-pulse p-8">
        <div className="h-8 w-1/2 rounded bg-slate-800" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="h-96 rounded-xl bg-slate-800/70" />
          <div className="space-y-4">
            <div className="h-6 w-full rounded bg-slate-800" />
            <div className="h-40 w-full rounded bg-slate-800/70" />
          </div>
        </div>
      </Card>
    );
  }

  if (state === "error" || !lesson) {
    return <EmptyState title="Lesson unavailable" description={error || "This lesson could not be loaded."} />;
  }

  const videoUrl = formatVideoUrl(lesson.videourl);
  const courseName = lesson.courseId?.title || "Selected course";

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader 
        eyebrow="Lesson content" 
        title={lesson.title} 
        description={lesson.description}
        action={
          <Link 
            href={`/dashboard/${role}/lessons/${lesson.courseId?.documentId || lesson.courseId?.id}/${lesson.documentId || lesson.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            <Icon name="edit" size={15} />
            Edit Lesson
          </Link>
        }
      />

      <Card className="p-5 sm:p-7">
        <dl className="grid gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Lesson</dt>
            <dd className="mt-1 text-sm font-semibold text-white">
              {String(lesson.lessonOrder || 0).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Course</dt>
            <dd className="mt-1 text-sm text-slate-200">{courseName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Duration</dt>
            <dd className="mt-1 text-sm text-slate-200">
              {lesson.duration ? `${lesson.duration} minutes` : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Lesson ID</dt>
            <dd className="mt-1 text-xs text-slate-400">{lesson.lessonNo || "N/A"}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Video Section - 60% */}
        <Card className="overflow-hidden bg-slate-950/60 p-0">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="h-full w-full bg-black"
              style={{ minHeight: "400px" }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-96 items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="text-center">
                <Icon name="play" size={48} className="mx-auto text-slate-600" />
                <p className="mt-3 text-sm text-slate-500">No video available for this lesson</p>
              </div>
            </div>
          )}
        </Card>

        {/* Description Section - 40% */}
        <Card className="space-y-5 p-5 sm:p-7">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-300">Description</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
              {lesson.description || "No description provided."}
            </p>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Course</h3>
            <p className="mt-3 text-sm text-slate-200">{courseName}</p>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <p className="text-xs text-slate-600">
              Last updated: {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
