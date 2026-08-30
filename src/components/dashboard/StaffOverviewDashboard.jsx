"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/public/CourseCard";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";
import { useAuth } from "@/context/AuthContext";
import { getCourses, getLessonsForCourse } from "@/services/strapi/courses";
import { getUserCount } from "@/services/strapi/users";

const ROLE_COPY = {
  admin: {
    eyebrow: "Platform overview",
    description: "Manage your LMS platform and monitor your courses, lessons, and users.",
    sectionTitle: "Featured courses",
    courseLimit: 3,
  },
  "content-manager": {
    eyebrow: "Content workspace",
    description: "Manage courses and learning content from your dashboard.",
    sectionTitle: "Courses",
    courseLimit: 4,
  },
  instructor: {
    eyebrow: "Instructor overview",
    description: "Manage your courses and track your learning content.",
    sectionTitle: "My courses",
    courseLimit: 4,
  },
};

function getUserName(user) {
  return user?.firstName || user?.lastName
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : user?.username || user?.email?.split("@")[0] || "there";
}

function getCourseId(course) {
  return course.documentId || course.id;
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
        <Icon name={icon} size={17} />
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="animate-pulse space-y-3 border-b border-slate-800/80 pb-7">
        <div className="h-3 w-32 rounded bg-slate-800" />
        <div className="h-8 w-72 rounded bg-slate-800" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-800/80" />
      </div>
      <p className="text-sm text-slate-400">Loading dashboard...</p>
    </div>
  );
}

export default function StaffOverviewDashboard({ role }) {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState("loading");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;

    async function loadDashboard() {
      setStatus("loading");
      try {
        const coursesResponse = await getCourses({ page: 1, pageSize: 100 });
        let courses = coursesResponse?.data || [];

        if (role === "instructor") {
          const userId = String(user.id);
          courses = courses.filter((course) => String(course.instructor?.id) === userId);
        }

        const lessonCounts = await Promise.all(
          courses.map(async (course) => {
            const response = await getLessonsForCourse(getCourseId(course));
            return response?.data?.length || 0;
          })
        );
        const totalLessons = lessonCounts.reduce((total, count) => total + count, 0);
        const totalUsers = role === "admin" ? await getUserCount() : null;

        if (!active) return;
        setDashboard({ courses, totalLessons, totalUsers });
        setStatus("ready");
      } catch (error) {
        console.error("[dashboard] Failed to load staff dashboard", error);
        if (active) setStatus("error");
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [authLoading, role, user]);

  if (authLoading || status === "loading") return <DashboardSkeleton />;

  const copy = ROLE_COPY[role] || ROLE_COPY.admin;
  const displayName = getUserName(user);

  if (status === "error") {
    return (
      <Card className="px-6 py-14 text-center">
        <p className="text-sm font-semibold text-red-200">Unable to load dashboard data. Please try again.</p>
      </Card>
    );
  }

  const courses = dashboard?.courses || [];
  const stats = role === "admin"
    ? [
        ["Total Users", dashboard.totalUsers, "users"],
        ["Total Courses", courses.length, "book"],
        ["Total Lessons", dashboard.totalLessons, "play"],
      ]
    : [
        ["Total Courses", courses.length, "book"],
        ["Total Lessons", dashboard.totalLessons, "play"],
      ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={`Welcome back, ${displayName} 👋`}
        description={copy.description}
      />
      <div className={`grid gap-3 ${role === "admin" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        {stats.map(([label, value, icon]) => <StatCard key={label} label={label} value={value} icon={icon} />)}
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-200">{copy.sectionTitle}</h2>
        </div>
        {courses.length === 0 ? (
          <EmptyState
            title={role === "instructor" ? "No courses yet." : "No courses available."}
            description={role === "instructor" ? "Start creating your first course to see it here." : "No courses are available yet."}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, copy.courseLimit).map((course) => <CourseCard key={getCourseId(course)} course={course} />)}
          </div>
        )}
      </section>
    </div>
  );
}
