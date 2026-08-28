"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, StatusBadge } from "@/components/ui/DashboardUI";
import { deleteCourse, getCourse, getCourseImageUrl, getLessonsForCourse } from "@/services/strapi/courses";

const list = (value) => Array.isArray(value) ? value : [];
const instructorName = (value) => value?.username || value?.email || "Not specified";
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "Not specified";

export default function CourseDetails({ documentId }) {
  const [course, setCourse] = useState(null);
  const [state, setState] = useState("loading");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonsError, setLessonsError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getCourse(documentId)
      .then((response) => { setCourse(response?.data || response); setState("ready"); })
      .catch((error) => { console.error("[courses] Failed to load course", error); setState("error"); });
  }, [documentId]);

  useEffect(() => {
    getLessonsForCourse(documentId)
      .then((response) => setLessons(response?.data || []))
      .catch((error) => { console.error("[lessons] Failed to load course lessons", error); setLessonsError("Unable to load lessons."); });
  }, [documentId]);

  if (state === "loading") return <div className="animate-pulse space-y-6"><div className="h-72 rounded-2xl bg-slate-900" /><div className="h-40 rounded-2xl bg-slate-900" /></div>;
  if (state === "error" || !course) return <EmptyState title="Course unavailable" description="This course could not be loaded from the LMS." />;

  const image = getCourseImageUrl(course.thumbnail);
  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) return;
    setIsDeleting(true);
    setDeleteError("");
    try { await deleteCourse(documentId); router.push("/courses"); }
    catch (error) { console.error("[courses] Failed to delete course", error); setDeleteError(error.message || "Unable to delete this course. Please try again."); setIsDeleting(false); }
  }

  return <div className="space-y-7">
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="relative min-h-[280px] overflow-hidden bg-slate-950">
        {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" /> : <div className="absolute inset-0 flex items-center justify-center text-orange-400"><Icon name="book" size={52} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
        <div className="relative flex min-h-[280px] flex-col justify-end gap-5 p-6 sm:p-9">
          <StatusBadge status={course.publishedAt ? "Published" : "Draft"} />
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{course.level || "Course"}</p><h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{course.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{course.shortDescription}</p></div>
          <div className="flex flex-wrap gap-2"><Link href={`/courses/${documentId}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"><Icon name="edit" size={15} />Edit Course</Link><Link href={`/courses/${documentId}/lessons/new`} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-orange-500/50 hover:text-orange-300"><Icon name="plus" size={15} />Add Lesson</Link><button type="button" onClick={handleDelete} disabled={isDeleting} className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"><Icon name="trash" size={15} />{isDeleting ? "Deleting..." : "Delete Course"}</button></div>
          {deleteError && <p role="alert" className="text-sm text-red-300">{deleteError}</p>}
        </div>
      </div>
    </section>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
      <div className="space-y-6"><Card className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Lessons</h2><Link href={`/courses/${documentId}/lessons/new`} className="inline-flex items-center gap-2 rounded-xl border border-orange-500/25 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10"><Icon name="plus" size={14} />Add Lesson</Link></div>{lessonsError ? <p className="mt-4 text-sm text-red-300">{lessonsError}</p> : lessons.length === 0 ? <p className="mt-4 text-sm text-slate-500">No lessons have been added yet.</p> : <ol className="mt-5 divide-y divide-slate-800">{lessons.map((lesson) => <li key={lesson.documentId || lesson.id} className="flex items-center gap-3 py-3 first:pt-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-orange-300">{String(lesson.lessonOrder).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{lesson.title}</p><p className="text-xs text-slate-500">{lesson.duration ? `${lesson.duration} minutes` : "Duration not specified"}</p></div></li>)}</ol>}</Card><Card className="p-6"><h2 className="text-lg font-semibold text-white">Course Overview</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-400">{course.description}</p></Card><Card className="p-6"><h2 className="text-lg font-semibold text-white">What you&apos;ll learn</h2><div className="mt-4 flex flex-wrap gap-2">{list(course.skills).map((skill) => <span key={skill} className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-200">{skill}</span>)}</div></Card><Card className="p-6"><h2 className="text-lg font-semibold text-white">Course Topics</h2><ol className="mt-4 space-y-3">{list(course.topic).map((topic, index) => <li key={topic} className="flex gap-3 text-sm text-slate-300"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs text-orange-300">{index + 1}</span>{topic}</li>)}</ol></Card></div>
      <Card className="h-fit p-6"><h2 className="text-lg font-semibold text-white">Course Information</h2><dl className="mt-5 divide-y divide-slate-800">{[["Level", course.level], ["Duration", course.duration ? `${course.duration} minutes` : "Not specified"], ["Price", `$${Number(course.price || 0).toFixed(2)}`], ["Instructor", instructorName(course.instructor)], ["Created", formatDate(course.createdAt)], ["Updated", formatDate(course.updatedAt)], ["Extra support", course.extraSupport || "Not specified"]].map(([label, value]) => <div key={label} className="py-3 first:pt-0"><dt className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{label}</dt><dd className="mt-1 text-sm text-slate-300">{value}</dd></div>)}</dl></Card>
    </div>
  </div>;
}
