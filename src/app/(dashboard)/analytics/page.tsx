"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Coffee,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { subscribeToOrders } from "@/lib/firestore/orders";
import { subscribeToPayments } from "@/lib/firestore/payments";
import { subscribeToProducts } from "@/lib/firestore/products";
import { subscribeToUsers } from "@/lib/firestore/users";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Order, PaymentTransaction, MenuItem, UserProfile } from "@/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    const unsubPayments = subscribeToPayments((data) => setPayments(data));
    const unsubProducts = subscribeToProducts((data) => setProducts(data));
    const unsubUsers = subscribeToUsers((data) => setUsers(data));
    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubOrders();
      unsubPayments();
      unsubProducts();
      unsubUsers();
      unsubSettings();
    };
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0) ||
    orders.filter((o) => o.status === "completed").reduce((acc, o) => acc + o.totalPrice, 0);

  const totalCompletedOrders = orders.filter((o) => o.status === "completed").length;
  const avgOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;
  const totalCustomers = users.filter((u) => u.role === "customer" || !u.role).length;

  // Calculate order counts by status
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Analytics & Performance Insights</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Real-time financial performance, order volume metrics, and catalog statistics from Cloud Firestore.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] text-xs font-semibold text-[#3B2522]">
          <Sparkles className="w-4 h-4 text-[#C88A2B]" /> Live Shared Firestore Stream
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B66]">Total Revenue</span>
            <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#C88A2B] border border-[#E8E1D9]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#2B211E]">
              {formatCurrency(totalRevenue, currencySymbol, currencyCode)}
            </p>
            <p className="text-[11px] text-[#3A8F5B] mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Ledger verified
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B66]">Completed Orders</span>
            <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#2E8B82] border border-[#E8E1D9]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#2B211E]">{totalCompletedOrders}</p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Out of {orders.length} total orders</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B66]">Average Order Value</span>
            <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#3B2522] border border-[#E8E1D9]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#2B211E]">
              {formatCurrency(avgOrderValue, currencySymbol, currencyCode)}
            </p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Per fulfilled transaction</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B66]">Active Customers</span>
            <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#4D7FA8] border border-[#E8E1D9]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#2B211E]">{totalCustomers}</p>
            <p className="text-[11px] text-[#756B66] mt-1 font-medium">Registered mobile users</p>
          </div>
        </Card>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card className="space-y-4">
          <div className="border-b border-[#E8E1D9] pb-3">
            <h3 className="font-extrabold text-base text-[#2B211E] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#C88A2B]" /> Order Status Distribution
            </h3>
            <p className="text-xs text-[#756B66]">Live breakdown across active order states</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#D99A2B]">Pending ({pendingCount})</span>
                <span>{orders.length > 0 ? Math.round((pendingCount / orders.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E8E1D9]">
                <div
                  className="h-full bg-[#D99A2B]"
                  style={{ width: `${orders.length > 0 ? (pendingCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#E07A2E]">Preparing ({preparingCount})</span>
                <span>{orders.length > 0 ? Math.round((preparingCount / orders.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E8E1D9]">
                <div
                  className="h-full bg-[#E07A2E]"
                  style={{ width: `${orders.length > 0 ? (preparingCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#3A8F5B]">Ready ({readyCount})</span>
                <span>{orders.length > 0 ? Math.round((readyCount / orders.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E8E1D9]">
                <div
                  className="h-full bg-[#3A8F5B]"
                  style={{ width: `${orders.length > 0 ? (readyCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#2E8B82]">Completed ({completedCount})</span>
                <span>{orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E8E1D9]">
                <div
                  className="h-full bg-[#2E8B82]"
                  style={{ width: `${orders.length > 0 ? (completedCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#C94A4A]">Cancelled ({cancelledCount})</span>
                <span>{orders.length > 0 ? Math.round((cancelledCount / orders.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E8E1D9]">
                <div
                  className="h-full bg-[#C94A4A]"
                  style={{ width: `${orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Catalog Insights */}
        <Card className="space-y-4">
          <div className="border-b border-[#E8E1D9] pb-3">
            <h3 className="font-extrabold text-base text-[#2B211E] flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#3B2522]" /> Menu Catalog & Inventory Metrics
            </h3>
            <p className="text-xs text-[#756B66]">Overview of available coffee products and stock</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
              <p className="text-[11px] text-[#756B66] font-medium">Total Products</p>
              <p className="text-xl font-extrabold text-[#2B211E] mt-0.5">{products.length}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
              <p className="text-[11px] text-[#756B66] font-medium">Low/Out of Stock</p>
              <p className="text-xl font-extrabold text-[#C94A4A] mt-0.5">
                {products.filter((p) => (p.availableQuantity ?? 0) <= 2).length}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-[#2B211E]">Payment Method Volume</p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#756B66]">Cash on Delivery (COD)</span>
                <span className="font-bold text-[#2B211E]">
                  {orders.filter((o) => (o.paymentMethod || "").toLowerCase() === "cod").length} orders
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E8E1D9]">
                <span className="text-[#756B66]">Online / UPI / Card</span>
                <span className="font-bold text-[#2B211E]">
                  {orders.filter((o) => (o.paymentMethod || "").toLowerCase() !== "cod").length} orders
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
