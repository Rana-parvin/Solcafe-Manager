"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Mail, Phone } from "lucide-react";
import { subscribeToUsers } from "@/lib/firestore/users";
import { UserProfile } from "@/types";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function CustomersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const customers = users.filter((u) => u.role === "customer" || !u.role);

  const filteredCustomers = customers.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Customer Directory</h1>
          <p className="text-xs text-[#756B66] mt-1">
            SolCafe customer accounts registered via Flutter mobile app (`users` collection).
          </p>
        </div>
      </div>

      {/* Search Bar Card */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9] flex justify-end">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Customers Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading customers from Cloud Firestore `users` collection...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No customer records found</p>
            <p className="text-xs text-[#756B66] mt-1">
              Customer profiles registered in the SolCafe Flutter app will list here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Account UID</th>
                  <th className="py-3.5 px-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2B211E] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-center text-[#3B2522] font-extrabold text-[11px]">
                        {customer.displayName ? customer.displayName.charAt(0).toUpperCase() : "C"}
                      </div>
                      <span>{customer.displayName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#9A918B]" />
                        <span>{customer.email || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#9A918B]" />
                        <span>{customer.phoneNumber || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">
                      {customer.uid}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="blue">Customer</Badge>
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
