import QuizManagementWorkspace from "@/components/dashboard/QuizManagementWorkspace";

export default async function InstructorQuizCoursePage({ params }) {
  const { courseId } = await params;
  return <QuizManagementWorkspace role="instructor" courseId={courseId} />;
}
