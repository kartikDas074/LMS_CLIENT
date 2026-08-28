"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/dashboard/Icon";

export default function SidebarItem({ item, onNavigate, active }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-orange-500/10 text-orange-300 shadow-[inset_2px_0_0_#FF8A00]" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
    >
      <Icon
        name={item.icon}
        size={17}
        className={
          active
            ? "text-orange-400"
            : "text-slate-500 group-hover:text-slate-300"
        }
      />
      <span className="flex-1">{item.label}</span>
      {item.note && (
        <span className="hidden text-[9px] uppercase tracking-wider text-slate-600 lg:inline">
          {item.note}
        </span>
      )}
    </Link>
  );
}
