"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, UserCheck, Search } from "lucide-react";
import { subscribeToUsers, updateUserRole } from "@/lib/firestore/users";
import { UserProfile, UserRole } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function StaffManagementPage() {
  const { isAdmin } = useAuth();
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

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (!isAdmin) {
      alert("Only SolCafe Master Admins can modify staff roles.");
      return;
    }
    await updateUserRole(uid, newRole);
  };

  const staffMembers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Staff & Role Access Control (RBAC)</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Manage administrative and staff access permissions enforced via Cloud Firestore and server rules.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D9A441]/40 flex items-center gap-3 text-[#3B2522] text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-[#C88A2B]" />
          <span>
            You are logged in as a <strong>Staff</strong> member. Role modification requires a Master Admin account.
          </span>
        </div>
      )}

      {/* Search Bar Card */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9] flex justify-end">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Staff Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading user permissions from Cloud Firestore...
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">UID</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {staffMembers.map((member) => (
                  <tr key={member.uid} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2B211E] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-center text-[#3B2522] font-extrabold text-[11px]">
                        {member.displayName ? member.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span>{member.displayName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#756B66]">{member.email || "N/A"}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#756B66]">
                      {member.uid}
                    </td>
                    <td className="py-3.5 px-4">
                      {member.role === "admin" ? (
                        <Badge variant="gold">Admin</Badge>
                      ) : member.role === "staff" ? (
                        <Badge variant="purple">Staff</Badge>
                      ) : (
                        <Badge variant="slate">Customer</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={member.role || "customer"}
                        onChange={(e) => handleRoleChange(member.uid, e.target.value as UserRole)}
                        disabled={!isAdmin}
                        className="bg-[#FFFFFF] border border-[#E8E1D9] text-xs text-[#2B211E] font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40 disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                      </select>
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
