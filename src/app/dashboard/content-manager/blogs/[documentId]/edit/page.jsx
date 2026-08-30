import BlogForm from "@/components/dashboard/BlogForm";

export default async function EditContentManagerBlogPage({ params }) {
  const { documentId } = await params;
  return <BlogForm role="content-manager" documentId={documentId} />;
}
