import LessonManagementWorkspace from "@/components/dashboard/LessonManagementWorkspace";

export default async function ContentManagerLessonCoursePage({ params }) {
  const { courseId } = await params;
  return <LessonManagementWorkspace role="content-manager" courseId={courseId} />;
}
