"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourses } from "@/services/strapi/courses";
import { getCourseStudentProgress } from "@/services/strapi/studentProgress";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";

const ROLE_ALLOWED = new Set(["admin", "content-manager", "instructor"]);

function formatQuizSummary(quizSummary = []) {
  if (!Array.isArray(quizSummary) || quizSummary.length === 0) {
    return "No quizzes attempted";
  }

  return quizSummary
    .map((quiz) => `${quiz.title}: ${quiz.result}/${quiz.totalMarks} (${quiz.percentage}%)`)
    .join(" • ");
}

export default function StudentProgressViewer({ role = "admin" }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, role: authRole } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseReport, setCourseReport] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [error, setError] = useState("");

  const actualRole = role || authRole;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/dashboard/${actualRole}/student-progress`);
      return;
    }

    if (!ROLE_ALLOWED.has(actualRole)) {
      router.push("/dashboard/student");
      return;
    }
  }, [actualRole, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || authLoading || !ROLE_ALLOWED.has(actualRole)) return;

    let isMounted = true;

    async function loadCourses() {
      try {
        setIsLoadingCourses(true);
        setError("");

        const response = await getCourses({ page: 1, pageSize: 200, search: "" });
        if (!isMounted) return;

        const list = response?.data || [];
        setCourses(list);

        if (!selectedCourseId && list.length > 0) {
          setSelectedCourseId(String(list[0].documentId || list[0].id));
        }
      } catch (loadError) {
        if (!isMounted) return;
        const message = loadError?.status === 401
          ? "You need to log in first."
          : loadError?.status === 403
            ? "You do not have permission to view student progress."
            : "Unable to load courses right now.";
        setError(message);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [actualRole, authLoading, isAuthenticated, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setCourseReport(null);
      return;
    }

    let isMounted = true;

    async function loadProgress() {
      try {
        setIsLoadingProgress(true);
        setError("");

        const response = await getCourseStudentProgress(selectedCourseId);
        if (!isMounted) return;

        setCourseReport(response || { course: null, students: [] });
      } catch (loadError) {
        if (!isMounted) return;

        const status = loadError?.status || loadError?.response?.status;
        if (status === 401) {
          setError("You need to log in first.");
        } else if (status === 403) {
          setError("You do not have permission to view this course's progress.");
        } else if (status === 404) {
          setError("Course not found.");
        } else {
          setError("Unable to load student progress for the selected course.");
        }
        setCourseReport(null);
      } finally {
        if (isMounted) setIsLoadingProgress(false);
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.documentId || course.id) === String(selectedCourseId)) || null,
    [courses, selectedCourseId],
  );

  const canRenderPage = !authLoading && isAuthenticated && ROLE_ALLOWED.has(actualRole);

  if (!canRenderPage) {
    return <div className="space-y-7"><PageHeader eyebrow="Access" title="Checking access" description="Verifying your dashboard permissions." /></div>;
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Learning analytics"
        title="Student Progress"
        description="View enrolled students and their lesson and quiz performance for each course."
      />

      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Select Course</p>
            <label className="block">
              <span className="sr-only">Select course</span>
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                disabled={isLoadingCourses || courses.length === 0}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-orange-500/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {!courses.length ? (
                  <option value="">No courses available</option>
                ) : (
                  <>
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.documentId || course.id} value={String(course.documentId || course.id)}>
                        {course.title}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
          </div>

          {selectedCourse && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Course</div>
              <div className="mt-1 font-semibold text-white">{selectedCourse.title}</div>
            </div>
          )}
        </div>
      </Card>

      {error ? (
        <Card className="px-6 py-10 text-center">
          <p className="text-sm font-semibold text-red-200">{error}</p>
        </Card>
      ) : null}

      {!selectedCourseId && !isLoadingCourses ? (
        <EmptyState title="Select a course to view student progress." description="Choose a course from the selector above to see enrolled students and their learning progress." />
      ) : null}

      {isLoadingCourses || isLoadingProgress ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-40 rounded bg-slate-800" />
            <div className="h-12 rounded bg-slate-800" />
            <div className="h-12 rounded bg-slate-800" />
            <div className="h-12 rounded bg-slate-800" />
          </div>
        </Card>
      ) : null}

      {!isLoadingProgress && !error && selectedCourseId && courseReport && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Enrolled Students</p>
              <p className="mt-3 text-3xl font-bold text-white">{courseReport.course?.enrolledStudents ?? 0}</p>
            </Card>
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Course Lessons</p>
              <p className="mt-3 text-3xl font-bold text-white">{courseReport.course?.totalLessons ?? 0}</p>
            </Card>
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Course</p>
              <p className="mt-3 text-lg font-semibold text-white line-clamp-2">{courseReport.course?.title || selectedCourse?.title || "Selected Course"}</p>
            </Card>
          </div>

          {courseReport.students.length === 0 ? (
            <EmptyState title="No students are enrolled in this course yet." description="As soon as a learner enrolls, their lesson and quiz progress will appear here." />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-950/70 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Lessons</th>
                      <th className="px-4 py-3">Quiz</th>
                      <th className="px-4 py-3">Overall Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {courseReport.students.map((student) => (
                      <tr key={student.id} className="align-top text-slate-200">
                        <td className="px-4 py-4 font-semibold text-white">{student.name}</td>
                        <td className="px-4 py-4 text-slate-300">{student.email}</td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-100">{student.completedLessons} / {student.totalLessons} lessons</div>
                          <div className="mt-2 text-xs text-slate-400">{student.lessonPercent}%</div>
                          <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${Math.max(0, Math.min(100, student.lessonPercent))}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {formatQuizSummary(student.quizSummary)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-100">{student.lessonPercent}%</div>
                          <div className="mt-2 text-xs text-slate-400">{student.completedLessons} completed</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
