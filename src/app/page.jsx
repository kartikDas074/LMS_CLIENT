import Link from "next/link";
import { getCourseImageUrl, getPublicCourses } from "@/services/strapi/courses";

const WHY_CHOOSE_US = [
  {
    title: "Expert Instructors",
    description: "Learn from experienced professionals and subject matter experts who bring practical industry insight into every lesson.",
    icon: "👨‍🏫",
  },
  {
    title: "Structured Learning",
    description: "Follow a clear curriculum designed to build foundational skills before moving into more advanced concepts and practice.",
    icon: "🧭",
  },
  {
    title: "Progress Tracking",
    description: "Stay motivated with visibility into lessons completed, milestones reached, and your learning momentum over time.",
    icon: "📈",
  },
  {
    title: "Quizzes & Assessments",
    description: "Reinforce learning with interactive quizzes and knowledge checks that help you retain and apply what you learn.",
    icon: "✅",
  },
];

const LEARNING_FLOW = [
  "Explore Course",
  "Enroll",
  "Learn Lessons",
  "Complete Quizzes",
  "Track Progress",
  "Complete Course",
];

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function getCourseInstructor(course) {
  return course?.instructor?.username || course?.instructor?.firstName || "Instructor";
}

export default async function HomePage() {
  const response = await getPublicCourses();
  const courses = Array.isArray(response?.data) ? response.data : [];
  const popularCourses = courses.slice(0, 6);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#050816] py-16 sm:py-24 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_60%_35%,rgba(255,107,0,0.12),transparent_48%)] before:pointer-events-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse"></span>
                Empowering 50,000+ Students Worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Master In-Demand Skills with{" "}
                <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                  World-Class Instructors
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 leading-relaxed">
                Unlock career-defining knowledge with structured learning paths,
                practical real-world projects, interactive quizzes, and industry-recognized certifications.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Explore All Courses
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
                >
                  Create Free Account
                </Link>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Self-paced learning
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified certificates
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Direct instructor Q&A
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl border border-orange-500/20 bg-surface-elevated bg-gradient-to-br from-orange-500/20 via-slate-900 to-slate-950 p-6 text-white shadow-xl shadow-orange-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-200">Featured Course</p>
                      <h3 className="text-lg font-bold">Modern Web Engineering 2026</h3>
                    </div>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-xs">
                      Live
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-indigo-200">
                      <span>Course Progress</span>
                      <span className="font-semibold text-white">74%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-900/50">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: "74%" }}></div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs space-y-2">
                    <p className="text-xs font-medium text-indigo-200">Next Upcoming Lesson:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-700 font-bold text-xs">
                        ▶
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-white">Deploying Microservices to Vercel</p>
                        <p className="text-indigo-200">42 min · Chapter 6</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div className="flex -space-x-2">
                      <span className="inline-block h-7 w-7 rounded-full ring-2 ring-indigo-600 bg-indigo-300 text-slate-800 text-[10px] font-bold flex items-center justify-center">JD</span>
                      <span className="inline-block h-7 w-7 rounded-full ring-2 ring-indigo-600 bg-emerald-300 text-slate-800 text-[10px] font-bold flex items-center justify-center">AK</span>
                      <span className="inline-block h-7 w-7 rounded-full ring-2 ring-indigo-600 bg-amber-300 text-slate-800 text-[10px] font-bold flex items-center justify-center">MS</span>
                    </div>
                    <span className="text-indigo-200">+3,400 enrolled this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Popular Courses</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Learn what students are choosing most
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              View All Courses
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {popularCourses.length > 0 ? (
              popularCourses.map((course) => {
                const image = getCourseImageUrl(course.thumbnail);
                const instructor = getCourseInstructor(course);
                const rating = course.rating ?? course.averageRating ?? course.ratings ?? null;

                return (
                  <article
                    key={course.documentId || course.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_35px_rgba(249,115,22,0.12)]"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {image ? (
                        <img src={image} alt={course.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl text-slate-400">📘</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 backdrop-blur-sm">
                        {course.level || "Course"}
                      </div>
                      {course.duration != null && (
                        <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-slate-100 backdrop-blur-sm">
                          {course.duration} min
                        </div>
                      )}
                    </div>

                    <div className="flex h-full flex-col p-5">
                      {rating != null && (
                        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-amber-500">
                          <span>★</span>
                          <span>{Number(rating).toFixed(1)}</span>
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
                        {course.shortDescription || "Explore this engaging learning path and deepen your practical skills."}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500">Instructor</span>
                          <span className="font-medium text-slate-800">{instructor}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500">Level</span>
                          <span className="font-medium text-slate-800">{course.level || "All Levels"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500">Duration</span>
                          <span className="font-medium text-slate-800">{course.duration ? `${course.duration} min` : "Self-paced"}</span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Price</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">{formatPrice(course.price)}</p>
                        </div>
                        <Link
                          href={`/courses/${course.documentId || course.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:brightness-110"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 md:col-span-2 xl:col-span-3">
                No courses are available right now. Please check back soon.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Why Choose Us</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning designed for real-world growth
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WHY_CHOOSE_US.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_35px_rgba(249,115,22,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl shadow-inner shadow-orange-100">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">How It Works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your learning journey, simplified
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-6">
            {LEARNING_FLOW.map((step, index) => (
              <div key={step} className="relative flex items-center gap-3 lg:block">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center lg:flex-1">
                  <p className="text-sm font-semibold text-slate-800">{step}</p>
                </div>
                {index < LEARNING_FLOW.length - 1 && (
                  <div className="hidden lg:block lg:absolute lg:-right-2 lg:top-5 lg:h-px lg:w-4 lg:bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#050816] via-[#0f172a] to-[#111827] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Start Learning?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
            Join our learning platform and build the skills you need for your future.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 sm:w-auto"
            >
              Browse Courses
            </Link>
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-orange-300 hover:bg-slate-800 sm:w-auto"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
