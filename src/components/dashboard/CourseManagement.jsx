"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, PageHeader, SearchInput, StatusBadge } from "@/components/ui/DashboardUI";
import { deleteCourse, getCourseImageUrl, getCourses } from "@/services/strapi/courses";

const PAGE_SIZE = 10;

function SkeletonRows() {
  return <Card className="overflow-hidden"><div className="divide-y divide-slate-800/70">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex animate-pulse gap-4 px-5 py-5"><div className="h-16 w-24 rounded-xl bg-slate-800" /><div className="flex-1 space-y-3"><div className="h-4 w-2/3 rounded bg-slate-800" /><div className="h-3 w-full rounded bg-slate-800/80" /><div className="h-3 w-1/3 rounded bg-slate-800/80" /></div></div>)}</div></Card>;
}

function courseId(course) {
  return course.documentId || course.id;
}

export default function CourseManagement({ role = "admin" }) {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageCount: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const canManage = role === "admin" || role === "content-manager";

  const loadCourses = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await getCourses({ page, pageSize: PAGE_SIZE, search });
      setCourses(response?.data || []);
      setPagination(response?.meta?.pagination || { page, pageCount: 1, total: 0 });
      setStatus("ready");
    } catch (loadError) {
      console.error("[courses] Failed to load courses", loadError);
      setError("Unable to load courses. Please try again.");
      setStatus("error");
    }
  }, [page, search]);

  // The effect synchronizes the list with the remote Strapi collection.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCourses(); }, [loadCourses]);
  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(1); setSearch(query); }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  function submitSearch(event) { event.preventDefault(); setPage(1); setSearch(query); }

  async function handleDelete(course) {
    if (!window.confirm(`Delete Course?\n\nAre you sure you want to permanently delete "${course.title}"?\n\nThis action cannot be undone.`)) return;
    setDeleting(courseId(course));
    try {
      await deleteCourse(courseId(course));
      await loadCourses();
    } catch (deleteError) {
      console.error("[courses] Failed to delete course", deleteError);
      setError("Unable to delete this course. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * (pagination.pageSize || PAGE_SIZE) + 1;
  const to = Math.min(pagination.total || 0, (pagination.page || page) * (pagination.pageSize || PAGE_SIZE));

  return <div className="space-y-7">
    <PageHeader eyebrow={role === "instructor" ? "My workspace" : "Content operations"} title={role === "instructor" ? "My Courses" : "Course Management"} description="Manage course information, instructors, learning topics, and publishing status." action={<Link href={`/dashboard/${role}/courses/create`} className="inline-flex items-center gap-2"><Icon name="plus" size={16} />Add Course</Link>} />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><form onSubmit={submitSearch} className="w-full sm:max-w-md"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses by title..." /></form><p className="text-xs text-slate-500">{pagination.total || 0} courses</p></div>
    {status === "loading" ? <SkeletonRows /> : status === "error" ? <Card className="px-6 py-14 text-center"><p className="text-sm font-semibold text-red-200">Unable to load courses.</p><p className="mt-2 text-xs text-slate-500">Please try again.</p><button type="button" onClick={loadCourses} className="mt-5 rounded-xl border border-orange-500/30 px-4 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10">Retry</button></Card> : courses.length === 0 ? <EmptyState title="No courses found" description="Start building your LMS by creating your first course." /> : <>
      <Card className="overflow-hidden"><div className="hidden grid-cols-[minmax(0,1.5fr)_110px_100px_100px_290px] gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 lg:grid"><span>Course</span><span>Level</span><span>Duration</span><span>Status</span><span className="text-right">Actions</span></div><div className="divide-y divide-slate-800/70">{courses.map((course) => <div key={courseId(course)} className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.5fr)_110px_100px_100px_290px] lg:items-center"><div className="flex min-w-0 gap-3"><div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">{getCourseImageUrl(course.thumbnail) ? <img src={getCourseImageUrl(course.thumbnail)} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-orange-400"><Icon name="book" /></div>}</div><div className="min-w-0"><Link href={`/courses/${courseId(course)}`} className="line-clamp-2 text-sm font-semibold text-slate-200 hover:text-orange-300">{course.title}</Link><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{course.shortDescription}</p><p className="mt-1 text-xs text-slate-600">{Array.isArray(course.topic) ? course.topic.length : 0} topics · {Array.isArray(course.skills) ? course.skills.length : 0} skills · ${Number(course.price || 0).toFixed(2)}</p></div></div><span className="text-xs text-slate-400">{course.level || "-"}</span><span className="text-xs text-slate-400">{course.duration ? `${course.duration} min` : "-"}</span><StatusBadge status={course.publishedAt ? "Published" : "Draft"} /><div className="flex flex-wrap items-center justify-start gap-1.5 lg:justify-end"><Link href={`/courses/${courseId(course)}`} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-orange-300">View</Link><Link href={`/courses/${courseId(course)}/edit`} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-orange-300">Edit</Link>{canManage && <button type="button" onClick={() => handleDelete(course)} disabled={deleting === courseId(course)} className="rounded-lg px-2 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40" aria-label={`Delete ${course.title}`}>Delete</button>}</div></div>)}</div></Card>
      <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {from}–{to} of {pagination.total || 0} courses</span><div className="flex items-center gap-1"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-800 px-3 py-2 disabled:opacity-30">Previous</button>{Array.from({ length: pagination.pageCount || 1 }, (_, index) => index + 1).slice(0, 7).map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`h-8 min-w-8 rounded-lg border px-2 ${number === page ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-slate-800 hover:border-orange-500/40"}`}>{number}</button>)}<button type="button" disabled={page >= (pagination.pageCount || 1)} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-800 px-3 py-2 disabled:opacity-30">Next</button></div></div>
    </>}
  </div>;
}