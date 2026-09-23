"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLoginAsAdmin, demoLoginAsStaff } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please verify staff permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    demoLoginAsAdmin();
    router.push("/");
  };

  const handleDemoStaff = () => {
    demoLoginAsStaff();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
            <Coffee className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            SolCafe <span className="text-amber-500">Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Staff & Administration Portal (Firebase solcafe-e700b)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Email"
            type="email"
            placeholder="admin@solcafe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Sign In to Manager Portal
          </Button>
        </form>

        {/* Demo Fast Evaluation Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs font-medium text-slate-400 mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo Quick Evaluation Sign-In
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoAdmin}
              className="text-xs"
            >
              Demo Admin
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDemoStaff}
              className="text-xs"
            >
              Demo Staff
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
