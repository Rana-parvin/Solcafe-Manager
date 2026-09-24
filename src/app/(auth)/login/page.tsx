"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Warm Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#C88A2B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F5E1C0]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E1D9] rounded-2xl p-8 shadow-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#241614] border border-[#C88A2B]/40 relative overflow-hidden mx-auto flex items-center justify-center shadow-md mb-4 p-2">
            <Image
              src="/images/appicon_large_size_final.png"
              alt="SolCafe Manager Logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#2B211E] tracking-tight">
            SolCafe <span className="text-[#C88A2B]">MANAGER</span>
          </h1>
          <p className="text-xs text-[#756B66] mt-1.5 font-medium">
            Staff & Administration Portal (Firebase solcafe-e700b)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#C94A4A]/10 border border-[#C94A4A]/20 flex items-start gap-3 text-[#C94A4A] text-xs font-semibold">
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
            icon={<Mail className="w-4 h-4 text-[#756B66]" />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-[#756B66]" />}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Sign In to Manager Portal
          </Button>
        </form>

        {/* Demo Fast Evaluation Section */}
        <div className="mt-8 pt-6 border-t border-[#E8E1D9] text-center">
          <p className="text-xs font-bold text-[#756B66] mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C88A2B]" /> Demo Quick Evaluation Sign-In
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
