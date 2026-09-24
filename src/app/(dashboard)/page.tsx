"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { subscribeToOrders, updateOrderStatus } from "@/lib/firestore/orders";
import { subscribeToProducts } from "@/lib/firestore/products";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Order, MenuItem, PaymentTransaction, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    });
    const unsubPayments = subscribeToPayments((data) => {
      setPayments(data);
    });
    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubPayments();
      unsubSettings();
    };
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0) ||
    orders.filter((o) => o.status === "completed").reduce((acc, o) => acc + o.totalPrice, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing");

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="amber">Pending</Badge>;
      case "preparing":
        return <Badge variant="orange">Preparing</Badge>;
      case "ready":
        return <Badge variant="emerald">Ready</Badge>;
      case "completed":
        return <Badge variant="teal">Completed</Badge>;
      case "cancelled":
        return <Badge variant="rose">Cancelled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const handleStatusQuickAdvance = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "completed";

    await updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* SolCafe Welcome Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAF8F5] rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C88A2B]">
            <Sparkles className="w-4 h-4" /> SolCafe Administration System
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B211E] tracking-tight">
            Welcome to SolCafe <span className="text-[#3B2522]">Manager</span>
          </h1>
          <p className="text-xs md:text-sm text-[#756B66] max-w-xl">
            Real-time management dashboard for customer orders, coffee catalog items, store configuration, and store operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link href="/products">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Menu Item
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="secondary" size="sm">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#756B66]">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#C88A2B] border border-[#E8E1D9]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-extrabold text-[#2B211E]">
              {formatCurrency(totalRevenue, currencySymbol, currencyCode)}
            </p>
            <p className="text-[11px] text-[#3A8F5B] mt-1 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Shared Firestore Ledger
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#756B66]">Active Kitchen Orders</span>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#D99A2B] border border-[#E8E1D9]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-extrabold text-[#2B211E]">{pendingOrders.length}</p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Pending / Preparing in kitchen</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#756B66]">Active Menu Products</span>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#3B2522] border border-[#E8E1D9]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-extrabold text-[#2B211E]">{products.length}</p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Available across Flutter app</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#756B66]">Completed Orders</span>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#3A8F5B] border border-[#E8E1D9]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-extrabold text-[#2B211E]">
              {orders.filter((o) => o.status === "completed").length}
            </p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Total fulfilled orders</p>
          </div>
        </Card>
      </div>

      {/* Live Active Orders Stream Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-[#E8E1D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF]">
          <div>
            <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#C88A2B]" /> Incoming Active Orders Stream
            </h3>
            <p className="text-xs text-[#756B66] mt-0.5">
              Live orders from Cloud Firestore `making_orders` collection
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-[#3B2522] hover:text-[#C88A2B] flex items-center gap-1 transition-colors"
          >
            Manage All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading orders stream from Cloud Firestore...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF8F5]/50">
            <p className="text-sm font-bold text-[#2B211E]">No active customer orders right now</p>
            <p className="text-xs text-[#756B66] mt-1">
              New orders placed in the SolCafe Flutter mobile app will stream here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Item & Size</th>
                  <th className="py-3.5 px-4">Customer UID</th>
                  <th className="py-3.5 px-4">Total Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order Time</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#3B2522]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {order.itemName} <span className="text-[#756B66] font-normal">({order.size})</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66] font-mono text-[11px]">
                      {order.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#2B211E]">
                      {formatCurrency(order.totalPrice, currencySymbol, currencyCode)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 text-[#756B66] font-mono text-[11px]">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusQuickAdvance(order.id, order.status)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Advance Status &rarr;
                        </Button>
                      )}
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
