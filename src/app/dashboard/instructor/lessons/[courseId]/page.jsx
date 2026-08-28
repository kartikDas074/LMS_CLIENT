import LessonManagementWorkspace from "@/components/dashboard/LessonManagementWorkspace";

export default async function InstructorLessonCoursePage({ params }) {
  const { courseId } = await params;
  return <LessonManagementWorkspace role="instructor" courseId={courseId} />;
}
