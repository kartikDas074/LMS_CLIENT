import AddCourseForm from "@/components/dashboard/AddCourseForm";

export default async function InstructorEditCoursePage({ params }) {
  const { courseId } = await params;
  return <AddCourseForm role="instructor" courseId={courseId} />;
}
