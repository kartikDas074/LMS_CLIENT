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
        setPreview(getBlogImageUrl(blog.image));
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
    setPreview(URL.createObjectURL(file));
    setError("");
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
        await updateBlog(documentId, form, existingImageId, image, existingBlog);
        setSuccess("Blog updated successfully.");
      } else {
        const currentUser = await fetchCurrentUser();
        console.log("[blogs] Resolved current user", {
          user: currentUser,
          id: currentUser?.id,
          documentId: currentUser?.documentId,
        });

        if (!currentUser?.id) {
          throw new Error("Unable to identify current Strapi user. Please sign in again.");
        }

        await createBlog(form, image, currentUser);
        setForm(initial);
        setImage(null);
        setPreview("");
        setSuccess("Blog saved as a draft successfully.");
      }
    } catch (saveError) {
      console.error("[blogs] Save failed", saveError);
      setError(saveError.message || `Failed to ${documentId ? "update" : "create"} blog.`);
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

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Editorial studio"
        title={documentId ? "Edit Blog" : "Add Blog"}
        description="Create thoughtful learning content with a structured publishing workflow."
      />
      <Card className="p-5 sm:p-8">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-300">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={change}
              className={inputClass}
              placeholder="Learning React in 2026"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Description / Body *</label>
            <p className="mt-1 text-xs text-slate-500">Each paragraph is saved as a Strapi Blocks paragraph.</p>
            <textarea
              name="body"
              value={form.body}
              onChange={change}
              rows={14}
              className={`${inputClass} resize-y`}
              placeholder="Write the article body. Use a new line for each paragraph."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Cover Image</label>
            <div className="mt-2 grid gap-4 sm:grid-cols-[180px_1fr]">
              {preview ? (
                <img src={preview} alt="Blog cover preview" className="aspect-video w-full rounded-xl border border-slate-800 object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-700 text-orange-400">
                  <Icon name="edit" />
                </div>
              )}
              <div className="flex flex-col justify-center gap-3">
                <input id="blog-image" type="file" accept="image/*" onChange={chooseImage} className="sr-only" />
                <label
                  htmlFor="blog-image"
                  className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300"
                >
                  <Icon name="plus" size={15} />
                  {documentId ? "Replace image" : "Choose image"}
                </label>
                <p className="text-xs text-slate-500">
                  {documentId
                    ? "The current image remains unless you replace it."
                    : "Optional image uploaded through the existing Cloudinary setup."}
                </p>
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
              href={documentId ? `/blogs/${documentId}` : `/dashboard/${role}/blogs`}
              className="inline-flex justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
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
