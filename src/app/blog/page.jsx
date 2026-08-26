import Link from "next/link";

const POSTS = [
  {
    id: 1,
    title: "The Future of Web Development: Next.js 16, React Compiler, and Beyond",
    category: "Engineering",
    date: "August 24, 2026",
    readTime: "6 min read",
    author: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    excerpt:
      "Explore how upcoming full-stack paradigms, server-side caching, and streaming primitives are transforming modern learning platforms.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "10 Proven Habits of Highly Successful Self-Taught Programmers",
    category: "Career Advice",
    date: "August 20, 2026",
    readTime: "8 min read",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    },
    excerpt:
      "Actionable techniques to stay consistent, avoid tutorial purgatory, build meaningful portfolio projects, and land your first tech role.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Building Accessible UI Systems for Scalable Education Platforms",
    category: "Design & UX",
    date: "August 15, 2026",
    readTime: "5 min read",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    },
    excerpt:
      "A deep dive into WCAG guidelines, semantic HTML tokens, keyboard navigation, and color contrast for online learning tools.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "Getting Started with Large Language Models and Retrieval Augmented Generation",
    category: "AI & ML",
    date: "August 10, 2026",
    readTime: "10 min read",
    author: {
      name: "Dr. Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    excerpt:
      "Understand embeddings, vector databases, and semantic search pipelines to build context-aware AI tutor assistants.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Insights & Guides
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            LearnHub Blog & Articles
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-600">
            Industry trends, engineering guides, instructor interviews, and practical advice to advance your tech career.
          </p>
        </div>

        {/* Featured Article Card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs transition hover:shadow-md lg:grid lg:grid-cols-12">
          <div className="relative h-64 sm:h-80 lg:h-full lg:col-span-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={POSTS[0].image}
              alt={POSTS[0].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              Featured Story
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6 lg:p-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                  {POSTS[0].category}
                </span>
                <span>{POSTS[0].date}</span>
                <span>·</span>
                <span>{POSTS[0].readTime}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors">
                {POSTS[0].title}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {POSTS[0].excerpt}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={POSTS[0].author.avatar}
                  alt={POSTS[0].author.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{POSTS[0].author.name}</p>
                  <p className="text-[11px] text-slate-500">Author & Lead Instructor</p>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                Read Article →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Articles Grid */}
        <div className="mt-14">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
            Latest Publications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {POSTS.slice(1).map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300 hover:shadow-lg"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-xs">
                    {post.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-slate-700 font-medium">{post.author.name}</span>
                    </div>

                    <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
