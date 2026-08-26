"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "min-h-screen" : "flex flex-1 flex-col"}>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}
