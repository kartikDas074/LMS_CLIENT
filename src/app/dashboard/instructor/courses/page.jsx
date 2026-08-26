import ManagementPage from "@/components/dashboard/ManagementPage";
import { courses } from "@/data/dashboardMockData";
export default function InstructorCoursesPage() { return <ManagementPage role="instructor" kind="courses" title="Course Management" description="Review and improve the courses you own and teach." rows={courses.slice(0, 3)} action="Create course" />; }
