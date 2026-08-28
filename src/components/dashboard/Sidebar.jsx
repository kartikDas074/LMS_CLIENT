"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getNavigationForRole,
  getRoleLabel,
} from "@/config/dashboardNavigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SidebarItem from "@/components/dashboard/SidebarItem";

export default function Sidebar({ role, mobile = false, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = getNavigationForRole(role);
  const activeHref = navigation
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const displayName = user?.username || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.image?.url;

  function handleLogout() {
    logout();
    if (onClose) onClose();
    router.push("/login");
  }

  return (
    <aside
      className={`${mobile ? "h-full w-72" : "hidden w-64 shrink-0 lg:block"} border-r border-slate-800/80 bg-[#080D1A]`}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <Link
          href="/"
          className="mb-9 flex items-center gap-2 px-2 text-lg font-bold tracking-tight text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-sm shadow-lg shadow-orange-500/20">
            L
          </span>
          Learn<span className="text-orange-400">Hub</span>
        </Link>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Workspace
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={item.href === activeHref}
              onNavigate={onClose}
            />
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500/15 text-xs font-bold text-orange-300 ring-1 ring-orange-500/30">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">{displayName}</p>
                <p className="text-[10px] text-slate-500">{getRoleLabel(role)}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
