"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, UserCheck, Search } from "lucide-react";
import { subscribeToUsers, updateUserRole } from "@/lib/firestore/users";
import { UserProfile, UserRole } from "@/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Staff & Role Access Control (RBAC)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage administrative and staff access permissions enforced via Firestore and server rules.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>
            You are logged in as a <strong>Staff</strong> member. Role modification requires a Master Admin account.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-end">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading user permissions from Firestore...
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">UID</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {staffMembers.map((member) => (
                  <tr key={member.uid} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-[11px]">
                        {member.displayName ? member.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span>{member.displayName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{member.email || "N/A"}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {member.uid}
                    </td>
                    <td className="py-3.5 px-4">
                      {member.role === "admin" ? (
                        <Badge variant="amber">Admin</Badge>
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
                        className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-amber-500 disabled:opacity-50"
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
      </div>
    </div>
  );
}
