import ManagementPage from "@/components/dashboard/ManagementPage";
import { courses } from "@/data/dashboardMockData";
export default function ContentCoursesPage() { return <ManagementPage role="content-manager" kind="courses" title="Course Management" description="Maintain course structure, metadata, and publishing status." rows={courses} action="Create course" />; }
