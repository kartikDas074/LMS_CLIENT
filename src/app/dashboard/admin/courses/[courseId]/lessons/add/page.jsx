import AddLessonForm from "@/components/dashboard/AddLessonForm";

export default async function AddAdminLessonPage({ params }) {
  const { courseId } = await params;
  return <AddLessonForm role="admin" courseId={courseId} />;
}
