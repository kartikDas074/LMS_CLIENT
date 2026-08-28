"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/DashboardUI";
import { getCourse } from "@/services/strapi/courses";
import { createLesson } from "@/services/strapi/lessons";
import { fetchCurrentUser } from "@/lib/auth";
import { getStoredToken } from "@/lib/auth";

const instructorName = (instructor) => instructor?.username || instructor?.email || "Not specified";

export default function AddLessonForm({ role, courseId }) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [state, setState] = useState("loading");
  const [form, setForm] = useState({ title: "", description: "", lessonOrder: "", duration: "" });
  const [video, setVideo] = useState(null);
  const [videoMode, setVideoMode] = useState("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [courseResponse, currentUser] = await Promise.all([
          getCourse(courseId),
          fetchCurrentUser(getStoredToken()).catch(() => null),
        ]);
        const loadedCourse = courseResponse?.data || courseResponse;
        if (!loadedCourse?.documentId && !loadedCourse?.id) throw new Error("Course not found.");
        if (role === "instructor" && String(loadedCourse.instructor?.id) !== String(currentUser?.id)) {
          throw new Error("You are not authorized to add lessons to this course.");
        }
        if (active) { setCourse(loadedCourse); setState("ready"); }
      } catch (error) {
        console.error("[lessons] Failed to load course", error);
        if (active) { setSubmitError(error.message || "Unable to load this course."); setState("error"); }
      }
    }
    load();
    return () => { active = false; };
  }, [courseId, role]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Lesson title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (form.lessonOrder === "") nextErrors.lessonOrder = "Lesson order is required.";
    else if (!Number.isInteger(Number(form.lessonOrder)) || Number(form.lessonOrder) <= 0) nextErrors.lessonOrder = "Lesson order must be a positive whole number.";
    if (form.duration === "") nextErrors.duration = "Duration is required.";
    else if (!Number.isFinite(Number(form.duration)) || Number(form.duration) <= 0) nextErrors.duration = "Duration must be greater than 0.";
    if (videoMode === "file" && video && !video.type.startsWith("video/")) nextErrors.video = "Please select a valid video file.";
    if (videoMode === "url" && videoUrl.trim()) {
      try {
        const parsedUrl = new URL(videoUrl.trim());
        if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error();
      } catch { nextErrors.video = "Enter a valid video URL beginning with http:// or https://."; }
    }
    if (!course) nextErrors.course = "Course not found.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createLesson({ ...form, courseId: course.documentId || course.id, videoFile: videoMode === "file" ? video : null, videoUrl: videoMode === "url" ? videoUrl.trim() : "" });
      router.push(`/courses/${course.documentId || course.id}`);
    } catch (error) {
      console.error("[lessons] Failed to create lesson", error);
      setSubmitError(error.message || "Unable to create lesson. Please try again.");
      setIsSubmitting(false);
    }
  }

  const backHref = `/dashboard/${role}/courses`;
  if (state === "loading") return <Card className="mx-auto max-w-3xl animate-pulse p-8"><div className="h-6 w-1/3 rounded bg-slate-800" /><div className="mt-6 h-40 rounded-xl bg-slate-800/70" /></Card>;
  if (state === "error") return <Card className="mx-auto max-w-3xl p-8"><p role="alert" className="text-sm text-red-300">{submitError}</p><Link href={backHref} className="mt-5 inline-flex text-sm font-semibold text-orange-300">Back to courses</Link></Card>;

  return <div className="mx-auto max-w-3xl space-y-7">
    <PageHeader eyebrow="Course content" title="Add Lesson" description="Create a lesson for the selected course and attach its video content." />
    <Card className="p-5 sm:p-7"><h2 className="text-sm font-semibold uppercase tracking-wider text-orange-300">Course Information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-3"><div><dt className="text-xs text-slate-500">Course</dt><dd className="mt-1 text-sm font-semibold text-white">{course.title}</dd></div><div><dt className="text-xs text-slate-500">Instructor</dt><dd className="mt-1 text-sm text-slate-300">{instructorName(course.instructor)}</dd></div><div><dt className="text-xs text-slate-500">Level</dt><dd className="mt-1 text-sm text-slate-300">{course.level || "Not specified"}</dd></div></dl></Card>
    <Card className="p-5 sm:p-7"><form onSubmit={submit} className="space-y-5" noValidate>
      <Field label="Lesson Title" name="title" value={form.title} onChange={updateField} error={errors.title} placeholder="Introduction to MERN Stack" required />
      <Field label="Description" name="description" value={form.description} onChange={updateField} error={errors.description} placeholder="Describe what students will learn in this lesson." required textarea />
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Lesson Order" name="lessonOrder" type="number" min="1" step="1" value={form.lessonOrder} onChange={updateField} error={errors.lessonOrder} placeholder="1" required /><Field label="Duration (minutes)" name="duration" type="number" min="1" step="1" value={form.duration} onChange={updateField} error={errors.duration} placeholder="20" required /></div>
      <div><div className="flex items-center justify-between gap-3"><label className="text-xs font-semibold text-slate-300">Video <span className="font-normal text-slate-500">(optional)</span></label><div className="flex rounded-lg border border-slate-800 bg-slate-950/60 p-1"><button type="button" onClick={() => { setVideoMode("file"); setVideoUrl(""); setErrors((current) => ({ ...current, video: "" })); }} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${videoMode === "file" ? "bg-orange-500/15 text-orange-300" : "text-slate-500 hover:text-slate-300"}`}>Choose file</button><button type="button" onClick={() => { setVideoMode("url"); setVideo(null); setErrors((current) => ({ ...current, video: "" })); }} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${videoMode === "url" ? "bg-orange-500/15 text-orange-300" : "text-slate-500 hover:text-slate-300"}`}>Video URL</button></div></div>{videoMode === "file" ? <><input id="lesson-video" type="file" accept="video/*" onChange={(event) => { setVideo(event.target.files?.[0] || null); setErrors((current) => ({ ...current, video: "" })); }} className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-orange-300" />{video && <p className="mt-2 text-xs text-slate-500">Selected: {video.name}</p>}</> : <input id="lesson-video-url" type="url" value={videoUrl} onChange={(event) => { setVideoUrl(event.target.value); setErrors((current) => ({ ...current, video: "" })); }} placeholder="https://example.com/lesson-video.mp4" className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-500/60" />}{errors.video && <p className="mt-2 text-xs text-red-300">{errors.video}</p>}</div>
      {submitError && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{submitError}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end"><Link href={backHref} className="inline-flex justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500">Cancel</Link><button type="submit" disabled={isSubmitting} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Creating Lesson..." : "Add Lesson"}</button></div>
    </form></Card>
  </div>;
}

function Field({ label, name, value, onChange, error, textarea, ...props }) {
  const Input = textarea ? "textarea" : "input";
  return <div><label htmlFor={`lesson-${name}`} className="text-xs font-semibold text-slate-300">{label} {props.required && <span className="text-orange-400">*</span>}</label><Input id={`lesson-${name}`} name={name} value={value} onChange={onChange} className={`mt-2 w-full rounded-xl border bg-slate-950/70 px-3 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-500/60 ${textarea ? "min-h-32 resize-y" : ""} ${error ? "border-red-400/60" : "border-slate-800"}`} {...props} />{error && <p className="mt-2 text-xs text-red-300">{error}</p>}</div>;
}
