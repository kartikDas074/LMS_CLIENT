import LessonManagementWorkspace from "@/components/dashboard/LessonManagementWorkspace";

export default async function AdminLessonCoursePage({ params }) {
  const { courseId } = await params;
  return <LessonManagementWorkspace role="admin" courseId={courseId} />;
}
