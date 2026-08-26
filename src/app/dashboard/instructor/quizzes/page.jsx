import ManagementPage from "@/components/dashboard/ManagementPage";
import { quizzes } from "@/data/dashboardMockData";
export default function InstructorQuizzesPage() { return <ManagementPage role="instructor" kind="quizzes" title="Quiz Management" description="Create and monitor assessments for your courses." rows={quizzes} action="Create quiz" />; }
