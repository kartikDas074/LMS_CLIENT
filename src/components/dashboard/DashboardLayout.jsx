"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({ role, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-[#050816] text-slate-100"><div className="flex min-h-screen"><Sidebar role={role} /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader role={role} onMenu={() => setMobileOpen(true)} /><main className="flex-1 overflow-x-hidden px-4 py-7 sm:px-8 sm:py-9"><div className="mx-auto max-w-[1400px]">{children}</div></main></div></div>{mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-label="Close dashboard menu" /><div className="relative"><Sidebar role={role} mobile onClose={() => setMobileOpen(false)} /></div></div>}</div>;
}
