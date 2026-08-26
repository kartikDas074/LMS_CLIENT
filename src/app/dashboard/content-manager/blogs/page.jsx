import ManagementPage from "@/components/dashboard/ManagementPage";
import { blogs } from "@/data/dashboardMockData";
export default function ContentBlogsPage() { return <ManagementPage role="content-manager" kind="blogs" title="Blog Management" description="Manage articles, categories, and publication readiness." rows={blogs} action="Create article" />; }
