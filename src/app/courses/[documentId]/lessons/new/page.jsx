import AddLessonForm from "@/components/dashboard/AddLessonForm";

export default async function NewLessonPage({ params }) {
	const { documentId } = await params;
	return <AddLessonForm role="admin" courseId={documentId} />;
}