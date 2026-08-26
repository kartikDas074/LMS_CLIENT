import ManagementPage from "@/components/dashboard/ManagementPage";
import { quizzes } from "@/data/dashboardMockData";
export default function ContentQuizzesPage() { return <ManagementPage role="content-manager" kind="quizzes" title="Quiz Management" description="Build a reliable assessment layer for every learning path." rows={quizzes} action="Create quiz" />; }
