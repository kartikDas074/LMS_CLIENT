"use client";

import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardNavigation";
import BlogManagement from "@/components/dashboard/BlogManagement";

export default function GenericDashboardBlogsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  return <BlogManagement role={role === "content-manager" ? "content-manager" : "admin"} />;
}
