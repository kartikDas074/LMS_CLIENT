export const dashboardStats = {
  admin: [
    ["Total Users", "12,840", "+12.4%", "users"],
    ["Total Courses", "486", "+8.2%", "book"],
    ["Total Lessons", "3,920", "+14.6%", "play"],
    ["Total Quizzes", "1,284", "+6.8%", "clipboard"],
  ],
  "content-manager": [
    ["Total Courses", "486", "+8.2%", "book"],
    ["Total Lessons", "3,920", "+14.6%", "play"],
    ["Total Quizzes", "1,284", "+6.8%", "clipboard"],
    ["Published Content", "4,912", "+11.2%", "chart"],
  ],
  instructor: [
    ["My Courses", "18", "+3 this month", "book"],
    ["My Students", "2,840", "+18.5%", "users"],
    ["My Lessons", "164", "+12.1%", "play"],
    ["My Quizzes", "42", "+4 this month", "clipboard"],
  ],
  student: [
    ["Enrolled Courses", "8", "+2 this month", "book"],
    ["Overall Progress", "68%", "+8.4%", "chart"],
    ["Completed Lessons", "74", "+12 this month", "check"],
    ["Completed Courses", "3", "Keep going", "check"],
  ],
};

export const courses = [
  { id: "nextjs-mastery", title: "Next.js Mastery", description: "Build production-grade applications with modern Next.js.", instructor: "Sarah Jenkins", category: "Web Development", level: "Intermediate", status: "Published", price: "$79.99", progress: 72, image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=700&auto=format&fit=crop&q=80" },
  { id: "ml-foundations", title: "Machine Learning Foundations", description: "Learn practical machine learning from first principles.", instructor: "Alex Rivera", category: "AI & Data Science", level: "Advanced", status: "Published", price: "$89.99", progress: 48, image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&auto=format&fit=crop&q=80" },
  { id: "design-systems", title: "Design Systems in Practice", description: "Create scalable, accessible systems for digital products.", instructor: "Elena Rostova", category: "Design", level: "Beginner", status: "Draft", price: "$69.99", progress: 24, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&auto=format&fit=crop&q=80" },
  { id: "cloud-architecture", title: "Cloud Architecture & DevOps", description: "Ship reliable cloud infrastructure with confidence.", instructor: "Marcus Vance", category: "Cloud & DevOps", level: "Advanced", status: "Published", price: "$94.99", progress: 86, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=80" },
];

export const users = [
  { title: "Aisha Khan", subtitle: "aisha.khan@example.com", meta: "Student", status: "Active" },
  { title: "Marcus Vance", subtitle: "marcus.vance@example.com", meta: "Instructor", status: "Active" },
  { title: "Elena Rostova", subtitle: "elena.rostova@example.com", meta: "Content Manager", status: "Active" },
  { title: "Jordan Lee", subtitle: "jordan.lee@example.com", meta: "Student", status: "Pending" },
];

export const lessons = [
  { title: "Routing and layouts", subtitle: "Next.js Mastery", meta: "Lesson 12 · 28 min", status: "Published" },
  { title: "Server actions", subtitle: "Next.js Mastery", meta: "Lesson 13 · 34 min", status: "Published" },
  { title: "Model evaluation", subtitle: "Machine Learning Foundations", meta: "Lesson 8 · 42 min", status: "Draft" },
];

export const quizzes = [
  { title: "App Router assessment", subtitle: "Next.js Mastery · Routing and layouts", meta: "12 questions", status: "Published" },
  { title: "Neural networks checkpoint", subtitle: "Machine Learning Foundations", meta: "18 questions", status: "Published" },
  { title: "Design tokens review", subtitle: "Design Systems in Practice", meta: "10 questions", status: "Draft" },
];

export const blogs = [
  { title: "The future of full-stack learning", subtitle: "Marcus Vance · Engineering", meta: "Aug 24, 2026", status: "Published" },
  { title: "Building accessible course experiences", subtitle: "Elena Rostova · Design & UX", meta: "Aug 15, 2026", status: "Published" },
  { title: "From tutorials to real projects", subtitle: "Sarah Jenkins · Career Advice", meta: "Aug 10, 2026", status: "Draft" },
];

export const lessonsForCourse = [
  { title: "Welcome to the course", duration: "08:24", completed: true },
  { title: "App Router fundamentals", duration: "24:10", completed: true },
  { title: "Layouts and loading states", duration: "31:45", completed: false, current: true },
  { title: "Data fetching patterns", duration: "28:12", completed: false },
  { title: "Ship your application", duration: "19:08", completed: false },
];
