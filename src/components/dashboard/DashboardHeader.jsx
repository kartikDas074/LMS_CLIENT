"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/dashboard/Icon";
import { getRoleLabel, getDashboardUrl, normalizeRole } from "@/config/dashboardNavigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader({ role, onMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.username || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.image?.url;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-800/80 bg-[#050816]/90 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Icon name="menu" />
        </button>
        <div className="hidden h-8 w-px bg-slate-800 sm:block" />
        <p className="text-sm font-medium text-slate-300">
          Workspace <span className="mx-2 text-slate-700">/</span>
          <span className="text-slate-500">{getRoleLabel(role)}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-200 sm:block"
          aria-label="Notifications"
        >
          <Icon name="bell" size={18} />
        </button>
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500/15 text-xs font-bold text-orange-300 ring-1 ring-orange-500/30">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="max-w-[140px] truncate text-xs font-semibold text-slate-200">{displayName}</p>
            <p className="text-[10px] text-slate-500">{getRoleLabel(role)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 sm:block"
          aria-label="Log out"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
