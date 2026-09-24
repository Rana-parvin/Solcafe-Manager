"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  ShoppingBag,
  Layers,
  Users,
  ShieldCheck,
  CreditCard,
  Tag,
  BarChart3,
  Bell,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { subscribeToOrders } from "@/lib/firestore/orders";
import { clsx } from "clsx";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const { profile, role, logout } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToOrders((orders) => {
      const pending = orders.filter(
        (o) => o.status === "pending" || o.status === "preparing"
      );
      setPendingOrdersCount(pending.length);
    });
    return () => unsub();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: Clock, badge: pendingOrdersCount },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Categories", href: "/categories", icon: Layers },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Staff & Roles", href: "/staff", icon: ShieldCheck },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Offers & Discounts", href: "/offers", icon: Tag },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Activity Logs", href: "/activity", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#241614]/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          "w-64 bg-[#241614] border-r border-[#3B2522]/80 flex flex-col justify-between shrink-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-[#3B2522]/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B2522] border border-[#C88A2B]/40 relative overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                <Image
                  src="/images/appicon_large_size_final.png"
                  alt="SolCafe Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
                  SolCafe
                </h1>
                <p className="text-[10px] font-extrabold text-[#C88A2B] tracking-widest uppercase mt-1">
                  MANAGER
                </p>
              </div>
            </div>

            {/* Close button on mobile */}
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="lg:hidden p-1.5 rounded-lg text-[#9A918B] hover:text-white hover:bg-[#3B2522]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items (12 Items in Exact Required Order) */}
          <nav className="p-3.5 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onMobileClose && onMobileClose()}
                  className={clsx(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group h-11",
                    isActive
                      ? "bg-[#5A4031] text-[#F5D58A] font-bold shadow-xs"
                      : "text-[#D8CEC5] hover:text-white hover:bg-[#3B2522]/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-[#F5D58A]" : "text-[#9A918B] group-hover:text-white"
                      )}
                    />
                    <span className="tracking-tight">{item.name}</span>
                  </div>

                  {Boolean(item.badge) && (
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                        isActive
                          ? "bg-[#C88A2B] text-white"
                          : "bg-[#3B2522] text-[#F5D58A]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-4 border-t border-[#3B2522]/80 bg-[#1C1110] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-[#3B2522] border border-[#C88A2B]/40 flex items-center justify-center font-extrabold text-[#F5D58A] text-xs shrink-0 shadow-xs">
                  {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.displayName || "SolCafe Manager"}
                  </p>
                  <p className="text-[10px] text-[#C88A2B] font-semibold capitalize truncate">
                    {role || "staff"} Account
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-lg text-[#9A918B] hover:text-[#C94A4A] hover:bg-[#C94A4A]/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
