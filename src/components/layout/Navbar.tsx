"use client";

import React from "react";
import Link from "next/link";
import { Bell, Search, ShieldCheck, Menu } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

interface NavbarProps {
  title?: string;
  onMobileToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title = "Dashboard Overview", onMobileToggle }) => {
  const { role } = useAuth();

  return (
    <header className="h-16 border-b border-[#E8E1D9] bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {onMobileToggle && (
          <button
            onClick={onMobileToggle}
            className="lg:hidden p-2 rounded-lg text-[#756B66] hover:text-[#2B211E] hover:bg-[#FAF8F5] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl md:text-2xl font-extrabold text-[#2B211E] tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-[#9A918B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, menu items..."
            className="bg-[#FAF8F5] border border-[#E8E1D9] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#2B211E] placeholder-[#9A918B] focus:outline-none focus:border-[#C88A2B] focus:ring-2 focus:ring-[#C88A2B]/20 w-48 md:w-64 transition-all"
          />
        </div>

        {/* Live Notification Indicator */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-[#756B66] hover:text-[#2B211E] hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-[#E8E1D9]"
          title="Notifications Feed"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C88A2B] animate-pulse" />
        </Link>

        {/* Role Badge */}
        <div className="hidden xs:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E1D9] text-xs font-bold text-[#2B211E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C88A2B]" />
          <span className="capitalize">{role || "Staff"} Access</span>
        </div>
      </div>
    </header>
  );
};
