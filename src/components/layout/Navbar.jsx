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
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-[#050816]/90 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
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
          <span>
            Learn<span className="text-orange-400">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-orange-500/10 text-orange-300 shadow-sm shadow-orange-500/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={role === "student" ? "/my-courses" : dashboardUrl}
                className={`inline-flex items-center justify-center rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                  (role === "student" ? pathname.startsWith("/my-courses") : pathname.startsWith("/dashboard"))
                    ? "border-orange-400/40 bg-orange-500/10 text-orange-200"
                    : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-orange-400/40 hover:text-white"
                }`}
              >
                {role === "student" ? "My Courses" : "Dashboard"}
              </Link>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/70 py-1.5 pl-2 pr-3 shadow-sm shadow-slate-950/40">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-600 bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
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
                  <span className="max-w-[110px] truncate text-xs font-semibold text-white">
                    {user?.username}
                  </span>
                  <span
                    className={`inline-block rounded border px-1.5 py-0.2 text-[10px] font-medium ${roleBadge.style}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400/40 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:brightness-110"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
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

      {isMobileMenuOpen && (
        <div className="border-t border-slate-700 bg-[#050816] px-4 pb-6 pt-3 shadow-xl shadow-slate-950/30 md:hidden">
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
                      ? "bg-orange-500/10 text-orange-300"
                      : "text-slate-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-800 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  href={role === "student" ? "/my-courses" : dashboardUrl}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2.5 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/15"
                >
                  {role === "student" ? "My Courses" : "Dashboard"}
                  <span className="text-[10px] uppercase tracking-wider text-orange-300">{role}</span>
                </Link>
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-2">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-orange-100 font-bold text-orange-700">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.username}</p>
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] ${roleBadge.style}`}>
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
                  className="w-full rounded-lg border border-rose-400/30 bg-rose-500/10 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/15"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-orange-400/40 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-orange-500/20"
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
