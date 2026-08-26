import ManagementPage from "@/components/dashboard/ManagementPage";
import { courses } from "@/data/dashboardMockData";
export default function AdminCoursesPage() { return <ManagementPage role="admin" kind="courses" title="Course Management" description="Review the complete course catalog and publishing status." rows={courses} action="Create course" />; }
