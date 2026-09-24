"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Coffee,
  Eye,
  ChevronRight,
} from "lucide-react";
import { subscribeToOrders, updateOrderStatus } from "@/lib/firestore/orders";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Currency & Settings State
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubOrders();
      unsubSettings();
    };
  }, []);

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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Order Management System</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Real-time status tracking for customer orders from Cloud Firestore `making_orders`.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9]">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["All", "pending", "preparing", "ready", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? "bg-[#3B2522] text-[#FFFFFF] shadow-sm"
                  : "bg-[#FFFFFF] text-[#756B66] hover:text-[#2B211E] border border-[#E8E1D9]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <Input
            placeholder="Search Order ID, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Orders Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading order stream from Cloud Firestore...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No orders matching filter</p>
            <p className="text-xs text-[#756B66] mt-1">
              Customer orders placed in the SolCafe Flutter app will appear here automatically.
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
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#3B2522]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {order.itemName} <span className="text-[#756B66] font-normal">({order.size})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">
                      {order.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{order.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#2B211E]">
                      {formatCurrency(order.totalPrice, currencySymbol, currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66] font-mono text-[11px]">{formatDate(order.orderDate)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-[#FFFFFF] border border-[#E8E1D9] text-xs text-[#2B211E] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40 font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#756B66]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details #${selectedOrder?.id.slice(0, 8)}`}
        maxWidth="md"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#756B66] font-medium">Current Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#756B66] font-medium">Item Name:</span>
                <span className="font-extrabold text-[#2B211E]">{selectedOrder.itemName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#756B66] font-medium">Size & Quantity:</span>
                <span className="text-[#2B211E] font-medium">
                  Size {selectedOrder.size} &times; {selectedOrder.quantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#756B66] font-medium">Payment Method:</span>
                <span className="capitalize text-[#2B211E] font-bold">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#756B66] font-medium">Order Date:</span>
                <span className="text-[#756B66] font-mono">{formatDate(selectedOrder.orderDate)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8E1D9]">
                <span className="font-bold text-[#2B211E]">Total Amount:</span>
                <span className="text-base font-extrabold text-[#3B2522]">
                  {formatCurrency(selectedOrder.totalPrice, currencySymbol, currencyCode)}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
              >
                Cancel Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange(selectedOrder.id, "completed")}
              >
                Mark Completed
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
