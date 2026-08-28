import QuizForm from "@/components/dashboard/QuizForm";

export default async function EditQuizPage({ params }) {
  const { courseId, quizId } = await params;
  return <QuizForm role="admin" courseId={courseId} quizId={quizId} />;
}
