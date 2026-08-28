import QuizForm from "@/components/dashboard/QuizForm";
export default async function EditQuizPage({ params }) { const { quizId } = await params; return <QuizForm role="content-manager" quizId={quizId} />; }
