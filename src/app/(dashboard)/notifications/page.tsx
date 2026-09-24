"use client";

import React, { useEffect, useState } from "react";
import { Bell, Clock, Coffee, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck } from "lucide-react";
import { subscribeToOrders } from "@/lib/firestore/orders";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Order } from "@/types";
import { formatDate } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string;
  type: "order" | "system" | "status";
  read: boolean;
}

export default function NotificationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      // Generate real notifications from order stream
      const generated: NotificationItem[] = data.slice(0, 10).map((o) => ({
        id: `notif-${o.id}`,
        title: `Order #${o.id.slice(0, 8)} (${o.itemName})`,
        message: `Customer placed order for ${o.itemName} (${o.size}) - Status: ${o.status.toUpperCase()}`,
        timestamp: o.orderDate,
        type: "order",
        read: o.status === "completed",
      }));
      setNotifications(generated);
      setLoading(false);
    });

    const unsubSettings = subscribeToCafeSettings((data) => {
      setSoundEnabled(data.notifications.newOrderSound);
    });

    return () => {
      unsubOrders();
      unsubSettings();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Notifications & System Alerts</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Real-time notifications stream generated from active orders and system events.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading real-time notifications stream...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No active notifications</p>
            <p className="text-xs text-[#756B66] mt-1">
              New customer orders placed in the mobile app will generate alert notifications here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D9]">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  notif.read ? "bg-[#FFFFFF]" : "bg-[#FAF8F5]"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#F7F5F2] border border-[#E8E1D9] flex items-center justify-center text-[#3B2522] shrink-0">
                  <ShoppingBag className="w-4 h-4 text-[#C88A2B]" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#2B211E] truncate">{notif.title}</h4>
                    <span className="text-[10px] text-[#9A918B] shrink-0 font-mono">
                      {formatDate(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[#756B66]">{notif.message}</p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#C88A2B] shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
