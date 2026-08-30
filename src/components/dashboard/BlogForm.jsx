"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCurrentUser } from "@/lib/auth";
import Icon from "@/components/dashboard/Icon";
import { Card, PageHeader } from "@/components/ui/DashboardUI";
import { blocksToText, createBlog, getBlog, getBlogImageUrl, updateBlog } from "@/services/strapi/blogs";

const initial = { title: "", body: "" };
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10";

export default function BlogForm({ role = "admin", documentId }) {
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [existingBlog, setExistingBlog] = useState(null);
  const [existingImageId, setExistingImageId] = useState(null);
  const [loading, setLoading] = useState(Boolean(documentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!documentId) return;
    getBlog(documentId)
      .then((response) => {
        const blog = response?.data || response;
        setExistingBlog(blog);
        setForm({
          title: blog.title || "",
          body: blocksToText(blog.Description),
        });
        const media = Array.isArray(blog.image) ? blog.image[0] : blog.image;
        setExistingImageId(media?.id || null);
        const resolvedUrl = getBlogImageUrl(blog.image);
        setPreview(resolvedUrl);
      })
      .catch((loadError) => {
        console.error("[blogs] Failed to load blog for editing", loadError);
        setError(loadError.message || "Unable to load this blog.");
      })
      .finally(() => setLoading(false));
  }, [documentId]);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImageUrl("");
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function handleImageUrlChange(event) {
    const value = event.target.value;
    setImageUrl(value);
    if (value.trim()) {
      setImage(null);
      setPreview(value.trim());
    } else if (existingBlog) {
      setPreview(getBlogImageUrl(existingBlog.image));
    } else {
      setPreview("");
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (documentId) {
        await updateBlog(documentId, form, existingImageId, image, existingBlog, imageUrl);
        setSuccess("Blog updated successfully. Note: Publication status is unchanged.");
      } else {
        const currentUser = await fetchCurrentUser();
        if (!currentUser?.id) {
          throw new Error("Unable to identify current logged-in user. Please sign in again.");
        }

        await createBlog(form, image, currentUser, imageUrl);
        setForm(initial);
        setImage(null);
        setImageUrl("");
        setPreview("");
        setSuccess("Blog post created as DRAFT. Publish it from the dashboard when ready.");
      }
    } catch (saveError) {
      console.error("[blogs] Save failed", saveError);
      setError(saveError.message || `Failed to ${documentId ? "update" : "create"} blog post.`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-24 rounded-2xl bg-slate-900" />
        <div className="h-[620px] rounded-2xl bg-slate-900" />
      </div>
    );
  }

  const isPublished = Boolean(existingBlog?.publishedAt);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Editorial studio"
        title={documentId ? "Edit Blog Post" : "Create Blog Post"}
        description="Write and configure your LMS blog post. New posts are saved as Draft by default."
      />
      <Card className="p-5 sm:p-8">
        <form onSubmit={submit} className="space-y-6">
          {/* Status Indicator Banner */}
          <div className={`rounded-2xl border p-4 ${isPublished ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Status</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {documentId ? (isPublished ? "Published (Live on website)" : "Draft (Private)") : "Draft by default"}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                isPublished
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {documentId
                ? "Saving changes updates content without changing publication status. Use the Publish / Unpublish button on the dashboard to change visibility."
                : "Creating a blog post saves it as Draft. It will NOT appear on the public website until explicitly published from the dashboard."}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={change}
              className={inputClass}
              placeholder="e.g. Learning React in 2026"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Body / Content *</label>
            <p className="mt-1 text-xs text-slate-500">Paragraphs are formatted automatically for article presentation.</p>
            <textarea
              name="body"
              value={form.body}
              onChange={change}
              rows={12}
              className={`${inputClass} resize-y`}
              placeholder="Write article content here. Use line breaks to separate paragraphs."
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Cover Image</label>
            <div className="mt-2 grid gap-4 sm:grid-cols-[200px_1fr]">
              {preview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950 text-slate-600">
                  <Icon name="edit" size={24} />
                </div>
              )}

              <div className="flex flex-col justify-center gap-3">
                <input id="blog-image-file" type="file" accept="image/*" onChange={chooseImage} className="sr-only" />
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="blog-image-file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300"
                  >
                    <Icon name="plus" size={15} />
                    {documentId ? "Upload Replacement Image" : "Choose File"}
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Or Provide Image URL</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-between">
            <Link
              href={`/dashboard/${role}/blogs`}
              className="inline-flex justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving..." : documentId ? "Save Changes" : "Save Draft"}
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

