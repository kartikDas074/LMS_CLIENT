import CourseLearning from "@/components/dashboard/CourseLearning";
export default async function CoursePage({ params }) { const { courseId } = await params; return <CourseLearning courseId={courseId} />; }
