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
} from "lucide-react";
import { subscribeToOrders, updateOrderStatus } from "@/lib/firestore/orders";
import { subscribeToProducts } from "@/lib/firestore/products";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { Order, MenuItem, PaymentTransaction, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
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

    return () => {
      unsubOrders();
      unsubProducts();
      unsubPayments();
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
        return <Badge variant="purple">Preparing</Badge>;
      case "ready":
        return <Badge variant="blue">Ready</Badge>;
      case "completed":
        return <Badge variant="emerald">Completed</Badge>;
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl coffee-gradient border border-amber-500/20 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            Welcome to SolCafe <span className="brand-gradient-text">Manager</span>
          </h1>
          <p className="text-xs text-slate-300">
            Real-time management for customer orders, menu items, and store operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add New Item
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
        <Card className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-100">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Shared Firestore Ledger
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Kitchen Orders</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-100">{pendingOrders.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Pending / Preparing in kitchen</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Menu Items</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-100">{products.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Available across Flutter app</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed Orders</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-100">
              {orders.filter((o) => o.status === "completed").length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total fulfilled orders</p>
          </div>
        </Card>
      </div>

      {/* Live Active Orders Stream Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" /> Active Incoming Orders Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live feeds from Firestore `making_orders` collection
            </p>
          </div>
          <Link href="/orders" className="text-xs text-amber-400 hover:underline">
            Manage Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
            Loading orders stream from Firestore...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <p className="text-sm font-medium text-slate-300">No active customer orders right now</p>
            <p className="text-xs text-slate-500 mt-1">
              New orders placed in the Flutter mobile app will stream here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Item & Size</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400/90">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {order.itemName} <span className="text-slate-400">({order.size})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {order.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(order.orderDate)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusQuickAdvance(order.id, order.status)}
                          className="text-[11px] py-1 px-2"
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
      </div>
    </div>
  );
}
