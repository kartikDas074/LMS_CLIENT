export const ROLE_LABELS = {
  admin: "Administrator",
  "content-manager": "Content Manager",
  instructor: "Instructor",
  student: "Student",
};

const icon = (name) => name;

export const dashboardNavigation = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: icon("grid") },
    { label: "User Management", href: "/dashboard/admin/users", icon: icon("users") },
    { label: "Course Management", href: "/dashboard/admin/courses", icon: icon("book") },
    { label: "Add Course", href: "/dashboard/admin/courses/create", icon: icon("plus") },
    { label: "Lesson Management", href: "/dashboard/admin/lessons", icon: icon("play") },
    { label: "Quiz Management", href: "/dashboard/admin/quizzes", icon: icon("clipboard") },
    { label: "Create Quiz", href: "/dashboard/admin/quizzes/create", icon: icon("plus") },
    { label: "Blog Management", href: "/dashboard/admin/blogs", icon: icon("edit") },
  ],
  "content-manager": [
    { label: "Course Management", href: "/dashboard/content-manager/courses", icon: icon("book") },
    { label: "Add Course", href: "/dashboard/content-manager/courses/create", icon: icon("plus") },
    { label: "Lesson Management", href: "/dashboard/content-manager/lessons", icon: icon("play") },
    { label: "Quiz Management", href: "/dashboard/content-manager/quizzes", icon: icon("clipboard") },
    { label: "Create Quiz", href: "/dashboard/content-manager/quizzes/create", icon: icon("plus") },
    { label: "Blog Management", href: "/dashboard/content-manager/blogs", icon: icon("edit") },
  ],
  instructor: [
    { label: "Course Management", href: "/dashboard/instructor/courses", icon: icon("book"), note: "My Courses" },
    { label: "Add Course", href: "/dashboard/instructor/courses/create", icon: icon("plus") },
    { label: "Lesson Management", href: "/dashboard/instructor/lessons", icon: icon("play"), note: "My Lessons" },
    { label: "Quiz Management", href: "/dashboard/instructor/quizzes", icon: icon("clipboard"), note: "My Quizzes" },
    { label: "Create Quiz", href: "/dashboard/instructor/quizzes/create", icon: icon("plus") },
    { label: "Blog Management", href: "/dashboard/instructor/blogs", icon: icon("edit") },
  ],
  student: [
    { label: "My Courses", href: "/dashboard/student/courses", icon: icon("book") },
    { label: "My Progress", href: "/dashboard/student/progress", icon: icon("chart") },
    { label: "Profile", href: "/dashboard/student/profile", icon: icon("user") },
  ],
};

export function getNavigationForRole(role) {
  return dashboardNavigation[role] || dashboardNavigation.student;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "LMS User";
}

export function normalizeRole(role) {
  const value = typeof role === "object" ? role?.type || role?.name : role;
  const normalized = String(value || "student").trim().toLowerCase();

  if (normalized === "admin" || normalized === "admin-panel" || normalized === "admin-pannel") {
    return "admin";
  }
  if (normalized === "content manager" || normalized === "content-manager") {
    return "content-manager";
  }
  if (normalized === "instructor") {
    return "instructor";
  }
  return "student";
}

export function getDashboardUrl(role) {
  return `/dashboard/${normalizeRole(role)}`;
}
