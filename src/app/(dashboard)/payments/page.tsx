"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Search, ArrowUpRight } from "lucide-react";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { PaymentTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToPayments((data) => {
      setPayments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Payment Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Financial ledger from Firestore collection `payments` shared with Flutter app.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <p className="text-[10px] text-slate-400 font-medium">Logged Payments Total</p>
          <p className="text-lg font-bold text-amber-400">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-end">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search by Payment ID, Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading payment ledger from Firestore...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No payment logs found</p>
            <p className="text-xs text-slate-500 mt-1">
              Payment records created during order checkout in Flutter app will stream here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">
                      #{payment.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      #{payment.orderId.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {payment.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium">{payment.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="emerald">{payment.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(payment.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
