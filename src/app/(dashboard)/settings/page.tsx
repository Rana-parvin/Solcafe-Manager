"use client";

import React from "react";
import { Settings as SettingsIcon, Database, Shield, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const firebaseProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "solcafe-e700b";
  const cloudinaryCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "Not set";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Application Settings & Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">
          System setup, shared Firebase project credentials, and Cloudinary media settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Firebase Config Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Firebase Backend Connection</h3>
              <p className="text-[11px] text-slate-400">Shared with SolCafe Flutter customer app</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Shared Firebase Project ID</p>
              <p className="text-sm font-mono font-bold text-amber-400 mt-1">{firebaseProject}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Auth Domain</p>
              <p className="text-sm font-mono text-slate-200 mt-1">solcafe-e700b.firebaseapp.com</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Firestore Data Collections</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["items", "users", "making_orders", "ordered items", "payments", "cart items"].map((col) => (
                  <Badge key={col} variant="amber">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Environment Secret Security</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> .env.local strictly gitignored
              </p>
            </div>
          </div>
        </Card>

        {/* Cloudinary Config Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cloudinary Image Storage</h3>
              <p className="text-[11px] text-slate-400">Product and profile image server-side storage</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Cloudinary Cloud Name</p>
              <p className="text-sm font-mono font-bold text-slate-200 mt-1">{cloudinaryCloud}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-medium">Signed Upload Signature Handler</p>
              <p className="text-xs text-amber-400 mt-1 font-mono">/api/cloudinary/sign</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
