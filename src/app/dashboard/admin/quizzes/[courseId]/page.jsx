import QuizManagementWorkspace from "@/components/dashboard/QuizManagementWorkspace";

export default async function AdminQuizCoursePage({ params }) {
  const { courseId } = await params;
  return <QuizManagementWorkspace role="admin" courseId={courseId} />;
}
