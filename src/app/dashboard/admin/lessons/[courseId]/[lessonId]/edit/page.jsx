import LessonForm from "@/components/dashboard/LessonForm";

export default async function EditLessonPage({ params }) {
  const { courseId, lessonId } = await params;
  return <LessonForm role="admin" courseId={courseId} lessonId={lessonId} />;
}
