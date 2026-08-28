import LessonView from "@/components/dashboard/LessonView";

export default async function ViewLessonPage({ params }) {
  const { lessonId } = await params;
  return <LessonView role="content-manager" lessonId={lessonId} />;
}
