import QuizView from "@/components/dashboard/QuizView";
export default async function QuizPage({ params }) { const { quizId } = await params; return <QuizView role="instructor" quizId={quizId} />; }
