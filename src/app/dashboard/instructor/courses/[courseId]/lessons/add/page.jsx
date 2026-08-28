import AddLessonForm from "@/components/dashboard/AddLessonForm";

export default async function AddInstructorLessonPage({ params }) {
  const { courseId } = await params;
  return <AddLessonForm role="instructor" courseId={courseId} />;
}
