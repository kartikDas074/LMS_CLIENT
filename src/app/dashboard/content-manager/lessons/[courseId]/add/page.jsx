import LessonForm from "@/components/dashboard/LessonForm";

export default async function AddLessonPage({ params }) {
  const { courseId } = await params;
  return <LessonForm role="content-manager" courseId={courseId} />;
}
