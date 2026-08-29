"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardUrl, normalizeRole } from "@/config/dashboardNavigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
];

function getRoleBadge(role) {
  const normalized = role;
  switch (normalized) {
    case "admin-pannel":
    case "admin":
      return { label: "Admin", style: "bg-rose-50 text-rose-700 border-rose-200" };
    case "content-manager":
      return { label: "Content Mgr", style: "bg-amber-50 text-amber-700 border-amber-200" };
    case "instructor":
      return { label: "Instructor", style: "bg-blue-50 text-blue-700 border-blue-200" };
    case "student":
    default:
      return { label: "Student", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const role = normalizeRole(user?.role);
  const roleBadge = getRoleBadge(role);
  const dashboardUrl = getDashboardUrl(user?.role);
  const avatarUrl = user?.image?.url;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-sm shadow-orange-500/20">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-slate-900">
            Learn<span className="text-orange-400">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
                  active
                    ? "text-indigo-600 font-semibold bg-indigo-50/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={role === "student" ? "/my-courses" : dashboardUrl}
                className={`inline-flex items-center justify-center rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                  (role === "student" ? pathname.startsWith("/my-courses") : pathname.startsWith("/dashboard"))
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                {role === "student" ? "My Courses" : "Dashboard"}
              </Link>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-2 pr-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={user?.username || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.username?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-slate-900 max-w-[110px] truncate">
                    {user?.username}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleBadge.style}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  href={role === "student" ? "/my-courses" : dashboardUrl}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2.5 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
                >
                  {role === "student" ? "My Courses" : "Dashboard"}
                  <span className="text-[10px] uppercase tracking-wider text-orange-400">{role}</span>
                </Link>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 overflow-hidden">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${roleBadge.style}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
