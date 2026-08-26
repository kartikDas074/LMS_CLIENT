import ManagementPage from "@/components/dashboard/ManagementPage";
import { blogs } from "@/data/dashboardMockData";
export default function AdminBlogsPage() { return <ManagementPage role="admin" kind="blogs" title="Blog Management" description="Shape the editorial voice of your learning community." rows={blogs} action="Create article" />; }
