import ManagementPage from "@/components/dashboard/ManagementPage";
import { quizzes } from "@/data/dashboardMockData";
export default function AdminQuizzesPage() { return <ManagementPage role="admin" kind="quizzes" title="Quiz Management" description="Monitor assessments and keep knowledge checks organized." rows={quizzes} action="Create quiz" />; }
