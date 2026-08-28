"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, EmptyState, PageHeader, SearchInput } from "@/components/ui/DashboardUI";
import { getCourses, getCourseImageUrl } from "@/services/strapi/courses";
import { getQuizzes } from "@/services/strapi/quizzes";
import Icon from "@/components/dashboard/Icon";

export default function CourseSelector({ role, managementType = "lessons" }) {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      setError("");
      try {
        const response = await getCourses({ page: 1, pageSize: 100 });
        const courseList = response?.data || [];

        if (active) {
          setCourses(courseList);

          // Fetch counts for each course
          if (managementType === "lessons") {
            // Lesson counts come from course details
            const newCounts = {};
            courseList.forEach((course) => {
              newCounts[course.documentId || course.id] = 0; // Will be populated via getLessonsForCourse
            });
            setCounts(newCounts);
          } else if (managementType === "quizzes") {
            // Quiz counts
            const quizzesResponse = await getQuizzes({ search: "" });
            const allQuizzes = quizzesResponse?.data || [];
            const newCounts = {};
            courseList.forEach((course) => {
              newCounts[course.documentId || course.id] = allQuizzes.filter(
                (quiz) => (quiz.courseId?.documentId || quiz.courseId?.id) === (course.documentId || course.id)
              ).length;
            });
            setCounts(newCounts);
          }

          setState("ready");
        }
      } catch (loadError) {
        console.error("[courses] Failed to load courses", loadError);
        if (active) {
          setError("Unable to load courses.");
          setState("error");
        }
      }
    }

    load();
    return () => { active = false; };
  }, [managementType]);

  const filteredCourses = courses.filter(
    (course) => course.title.toLowerCase().includes(query.toLowerCase())
  );

  const title = managementType === "lessons" ? "Lesson Management" : "Quiz Management";
  const description = managementType === "lessons" 
    ? "Select a course to manage its lessons." 
    : "Select a course to manage its quizzes.";

  if (state === "loading") {
    return (
      <div className="space-y-7">
        <PageHeader eyebrow={role === "instructor" ? "My workspace" : "Content operations"} title={title} description={description} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-40 w-full rounded bg-slate-800" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (state === "error" || filteredCourses.length === 0) {
    return (
      <div className="space-y-7">
        <PageHeader eyebrow={role === "instructor" ? "My workspace" : "Content operations"} title={title} description={description} />
        <EmptyState title={state === "error" ? "Unable to load courses" : "No courses found"} description={error || "No courses are available."} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow={role === "instructor" ? "My workspace" : "Content operations"} title={title} description={description} />

      <div className="w-full sm:max-w-md">
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const courseId = course.documentId || course.id;
          const itemCount = counts[courseId] || 0;
          const itemLabel = managementType === "lessons" ? "Lessons" : "Quizzes";

          return (
            <Link
              key={courseId}
              href={`/dashboard/${role}/${managementType}/${courseId}`}
              className="group"
            >
              <Card className="overflow-hidden transition-all hover:border-orange-500/40">
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  {getCourseImageUrl(course.thumbnail) ? (
                    <img
                      src={getCourseImageUrl(course.thumbnail)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-orange-400">
                      <Icon name="book" size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-200 group-hover:text-orange-300">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    {itemCount} {itemLabel.toLowerCase()}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      {course.level || "All levels"}
                    </span>
                    <div className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300">
                      Select <Icon name="arrow-right" size={12} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
