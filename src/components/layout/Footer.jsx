import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Description */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span>
                Learn<span className="text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              An enterprise-grade Learning Management System designed to empower
              students, educators, and organizations with world-class courses,
              interactive assessments, and industry-recognized certifications.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Next.js & Strapi Ready
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                Cloudinary Powered
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 transition hover:text-indigo-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-slate-400 transition hover:text-indigo-400"
                >
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 transition hover:text-indigo-400"
                >
                  Blog & Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication & Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Authentication
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 transition hover:text-indigo-400"
                >
                  Login to Account
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-slate-400 transition hover:text-indigo-400"
                >
                  Create New Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} LearnHub LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-slate-400 transition cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-slate-400 transition cursor-pointer">
              Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
