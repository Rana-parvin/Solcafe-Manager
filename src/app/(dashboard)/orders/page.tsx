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
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status tracking for customer orders from Firestore collection `making_orders`.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["All", "pending", "preparing", "ready", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <Input
            placeholder="Search by Order ID, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading order stream from Firestore...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No orders matching filter</p>
            <p className="text-xs text-slate-500 mt-1">
              Customer orders placed in the SolCafe Flutter app will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Item & Size</th>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {order.itemName} <span className="text-slate-400">({order.size})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {order.userId.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 capitalize">{order.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(order.orderDate)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
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
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details #${selectedOrder?.id.slice(0, 8)}`}
        maxWidth="md"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Item Name:</span>
                <span className="font-semibold text-slate-100">{selectedOrder.itemName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Size & Quantity:</span>
                <span className="text-slate-200">
                  Size {selectedOrder.size} &times; {selectedOrder.quantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Method:</span>
                <span className="capitalize text-slate-200">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Order Placed Date:</span>
                <span className="text-slate-200">{formatDate(selectedOrder.orderDate)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-300">Total Price:</span>
                <span className="text-base font-bold text-amber-400">
                  {formatCurrency(selectedOrder.totalPrice)}
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
