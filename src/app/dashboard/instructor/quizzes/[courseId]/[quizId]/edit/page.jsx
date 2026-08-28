import QuizForm from "@/components/dashboard/QuizForm";

export default async function EditQuizPage({ params }) {
  const { courseId, quizId } = await params;
  return <QuizForm role="instructor" courseId={courseId} quizId={quizId} />;
}
