"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavigationForRole, getRoleLabel } from "@/config/dashboardNavigation";
import SidebarItem from "@/components/dashboard/SidebarItem";

export default function Sidebar({ role, mobile = false, onClose }) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);
  const activeHref = navigation.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return <aside className={`${mobile ? "h-full w-72" : "hidden w-64 shrink-0 lg:block"} border-r border-slate-800/80 bg-[#080D1A]`}><div className="flex h-full flex-col px-4 py-5"><Link href="/" className="mb-9 flex items-center gap-2 px-2 text-lg font-bold tracking-tight text-white"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-sm shadow-lg shadow-orange-500/20">L</span>Learn<span className="text-orange-400">Hub</span></Link><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Workspace</div><nav className="space-y-1">{navigation.map((item) => <SidebarItem key={item.href} item={item} active={item.href === activeHref} onNavigate={onClose} />)}</nav><div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">Current role</p><p className="mt-1 text-sm font-semibold text-slate-200">{getRoleLabel(role)}</p><p className="mt-1 text-[11px] text-slate-500">Frontend preview mode</p></div></div></aside>;
}
