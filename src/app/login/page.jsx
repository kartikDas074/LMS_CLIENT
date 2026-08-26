import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in to LearnHub",
  description: "Sign in to your LearnHub account to access your courses and learning dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0d1117]">
      <LoginForm />
    </div>
  );
}
