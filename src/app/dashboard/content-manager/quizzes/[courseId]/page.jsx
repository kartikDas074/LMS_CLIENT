import QuizManagementWorkspace from "@/components/dashboard/QuizManagementWorkspace";

export default async function ContentManagerQuizCoursePage({ params }) {
  const { courseId } = await params;
  return <QuizManagementWorkspace role="content-manager" courseId={courseId} />;
}
