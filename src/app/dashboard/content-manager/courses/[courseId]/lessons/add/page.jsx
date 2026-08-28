import AddLessonForm from "@/components/dashboard/AddLessonForm";

export default async function AddContentLessonPage({ params }) {
  const { courseId } = await params;
  return <AddLessonForm role="content-manager" courseId={courseId} />;
}
