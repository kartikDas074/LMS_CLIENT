import Link from "next/link";

const STATS = [
  { value: "50,000+", label: "Active Learners" },
  { value: "500+", label: "Expert Courses" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "120+", label: "Global Instructors" },
];

const CATEGORIES = [
  { name: "Web Development", count: "140+ Courses", icon: "💻", color: "from-blue-500/10 to-indigo-500/10 text-blue-600" },
  { name: "AI & Data Science", count: "95+ Courses", icon: "🤖", color: "from-purple-500/10 to-pink-500/10 text-purple-600" },
  { name: "UI/UX Design", count: "72+ Courses", icon: "🎨", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
  { name: "Cloud & DevOps", count: "58+ Courses", icon: "☁️", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
  { name: "Cybersecurity", count: "44+ Courses", icon: "🛡️", color: "from-rose-500/10 to-red-500/10 text-rose-600" },
  { name: "Product Management", count: "38+ Courses", icon: "📊", color: "from-cyan-500/10 to-sky-500/10 text-cyan-600" },
];

const FEATURED_COURSES = [
  {
    id: 1,
    title: "Full-Stack Web Architecture with Next.js & Node",
    category: "Web Development",
    instructor: "Sarah Jenkins",
    rating: "4.9",
    reviews: "1,420",
    students: "12.4k",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80",
    price: "$79.99",
  },
  {
    id: 2,
    title: "Practical Machine Learning & Deep Neural Networks",
    category: "AI & Data Science",
    instructor: "Dr. Alex Rivera",
    rating: "4.8",
    reviews: "980",
    students: "8.1k",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80",
    price: "$89.99",
  },
  {
    id: 3,
    title: "Modern UI/UX Design Masterclass with Figma",
    category: "Design",
    instructor: "Elena Rostova",
    rating: "4.9",
    reviews: "2,150",
    students: "19.3k",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80",
    price: "$69.99",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Empowering 50,000+ Students Worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Master In-Demand Skills with{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              {/* Trust Badges */}
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

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-indigo-600/10">
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

      {/* Stats Counter Section */}
      <section className="border-y border-slate-200/80 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Top Categories</h2>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Explore Popular Subjects
              </p>
            </div>
            <Link
              href="/explore"
              className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Browse All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={idx}
                href="/explore"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-2xl`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Featured Courses</h2>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Start Learning from Top Rated Programs
              </p>
            </div>
            <Link
              href="/explore"
              className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              View All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:shadow-lg hover:border-slate-300"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-xs">
                    {course.category}
                  </div>
                  <div className="absolute top-3 right-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                    {course.level}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-2">
                    <span>★ {course.rating}</span>
                    <span className="text-slate-400 font-normal">({course.reviews})</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-slate-500 font-normal">{course.students} students</span>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500">Instructor: <span className="font-medium text-slate-700">{course.instructor}</span></p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">{course.price}</span>
                    <Link
                      href="/explore"
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto max-w-2xl text-indigo-100 text-sm sm:text-base">
            Create an account today to get unlimited access to curated courses, interactive labs, and career support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-md transition hover:bg-indigo-50"
            >
              Sign Up for Free
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto rounded-xl border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Curriculum
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
