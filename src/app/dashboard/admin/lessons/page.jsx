import ManagementPage from "@/components/dashboard/ManagementPage";
import { lessons } from "@/data/dashboardMockData";
export default function AdminLessonsPage() { return <ManagementPage role="admin" kind="lessons" title="Lesson Management" description="Organize lesson content, durations, and publication states." rows={lessons} action="Create lesson" />; }
