import QuizForm from "@/components/dashboard/QuizForm";

export default async function AddQuizPage({ params }) {
  const { courseId } = await params;
  return <QuizForm role="instructor" courseId={courseId} />;
}
