"use client";

import React, { useEffect, useState } from "react";
import { Activity, Clock, ShoppingBag, CreditCard, UserCheck, CheckCircle2, Search } from "lucide-react";
import { subscribeToOrders } from "@/lib/firestore/orders";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { Order, PaymentTransaction } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface LogEntry {
  id: string;
  type: "order" | "payment";
  title: string;
  description: string;
  timestamp: Date | string;
  user: string;
}

export default function ActivityLogsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  useEffect(() => {
    const unsubOrders = subscribeToOrders((orderData) => {
      setOrders(orderData);
      updateLogs(orderData, payments);
      setLoading(false);
    });

    const unsubPayments = subscribeToPayments((paymentData) => {
      setPayments(paymentData);
      updateLogs(orders, paymentData);
    });

    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubOrders();
      unsubPayments();
      unsubSettings();
    };
  }, []);

  const updateLogs = (oList: Order[], pList: PaymentTransaction[]) => {
    const orderLogs: LogEntry[] = oList.map((o) => ({
      id: `log-order-${o.id}`,
      type: "order",
      title: `Order #${o.id.slice(0, 8)} (${o.itemName})`,
      description: `Status updated to ${o.status.toUpperCase()} for ${formatCurrency(o.totalPrice, currencySymbol, currencyCode)}`,
      timestamp: o.orderDate,
      user: `User ${o.userId.slice(0, 8)}`,
    }));

    const paymentLogs: LogEntry[] = pList.map((p) => ({
      id: `log-pay-${p.id}`,
      type: "payment",
      title: `Payment Received #${p.id.slice(0, 8)}`,
      description: `${p.paymentMethod.toUpperCase()} payment of ${formatCurrency(p.amount, currencySymbol, currencyCode)} for Order #${p.orderId.slice(0, 8)}`,
      timestamp: p.timestamp,
      user: `User ${p.userId.slice(0, 8)}`,
    }));

    const combined = [...orderLogs, ...paymentLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setLogs(combined);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Activity & Audit Logs</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Historical audit trail of order events, payment transactions, and system updates.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9] flex justify-end">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search audit trail logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Activity Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading activity log stream from Cloud Firestore...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No audit logs found</p>
            <p className="text-xs text-[#756B66] mt-1">
              Events and changes across SolCafe order stream will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Activity Description</th>
                  <th className="py-3.5 px-4">Actor UID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      {log.type === "order" ? (
                        <Badge variant="blue" className="gap-1">
                          <ShoppingBag className="w-3 h-3" /> Order Event
                        </Badge>
                      ) : (
                        <Badge variant="emerald" className="gap-1">
                          <CreditCard className="w-3 h-3" /> Payment Audit
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2B211E]">{log.title}</td>
                    <td className="py-3.5 px-4 text-[#756B66]">{log.description}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">{log.user}</td>
                    <td className="py-3.5 px-4 text-[#756B66] font-mono text-[11px]">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
