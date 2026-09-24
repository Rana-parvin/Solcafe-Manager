"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Search, ArrowUpRight } from "lucide-react";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { PaymentTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  useEffect(() => {
    const unsubPayments = subscribeToPayments((data) => {
      setPayments(data);
      setLoading(false);
    });
    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubPayments();
      unsubSettings();
    };
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Payment Audit Logs</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Financial ledger from Cloud Firestore collection `payments` shared with Flutter app.
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E1D9] rounded-2xl px-5 py-2.5 text-right shadow-sm">
          <p className="text-[10px] text-[#756B66] font-bold uppercase tracking-wider">Logged Payments Total</p>
          <p className="text-xl font-extrabold text-[#3B2522]">
            {formatCurrency(totalAmount, currencySymbol, currencyCode)}
          </p>
        </div>
      </div>

      {/* Search Bar Card */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9] flex justify-end">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search Payment ID, Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Payments Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading payment ledger from Cloud Firestore...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No payment logs found</p>
            <p className="text-xs text-[#756B66] mt-1">
              Payment records created during order checkout in Flutter app will stream here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer UID</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#3B2522]">
                      #{payment.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">
                      #{payment.orderId.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">
                      {payment.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-bold text-[#2B211E]">{payment.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#3B2522]">
                      {formatCurrency(payment.amount, currencySymbol, currencyCode)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="teal">{payment.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66] font-mono text-[11px]">{formatDate(payment.timestamp)}</td>
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
