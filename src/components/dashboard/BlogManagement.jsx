"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/dashboard/Icon";
import { useAuth } from "@/context/AuthContext";
import { Card, EmptyState, PageHeader, SearchInput, StatusBadge } from "@/components/ui/DashboardUI";
import { deleteBlog, getBlogImageUrl, getBlogs, publishBlog, unpublishBlog } from "@/services/strapi/blogs";

const PAGE_SIZE = 10;
const authorName = (blog) => blog.creator?.username || blog.creator?.email || "Unknown author";
const blogId = (blog) => blog.documentId || blog.id;
const date = (value) => (value ? new Date(value).toLocaleDateString() : "Not specified");

export default function BlogManagement({ role = "admin" }) {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageCount: 1, total: 0 });
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUserId = Number(user?.id);

  const canManageBlog = (blog) => {
    const ownerId = Number(blog.creator?.id || blog.creator || 0);
    if (role === "admin") return true;
    if (role === "content-manager") return !ownerId || ownerId === currentUserId;
    return false;
  };

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const response = await getBlogs({ page, pageSize: PAGE_SIZE, search, status: filter });
      setBlogs(response?.data || []);
      setPagination(response?.meta?.pagination || { pageCount: 1, total: 0 });
      setState("ready");
    } catch (loadError) {
      console.error("[blogs] Failed to load", loadError);
      setError("Unable to load blogs. Please try again.");
      setState("error");
    }
  }, [page, search, filter]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await load();
    })();
    return () => { active = false; };
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function togglePublication(blog) {
    const targetId = blogId(blog);
    const isCurrentlyPublished = Boolean(blog.publishedAt);
    setProcessingId(targetId);
    setError("");
    setSuccess("");

    try {
      if (isCurrentlyPublished) {
        await unpublishBlog(targetId);
        setSuccess(`"${blog.title}" has been unpublished and moved back to Draft.`);
      } else {
        await publishBlog(targetId);
        setSuccess(`"${blog.title}" has been published and is now live on the public blog.`);
      }
      await load();
    } catch (actionError) {
      console.error("[blogs] Publication status toggle failed", actionError);
      setError(actionError.message || `Unable to ${isCurrentlyPublished ? "unpublish" : "publish"} blog post.`);
    } finally {
      setProcessingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const targetId = blogId(deleteTarget);
    setProcessingId(targetId);
    setError("");
    setSuccess("");

    try {
      await deleteBlog(targetId);
      setSuccess(`"${deleteTarget.title}" was permanently deleted.`);
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      console.error("[blogs] Delete failed", deleteError);
      setError(deleteError.message || "Unable to delete this blog post.");
    } finally {
      setProcessingId(null);
    }
  }

  const from = pagination.total ? ((pagination.page || page) - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(pagination.total || 0, (pagination.page || page) * PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Content operations"
        title="Blog Management"
        description="Manage LMS blog posts, draft statuses, and publication workflow."
        action={
          <Link
            href={`/dashboard/${role}/blogs/create`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:brightness-110"
          >
            <Icon name="plus" size={16} />
            Create Blog
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blog titles..." />
        </div>

        <select
          value={filter}
          onChange={(event) => { setFilter(event.target.value); setPage(1); }}
          className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-orange-500/50"
        >
          <option value="all">All statuses</option>
          <option value="published">Published only</option>
          <option value="draft">Draft only</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {state === "loading" ? (
        <Card className="animate-pulse p-8 space-y-4">
          <div className="h-6 w-1/3 rounded bg-slate-800" />
          <div className="h-16 rounded bg-slate-800" />
          <div className="h-16 rounded bg-slate-800" />
        </Card>
      ) : state === "error" ? (
        <Card className="p-12 text-center">
          <p className="font-semibold text-red-200">Unable to load blogs.</p>
          <button type="button" onClick={load} className="mt-4 rounded-xl border border-orange-500/30 px-4 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10">
            Retry
          </button>
        </Card>
      ) : blogs.length === 0 ? (
        <EmptyState title="No blogs found" description="Create a new blog post to get started." />
      ) : (
        <Card className="overflow-hidden">
          {/* Table Header */}
          <div className="hidden border-b border-slate-800 bg-slate-950/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:grid lg:grid-cols-[90px_minmax(0,2fr)_140px_120px_160px_220px] lg:items-center">
            <span>Cover</span>
            <span>Title</span>
            <span>Author</span>
            <span>Status</span>
            <span>Dates</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-800/70">
            {blogs.map((blog) => {
              const currentId = blogId(blog);
              const isPublished = Boolean(blog.publishedAt);
              const canManage = canManageBlog(blog);
              const isBusy = processingId === currentId;

              return (
                <div key={currentId} className="grid gap-4 px-5 py-5 lg:grid-cols-[90px_minmax(0,2fr)_140px_120px_160px_220px] lg:items-center">
                  <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                    {getBlogImageUrl(blog.image) ? (
                      <img src={getBlogImageUrl(blog.image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600">
                        <Icon name="edit" size={20} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={isPublished ? `/blog/${blog.slug || currentId}` : `/dashboard/${role}/blogs/${currentId}/edit`}
                      className="line-clamp-2 text-sm font-semibold text-slate-200 hover:text-orange-300 transition-colors"
                    >
                      {blog.title || "Untitled blog"}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{blog.slug ? `/blog/${blog.slug}` : ""}</p>
                  </div>

                  <div className="text-xs text-slate-300">
                    <p className="truncate font-medium">{authorName(blog)}</p>
                  </div>

                  <div>
                    <StatusBadge status={isPublished ? "Published" : "Draft"} />
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p><span className="text-slate-600">Created:</span> {date(blog.createdAt)}</p>
                    <p><span className="text-slate-600">Updated:</span> {date(blog.updatedAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {canManage ? (
                      <>
                        <Link
                          href={`/dashboard/${role}/blogs/${currentId}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
                        >
                          Edit
                        </Link>

                        {isPublished ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => togglePublication(blog)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isBusy ? "Unpublishing..." : "Unpublish"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => togglePublication(blog)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isBusy ? "Publishing..." : "Publish"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setDeleteTarget(blog)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-xs italic text-slate-500">Read only</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {from}–{to} of {pagination.total || 0} blogs</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= (pagination.pageCount || 1)}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Confirm Deletion</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteTarget.title}&quot;</strong>?
            </p>
            <p className="text-xs text-slate-400">
              This action cannot be undone and will remove the blog post completely.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {processingId === blogId(deleteTarget) ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

