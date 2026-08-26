"use client";

import { useState } from "react";
import Link from "next/link";

const COURSES = [
  {
    id: 1,
    title: "Full-Stack Web Architecture with Next.js 16 & React 19",
    category: "Web Development",
    instructor: "Sarah Jenkins",
    rating: 4.9,
    reviews: 1420,
    students: "12,400",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80",
    price: "$79.99",
    lessons: 48,
    hours: "32.5 hrs",
  },
  {
    id: 2,
    title: "Practical Machine Learning & Deep Neural Networks",
    category: "AI & Data Science",
    instructor: "Dr. Alex Rivera",
    rating: 4.8,
    reviews: 980,
    students: "8,120",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80",
    price: "$89.99",
    lessons: 56,
    hours: "44.0 hrs",
  },
  {
    id: 3,
    title: "Modern UI/UX Design Masterclass with Figma & Design Systems",
    category: "UI/UX Design",
    instructor: "Elena Rostova",
    rating: 4.9,
    reviews: 2150,
    students: "19,300",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80",
    price: "$69.99",
    lessons: 38,
    hours: "22.0 hrs",
  },
  {
    id: 4,
    title: "Enterprise Cloud Architecture & DevOps with Kubernetes",
    category: "Cloud & DevOps",
    instructor: "Marcus Vance",
    rating: 4.7,
    reviews: 630,
    students: "5,450",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    price: "$94.99",
    lessons: 42,
    hours: "28.5 hrs",
  },
  {
    id: 5,
    title: "Cybersecurity Fundamentals & Ethical Hacking Bootcamp",
    category: "Cybersecurity",
    instructor: "David K.",
    rating: 4.8,
    reviews: 1120,
    students: "9,800",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    price: "$84.99",
    lessons: 60,
    hours: "40.0 hrs",
  },
  {
    id: 6,
    title: "Product Strategy & Agile Management for Tech Leaders",
    category: "Management",
    instructor: "Chloe Bennett",
    rating: 4.9,
    reviews: 840,
    students: "6,700",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    price: "$74.99",
    lessons: 30,
    hours: "18.5 hrs",
  },
];

const CATEGORIES = [
  "All Categories",
  "Web Development",
  "AI & Data Science",
  "UI/UX Design",
  "Cloud & DevOps",
  "Cybersecurity",
  "Management",
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const filteredCourses = COURSES.filter((course) => {
    const matchesCategory =
      selectedCategory === "All Categories" ||
      course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Catalog 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Explore All Courses
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-600">
            Learn from verified industry professionals. Select from over 500+ structured courses with real-world coding environments.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, instructor, or title..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category Pills */}
          <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 md:pb-0 text-xs">
            {CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 font-medium transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Count */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredCourses.length} courses</span>
          <span>Updated weekly</span>
        </div>

        {/* Courses Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300 hover:shadow-lg"
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

              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                  <span>★ {course.rating}</span>
                  <span className="text-slate-400 font-normal">({course.reviews})</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-normal">{course.students} students</span>
                </div>

                <h2 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {course.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>📚 {course.lessons} lessons</span>
                  <span>⏱ {course.hours}</span>
                  <span>👤 {course.instructor}</span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Tuition</span>
                    <span className="text-lg font-bold text-slate-900">{course.price}</span>
                  </div>
                  <Link
                    href="/register"
                    className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-xs"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="my-16 text-center space-y-3">
            <p className="text-lg font-semibold text-slate-700">No courses match your filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
