"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Building2,
  ShoppingBag,
  CreditCard,
  Bell,
  Palette,
  ShieldCheck,
  Save,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Lock,
  Mail,
  User,
  Clock,
  Smartphone,
  Moon,
  Sun,
  Sliders,
  Check,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUploader } from "@/components/ui/ImageUploader";
import {
  subscribeToCafeSettings,
  updateCafeSettings,
  resetCafeSettings,
} from "@/lib/firestore/settings";
import {
  CafeSettings,
  DEFAULT_CAFE_SETTINGS,
  ThemePreference,
  DensityMode,
  STORE_CURRENCY_OPTIONS,
} from "@/types";

type SettingsTab =
  | "general"
  | "order"
  | "payment"
  | "notifications"
  | "appearance"
  | "security";

export default function SettingsPage() {
  const { user, profile, role } = useAuth();

  // Settings State
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_CAFE_SETTINGS);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Status & Feedback Banners
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Reset Modal Confirmation State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Security Profile Edit Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCafeSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Form Field Updaters
  const updateGeneral = (field: keyof CafeSettings["general"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const updateOrder = (field: keyof CafeSettings["order"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      order: { ...prev.order, [field]: value },
    }));
  };

  const updatePayment = (field: keyof CafeSettings["payment"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }));
  };

  const updateNotifications = (
    field: keyof CafeSettings["notifications"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const updateAppearance = (
    field: keyof CafeSettings["appearance"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value },
    }));
  };

  const updateSecurity = (
    field: keyof CafeSettings["security"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value },
    }));
  };

  // Handle Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const result = await updateCafeSettings(
        settings,
        user?.email || profile?.email || "Manager"
      );
      if (result.isCloudSynced) {
        setStatusMessage({
          type: "success",
          text: "Settings successfully updated & synced with Cloud Firestore!",
        });
      } else {
        setStatusMessage({
          type: "info",
          text: "Settings saved to Manager local storage cache (Offline mode).",
        });
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setStatusMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset Defaults
  const handleResetDefaults = async () => {
    setIsSaving(true);
    try {
      const result = await resetCafeSettings();
      setIsResetModalOpen(false);
      setStatusMessage({
        type: "success",
        text: result.isCloudSynced
          ? "Settings reset to default values in Cloud Firestore."
          : "Settings reset to default values locally.",
      });
    } catch (err) {
      console.error("Error resetting settings:", err);
      setStatusMessage({
        type: "error",
        text: "Failed to reset settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Password Reset Email Trigger via Firebase Auth
  const handleSendPasswordReset = async () => {
    const targetEmail = user?.email || profile?.email;
    if (!targetEmail) {
      setStatusMessage({
        type: "error",
        text: "No authenticated user email found to send reset email.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setStatusMessage({
        type: "success",
        text: `Password reset email dispatched to ${targetEmail}. Please check your inbox!`,
      });
    } catch (err: any) {
      console.error("Password reset error:", err);
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to dispatch password reset email.",
      });
    }
  };

  // Open Profile Edit Modal
  const handleOpenProfileModal = () => {
    setEditDisplayName(profile?.displayName || user?.displayName || "");
    setEditPhoneNumber(profile?.phoneNumber || user?.phoneNumber || "");
    setIsProfileModalOpen(true);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editDisplayName,
        });
      }
      setIsProfileModalOpen(false);
      setStatusMessage({
        type: "success",
        text: "Account profile details updated successfully!",
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to update user profile.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Desktop Notifications Toggle
  const handleToggleDesktopNotifications = (checked: boolean) => {
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          updateNotifications("desktopNotifications", permission === "granted");
        });
        return;
      }
    }
    updateNotifications("desktopNotifications", checked);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "general", label: "General", icon: Building2 },
    { id: "order", label: "Order Settings", icon: ShoppingBag },
    { id: "payment", label: "Payment Settings", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header & Status Indicator Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D9] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#2B211E] tracking-tight">
              Business Administration Settings
            </h1>
            {settings.isCloudSynced ? (
              <Badge variant="emerald" className="gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Cloud Firestore Synced
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1 text-[11px]">
                <Info className="w-3 h-3" /> Saved Locally (Offline / Cache)
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#756B66] mt-1">
            Manage store preferences, order policies, customer payment methods, portal appearance, and security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="gap-1.5"
            disabled={isSaving}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Status Feedback Toast / Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border transition-all ${
            statusMessage.type === "success"
              ? "bg-[#3A8F5B]/10 text-[#3A8F5B] border-[#3A8F5B]/30"
              : statusMessage.type === "error"
              ? "bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30"
              : "bg-[#4D7FA8]/10 text-[#4D7FA8] border-[#4D7FA8]/30"
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#3A8F5B] shrink-0" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#4D7FA8] shrink-0" />
            )}
            <p>{statusMessage.text}</p>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[#756B66] hover:text-[#2B211E] text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D9] overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-px ${
                isActive
                  ? "border-[#3B2522] bg-[#FFFFFF] text-[#3B2522] shadow-xs"
                  : "border-transparent text-[#756B66] hover:text-[#2B211E] hover:bg-[#FAF8F5]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#C88A2B]" : "text-[#756B66]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="mt-6">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <Card className="space-y-6">
            <div className="border-b border-[#E8E1D9] pb-4">
              <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C88A2B]" /> Cafe Profile & Operational Details
              </h3>
              <p className="text-xs text-[#756B66] mt-1">
                Configure store branding, contact information, address, and operating hours.
              </p>
            </div>

            {/* Cafe Logo & Store Banner Image Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                label="Cafe / App Logo"
                description="Upload the official SolCafe logo asset displayed across staff portal & mobile app."
                value={settings.general.logoUrl}
                onChange={(url) => updateGeneral("logoUrl", url)}
                folder="solcafe_branding"
                defaultImage="/images/appicon_large_size_final.png"
              />

              <ImageUploader
                label="Cafe Storefront Banner"
                description="Upload promotional store banner image for SolCafe app storefront."
                value={settings.general.brandingBannerUrl || "/images/appicon_large_size_final.png"}
                onChange={(url) => updateGeneral("brandingBannerUrl", url)}
                folder="solcafe_branding"
                aspectRatio="wide"
                defaultImage="/images/appicon_large_size_final.png"
              />
            </div>

            {/* Cafe Info Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Cafe Name"
                placeholder="SolCafe Main Branch"
                value={settings.general.cafeName}
                onChange={(e) => updateGeneral("cafeName", e.target.value)}
              />

              <Input
                label="Contact Phone"
                placeholder="+1 (555) 234-5678"
                value={settings.general.contactPhone}
                onChange={(e) => updateGeneral("contactPhone", e.target.value)}
              />

              <Input
                label="Contact Email"
                type="email"
                placeholder="contact@solcafe.com"
                value={settings.general.contactEmail}
                onChange={(e) => updateGeneral("contactEmail", e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2B211E]">
                  Store Currency (Manager & Customer App)
                </label>
                <select
                  value={settings.general.currency || "INR"}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const opt = STORE_CURRENCY_OPTIONS.find((o) => o.code === selectedCode);
                    const symbol = opt ? opt.symbol : "₹";
                    updateGeneral("currency", selectedCode);
                    updateGeneral("currencySymbol", symbol);
                    updatePayment("currency", selectedCode);
                    updatePayment("currencySymbol", symbol);
                  }}
                  className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
                >
                  {STORE_CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Opening Hours"
                  placeholder="07:00 AM"
                  value={settings.general.openingHours}
                  onChange={(e) => updateGeneral("openingHours", e.target.value)}
                />
                <Input
                  label="Closing Hours"
                  placeholder="10:00 PM"
                  value={settings.general.closingHours}
                  onChange={(e) => updateGeneral("closingHours", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2B211E]">Cafe Address</label>
              <textarea
                rows={3}
                placeholder="123 Coffee Lane, Suite A, Brew City..."
                value={settings.general.address}
                onChange={(e) => updateGeneral("address", e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-3 text-xs text-[#2B211E] focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
              />
            </div>
          </Card>
        )}

        {/* TAB 2: ORDER SETTINGS */}
        {activeTab === "order" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-[#E8E1D9] pb-4">
                <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C88A2B]" /> Order Fulfillment & Intake Controls
                </h3>
                <p className="text-xs text-[#756B66] mt-1">
                  Manage live order intake status, order limits, preparation times, and customer cancellation rules.
                </p>
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Accepting Online Orders"
                  description="Master switch to open or temporarily pause new customer order intake across the SolCafe platform."
                  checked={settings.order.acceptingOrders}
                  onChange={(checked) => updateOrder("acceptingOrders", checked)}
                />

                <Toggle
                  label="Allow Customer Order Cancellation"
                  description="Permit customers to cancel pending orders within a configured grace time window."
                  checked={settings.order.allowCustomerCancellation}
                  onChange={(checked) => updateOrder("allowCustomerCancellation", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <Input
                  label="Minimum Order Amount"
                  type="number"
                  step="0.50"
                  min="0"
                  placeholder="5.00"
                  value={settings.order.minOrderAmount}
                  onChange={(e) => updateOrder("minOrderAmount", parseFloat(e.target.value) || 0)}
                />

                <Input
                  label="Estimated Preparation Time"
                  placeholder="15-20 min"
                  value={settings.order.estimatedPrepTime}
                  onChange={(e) => updateOrder("estimatedPrepTime", e.target.value)}
                />

                <Input
                  label="Cancellation Window (Minutes)"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="5"
                  value={settings.order.cancellationWindowMinutes}
                  onChange={(e) =>
                    updateOrder("cancellationWindowMinutes", parseInt(e.target.value, 10) || 1)
                  }
                  disabled={!settings.order.allowCustomerCancellation}
                />
              </div>
            </Card>

            {/* Order Status Workflow Overview Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-[#2B211E] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C88A2B]" /> Active Order Lifecycle Sequence
                  </h4>
                  <p className="text-[11px] text-[#756B66]">
                    SolCafe order status transition pipeline managed in Firestore `making_orders`.
                  </p>
                </div>
                <Badge variant="gold">Standard Workflow</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <div className="flex items-center gap-2 font-extrabold text-[#D99A2B]">
                    <span className="w-2 h-2 rounded-full bg-[#D99A2B] animate-pulse" /> 1. Pending
                  </div>
                  <p className="text-[11px] text-[#756B66] mt-1">Newly placed by customer</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <div className="flex items-center gap-2 font-extrabold text-[#E07A2E]">
                    <span className="w-2 h-2 rounded-full bg-[#E07A2E]" /> 2. Preparing
                  </div>
                  <p className="text-[11px] text-[#756B66] mt-1">Kitchen / Barista crafting</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <div className="flex items-center gap-2 font-extrabold text-[#3A8F5B]">
                    <span className="w-2 h-2 rounded-full bg-[#3A8F5B]" /> 3. Ready
                  </div>
                  <p className="text-[11px] text-[#756B66] mt-1">Awaiting pickup/delivery</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <div className="flex items-center gap-2 font-extrabold text-[#2E8B82]">
                    <span className="w-2 h-2 rounded-full bg-[#2E8B82]" /> 4. Completed
                  </div>
                  <p className="text-[11px] text-[#756B66] mt-1">Order fulfilled & closed</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: PAYMENT SETTINGS */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-[#E8E1D9] pb-4">
                <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C88A2B]" /> Customer Payment Methods & Preferences
                </h3>
                <p className="text-xs text-[#756B66] mt-1">
                  Enable or disable customer checkout payment options for SolCafe app ordering.
                </p>
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Cash on Delivery (COD)"
                  description="Allow customers to select cash payment upon order pickup or physical delivery."
                  checked={settings.payment.enableCOD}
                  onChange={(checked) => updatePayment("enableCOD", checked)}
                />

                <Toggle
                  label="UPI Direct / QR Payment"
                  description="Enable instant UPI payment method option for mobile customer checkout."
                  checked={settings.payment.enableUPI}
                  onChange={(checked) => updatePayment("enableUPI", checked)}
                />

                <Toggle
                  label="Credit / Debit Card Payments"
                  description="Allow customers to select card payment option at checkout."
                  checked={settings.payment.enableCardPayments}
                  onChange={(checked) => updatePayment("enableCardPayments", checked)}
                />
              </div>
            </Card>

            {/* Current Payment Setup Status Cards */}
            <Card className="space-y-4">
              <div className="border-b border-[#E8E1D9] pb-3">
                <h4 className="text-sm font-extrabold text-[#2B211E]">SolCafe Active Payment Configurations</h4>
                <p className="text-[11px] text-[#756B66]">
                  Status of customer-facing payment choices available during checkout.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#2B211E]">Cash on Delivery</p>
                    <p className="text-[11px] text-[#756B66] mt-0.5">Physical Cash Tender</p>
                  </div>
                  {settings.payment.enableCOD ? (
                    <Badge variant="emerald">Enabled</Badge>
                  ) : (
                    <Badge variant="slate">Disabled</Badge>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#2B211E]">UPI Transfer</p>
                    <p className="text-[11px] text-[#756B66] mt-0.5">Unified Payments Interface</p>
                  </div>
                  {settings.payment.enableUPI ? (
                    <Badge variant="emerald">Enabled</Badge>
                  ) : (
                    <Badge variant="slate">Disabled</Badge>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#2B211E]">Card Payments</p>
                    <p className="text-[11px] text-[#756B66] mt-0.5">Credit / Debit Card</p>
                  </div>
                  {settings.payment.enableCardPayments ? (
                    <Badge variant="emerald">Enabled</Badge>
                  ) : (
                    <Badge variant="slate">Disabled</Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <Card className="space-y-6">
            <div className="border-b border-[#E8E1D9] pb-4">
              <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C88A2B]" /> Sound & Alert Notification Controls
              </h3>
              <p className="text-xs text-[#756B66] mt-1">
                Configure manager portal alerts for incoming orders, status changes, and staff actions.
              </p>
            </div>

            <div className="space-y-4">
              <Toggle
                label="New Order Audio Chime"
                description="Play an audible chime alert when a new customer order arrives in the stream."
                checked={settings.notifications.newOrderSound}
                onChange={(checked) => updateNotifications("newOrderSound", checked)}
              />

              <Toggle
                label="Order Status Update Alerts"
                description="Show pop-up notification toasts when order statuses transition in real-time."
                checked={settings.notifications.statusChangeAlerts}
                onChange={(checked) => updateNotifications("statusChangeAlerts", checked)}
              />

              <Toggle
                label="Staff & Shift Broadcast Alerts"
                description="Receive system notifications for staff role updates and logins."
                checked={settings.notifications.staffAlerts}
                onChange={(checked) => updateNotifications("staffAlerts", checked)}
              />

              <Toggle
                label="Browser Desktop Push Notifications"
                description="Allow SolCafe Manager to trigger OS desktop notifications when orders arrive."
                checked={settings.notifications.desktopNotifications}
                onChange={handleToggleDesktopNotifications}
              />
            </div>
          </Card>
        )}

        {/* TAB 5: APPEARANCE */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-[#E8E1D9] pb-4">
                <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#C88A2B]" /> Portal Theme & Layout Customization
                </h3>
                <p className="text-xs text-[#756B66] mt-1">
                  Tailor the visual theme, layout density, and refresh rate of your manager workspace.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2B211E]">Manager Visual Theme</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => updateAppearance("theme", "amber-warm")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      settings.appearance.theme === "amber-warm" || settings.appearance.theme === "dark-default"
                        ? "bg-[#FAF8F5] border-[#3B2522] ring-2 ring-[#3B2522]/20"
                        : "bg-[#FFFFFF] border-[#E8E1D9] hover:border-[#D8CEC5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[#2B211E] flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-[#C88A2B]" /> SolCafe Light Theme (Default)
                      </span>
                      <Check className="w-4 h-4 text-[#C88A2B]" />
                    </div>
                    <p className="text-[11px] text-[#756B66] mt-2">
                      Espresso accents, cream surfaces, and warm neutral light aesthetics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Layout Density Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2B211E]">Sidebar Density</label>
                  <select
                    value={settings.appearance.sidebarDensity}
                    onChange={(e) => updateAppearance("sidebarDensity", e.target.value as DensityMode)}
                    className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
                  >
                    <option value="standard">Standard Navigation</option>
                    <option value="compact">Compact Dense Mode</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2B211E]">Table Row Spacing</label>
                  <select
                    value={settings.appearance.tableDensity}
                    onChange={(e) => updateAppearance("tableDensity", e.target.value as DensityMode)}
                    className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
                  >
                    <option value="comfortable">Comfortable Spacing</option>
                    <option value="compact">Compact Row Spacing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2B211E]">Auto-Refresh Interval</label>
                  <select
                    value={settings.appearance.autoRefreshInterval}
                    onChange={(e) => updateAppearance("autoRefreshInterval", parseInt(e.target.value, 10))}
                    className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
                  >
                    <option value={0}>Disabled (Real-Time Streams Only)</option>
                    <option value={10}>Every 10 Seconds</option>
                    <option value={30}>Every 30 Seconds</option>
                    <option value={60}>Every 60 Seconds</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-[#E8E1D9] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#2B211E] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C88A2B]" /> Account Security & Session Policies
                  </h3>
                  <p className="text-xs text-[#756B66] mt-1">
                    Manage your manager account security credentials and portal session rules.
                  </p>
                </div>
                <Badge variant="gold" className="capitalize">
                  {role || "Staff"} Account
                </Badge>
              </div>

              {/* Current Authenticated User Card */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D9] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3B2522] text-[#F5E1C0] border border-[#C88A2B] flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm">
                    {(profile?.displayName || user?.displayName || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2B211E]">
                      {profile?.displayName || user?.displayName || "SolCafe Account Holder"}
                    </h4>
                    <p className="text-xs text-[#756B66]">{user?.email || profile?.email || "No email bound"}</p>
                    <p className="text-[10px] text-[#9A918B] font-mono mt-0.5">UID: {user?.uid || profile?.uid || "demo-session"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleOpenProfileModal} className="gap-1.5">
                    <User className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSendPasswordReset} className="gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Password Reset Email
                  </Button>
                </div>
              </div>

              {/* Session Security Settings */}
              <div className="space-y-4 pt-2">
                <Toggle
                  label="Require Admin Confirmation for Destructive Actions"
                  description="Prompt for explicit confirmation before deleting menu items or altering user access permissions."
                  checked={settings.security.requireAdminConfirmation}
                  onChange={(checked) => updateSecurity("requireAdminConfirmation", checked)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2B211E]">
                      Session Inactivity Timeout
                    </label>
                    <select
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => updateSecurity("sessionTimeoutMinutes", parseInt(e.target.value, 10))}
                      className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
                    >
                      <option value={15}>15 Minutes Inactivity</option>
                      <option value={30}>30 Minutes Inactivity</option>
                      <option value={60}>60 Minutes Inactivity</option>
                      <option value={0}>Never Auto-Lock Session</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* RESET CONFIRMATION MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Reset to Default Settings"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#756B66]">
            Are you sure you want to reset all cafe operational preferences, order settings, and portal configurations back to their factory default values?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetDefaults} isLoading={isSaving}>
              Reset All Defaults
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Update Account Profile Details"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <Input
            label="Display Name"
            placeholder="SolCafe Manager"
            value={editDisplayName}
            onChange={(e) => setEditDisplayName(e.target.value)}
            required
          />

          <Input
            label="Contact Phone Number"
            placeholder="+1 (555) 0199"
            value={editPhoneNumber}
            onChange={(e) => setEditPhoneNumber(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E1D9]">
            <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdatingProfile}>
              Save Profile Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
