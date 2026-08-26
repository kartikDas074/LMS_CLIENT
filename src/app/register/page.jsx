import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create your LearnHub account",
  description: "Join LearnHub LMS to start learning, instructing, and exploring world-class courses.",
};

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0d1117]">
      <RegisterForm />
    </div>
  );
}
