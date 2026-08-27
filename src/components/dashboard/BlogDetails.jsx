"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, StatusBadge } from "@/components/ui/DashboardUI";
import { getBlog, getBlogImageUrl } from "@/services/strapi/blogs";

const author = (blog) => blog.creator?.username || blog.creator?.email || "Unknown author";
const date = (value) => value ? new Date(value).toLocaleDateString() : "Not specified";

export default function BlogDetails({ documentId }) {
  const [blog, setBlog] = useState(null); const [state, setState] = useState("loading");
  useEffect(() => { getBlog(documentId).then((response) => { setBlog(response?.data || response); setState("ready"); }).catch((error) => { console.error("[blogs] Failed to load blog", error); setState("error"); }); }, [documentId]);
  if (state === "loading") return <div className="mx-auto max-w-3xl animate-pulse space-y-6"><div className="h-64 rounded-2xl bg-slate-900" /><div className="h-96 rounded-2xl bg-slate-900" /></div>;
  if (state === "error" || !blog) return <EmptyState title="Blog unavailable" description="This article could not be loaded from the LMS." />;
  const image = getBlogImageUrl(blog.image); const blocks = Array.isArray(blog.Description) ? blog.Description : [];
  return <article className="mx-auto w-full max-w-4xl space-y-7"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/blogs" className="text-sm font-semibold text-slate-400 hover:text-orange-300">← Back to Blogs</Link><Link href={`/blogs/${documentId}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"><Icon name="edit" size={15} />Edit</Link></div><Card className="overflow-hidden"><div className="relative h-64 bg-slate-950 sm:h-96">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-orange-400"><Icon name="edit" size={48} /></div>}</div><div className="p-6 sm:p-10"><div className="flex flex-wrap items-center gap-3"><StatusBadge status={blog.publishedAt ? "Published" : "Draft"} /><span className="text-xs text-slate-500">By {author(blog)}</span><span className="text-xs text-slate-600">Updated {date(blog.updatedAt)}</span></div><h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">{blog.title || "Untitled blog"}</h1><p className="mt-3 text-xs text-slate-500">{blog.publishedAt ? `Published ${date(blog.publishedAt)}` : "DRAFT · This article is not publicly published"}</p><div className="mt-9 space-y-5 text-base leading-8 text-slate-300">{blocks.map((block, index) => <p key={index}>{(block.children || []).map((child) => child.text || "").join("")}</p>)}</div></div></Card></article>;
  }
