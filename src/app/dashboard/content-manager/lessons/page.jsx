import ManagementPage from "@/components/dashboard/ManagementPage";
import { lessons } from "@/data/dashboardMockData";
export default function ContentLessonsPage() { return <ManagementPage role="content-manager" kind="lessons" title="Lesson Management" description="Keep lesson content clear, consistent, and ready to publish." rows={lessons} action="Create lesson" />; }
