"use client";

import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardNavigation";
import BlogForm from "@/components/dashboard/BlogForm";

export default function GenericCreateBlogPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  return <BlogForm role={role === "content-manager" ? "content-manager" : "admin"} />;
}
