"use client";

import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { Card, PageHeader, StatusBadge } from "@/components/ui/DashboardUI";
import { dashboardStats, courses, users, lessons } from "@/data/dashboardMockData";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getCourses } from "@/services/strapi/courses";
import { getLessonsForCourse } from "@/services/strapi/courses";
import { getQuizzes } from "@/services/strapi/quizzes";

const copy = {
  admin: ["Admin overview", "A clear view of your learning platform operations.", "Recent platform activity"],
  "content-manager": ["Content workspace", "Keep courses, lessons, quizzes, and articles moving forward.", "Content status"],
  instructor: ["Instructor overview", "Track your teaching workspace and the learners you support.", "My recent courses"],
  student: ["Your learning cockpit", "Pick up where you left off and keep your momentum going.", "Continue learning"],
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewDashboard({ role }) {
  const { user } = useAuth();
  const [eyebrow, description, sectionTitle] = copy[role] || copy.student;
  const defaultStats = dashboardStats[role] || [];
  const isStudent = role === "student";
  const displayName = user?.username || user?.email?.split("@")[0] || "there";
  const greeting = getGreeting();
  const [instructorStats, setInstructorStats] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch instructor-specific stats
  useEffect(() => {
    if (role !== "instructor") return;
    let active = true;
    setStatsLoading(true);

    async function loadInstructorStats() {
      try {
        const currentUser = user;
        if (!currentUser?.id) return;

        const coursesResponse = await getCourses({ page: 1, pageSize: 100 });
        const myCourses = coursesResponse?.data || [];

        if (!active) return;

        setInstructorCourses(myCourses.slice(0, 4));

        // Count lessons and quizzes across all instructor courses
        let totalLessons = 0;
        let totalQuizzes = 0;

        for (const course of myCourses) {
          const courseId = course.documentId || course.id;
          try {
            const lessonsResponse = await getLessonsForCourse(courseId);
            totalLessons += lessonsResponse?.data?.length || 0;
          } catch { /* ignore */ }
          try {
            const quizzesResponse = await getQuizzes({ courseId });
            totalQuizzes += quizzesResponse?.data?.length || 0;
          } catch { /* ignore */ }
        }

        if (active) {
          setInstructorStats([
            ["Total Courses", String(myCourses.length), "", "book"],
            ["Total Lessons", String(totalLessons), "", "play"],
            ["Total Quizzes", String(totalQuizzes), "", "clipboard"],
            ["Published", String(myCourses.filter((c) => c.publishedAt).length), "", "check"],
          ]);
        }
      } catch (err) {
        console.error("[instructor] Failed to load stats", err);
      } finally {
        if (active) setStatsLoading(false);
      }
    }

    loadInstructorStats();
    return () => { active = false; };
  }, [role, user]);

  const stats = role === "instructor" && instructorStats ? instructorStats : defaultStats;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={`${greeting}, ${displayName}`}
        description={description}
        action={role === "admin" ? "Add user" : role === "student" ? undefined : "Create content"}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(([label, value, change, icon]) => (
          <Card key={label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Icon name={icon} size={17} />
              </div>
              <span className="text-[10px] font-semibold text-emerald-400">{change}</span>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">{sectionTitle}</h2>
            <Link
              href={isStudent ? "/dashboard/student/courses" : `/dashboard/${role}/courses`}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300"
            >
              View all <Icon name="arrow" size={13} className="ml-1 inline" />
            </Link>
          </div>
          {isStudent ? (
            <div className="space-y-4 p-5">
              {courses.slice(0, 3).map((course) => (
                <Link href={`/dashboard/student/courses/${course.id}`} key={course.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-800/50">
                  <img src={course.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-200">{course.title}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-orange-300">{course.progress}%</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {(role === "instructor" ? instructorCourses : role === "admin" ? users : courses).slice(0, 4).map((item) => (
                <div key={item.documentId || item.id || item.title || item.name} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.title || item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.shortDescription || item.subtitle || item.instructor || item.category}</p>
                  </div>
                  <StatusBadge status={item.publishedAt ? "Published" : item.status || "Draft"} />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent activity</h2>
          </div>
          <div className="space-y-5 p-5">
            {(isStudent ? lessons : users).slice(0, 4).map((item, index) => (
              <div key={item.title || item.name} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(255,107,0,0.45)]" />
                <div>
                  <p className="text-xs leading-5 text-slate-300">
                    {isStudent ? `You completed ${item.title}` : `${item.title || item.name} was updated`}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600">{index + 1} hour{index === 0 ? "" : "s"} ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
