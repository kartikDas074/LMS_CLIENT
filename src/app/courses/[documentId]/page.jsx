import CourseDetailClient from "@/components/public/CourseDetailClient";

export default async function CourseDetailPage({ params }) {
  const { documentId } = await params;
  return <CourseDetailClient documentId={documentId} />;
}
