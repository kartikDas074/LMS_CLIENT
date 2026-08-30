"use client";

import { use } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardNavigation";
import BlogForm from "@/components/dashboard/BlogForm";

export default function GenericEditBlogPage({ params }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  return <BlogForm role={role === "content-manager" ? "content-manager" : "admin"} documentId={resolvedParams?.documentId} />;
}
