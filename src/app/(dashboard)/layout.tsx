"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/firebase/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthorized, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthorized) {
      router.push("/login");
    }
  }, [isAuthorized, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#3B2522] border border-[#C88A2B]/40 relative overflow-hidden flex items-center justify-center shadow-lg animate-bounce">
          <Image
            src="/images/appicon_large_size_final.png"
            alt="SolCafe Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <p className="text-xs font-bold text-[#2B211E] animate-pulse tracking-wide">
          Connecting to SolCafe Manager...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5F2] text-[#2B211E]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
