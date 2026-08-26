import ManagementPage from "@/components/dashboard/ManagementPage";
import { lessons } from "@/data/dashboardMockData";
export default function InstructorLessonsPage() { return <ManagementPage role="instructor" kind="lessons" title="Lesson Management" description="Organize lessons belonging to your courses." rows={lessons} action="Create lesson" />; }
