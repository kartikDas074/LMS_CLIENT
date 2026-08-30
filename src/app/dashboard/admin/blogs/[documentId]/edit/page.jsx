import BlogForm from "@/components/dashboard/BlogForm";

export default async function EditAdminBlogPage({ params }) {
  const { documentId } = await params;
  return <BlogForm role="admin" documentId={documentId} />;
}
