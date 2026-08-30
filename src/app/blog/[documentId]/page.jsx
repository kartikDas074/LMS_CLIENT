import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/dashboard/Icon";
import { blocksToText, getBlogImageUrl, getPublishedBlog } from "@/services/strapi/blogs";

const date = (value) => (value ? new Date(value).toLocaleDateString() : "Not specified");

export default async function PublicBlogDetailPage({ params }) {
  const { documentId } = await params;

  let blog = null;
  try {
    const response = await getPublishedBlog(documentId);
    blog = response?.data || response;
  } catch {
    notFound();
  }

  if (!blog || !blog.publishedAt) {
    notFound();
  }

  const image = getBlogImageUrl(blog.image);
  const blocks = Array.isArray(blog.Description) ? blog.Description : [];

  return (
    <article className="mx-auto w-full max-w-4xl space-y-7 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-orange-600">
          ← Back to blog
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-64 bg-slate-100 sm:h-96">
          {image ? (
            <img src={image} alt={blog.title || "Blog cover"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-orange-500">
              <Icon name="edit" size={48} />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-orange-700">
              Published
            </span>
            <span>By {blog.creator?.username || "LearnHub author"}</span>
            <span>{date(blog.publishedAt)}</span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {blog.title || "Untitled blog"}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Published {date(blog.publishedAt)}
          </p>

          <div className="mt-9 space-y-5 text-base leading-8 text-slate-700">
            {blocks.length ? (
              blocks.map((block, index) => (
                <p key={`${(block?.children || []).map((child) => child.text || "").join("")}-${index}`}>
                  {(block.children || []).map((child) => child.text || "").join("") || blocksToText(blocks)}
                </p>
              ))
            ) : (
              <p>{blocksToText(blog.Description) || "This article does not contain any visible content yet."}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
