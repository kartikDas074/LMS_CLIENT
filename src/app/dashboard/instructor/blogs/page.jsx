import ManagementPage from "@/components/dashboard/ManagementPage";
import { blogs } from "@/data/dashboardMockData";
export default function InstructorBlogsPage() { return <ManagementPage role="instructor" kind="blogs" title="Blog Management" description="Share your expertise with the learning community." rows={blogs} action="Create article" />; }
