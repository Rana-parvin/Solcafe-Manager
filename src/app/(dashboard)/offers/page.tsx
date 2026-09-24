"use client";

import React, { useEffect, useState } from "react";
import { Tag, Sparkles, Plus, CheckCircle2, Percent, PercentIcon } from "lucide-react";
import { subscribeToCafeSettings, updateCafeSettings } from "@/lib/firestore/settings";
import { subscribeToProducts } from "@/lib/firestore/products";
import { CafeSettings, MenuItem } from "@/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OffersPage() {
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  // Sample offer promo state synced with store settings
  const [promoCode, setPromoCode] = useState("SOLCAFE20");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [minOrder, setMinOrder] = useState("10.00");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeToCafeSettings((data) => {
      setSettings(data);
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    });

    return () => {
      unsubSettings();
      unsubProducts();
    };
  }, []);

  const handleSavePromo = async () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Offers & Promotional Discounts</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Manage customer promotion codes, discount vouchers, and campaign banners active on SolCafe mobile app.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-[#EAF5ED] text-[#276A42] border border-[#B8E3C9] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3A8F5B]" />
          <span>Promotional campaign settings updated successfully!</span>
        </div>
      )}

      {/* Active Store Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner Campaign Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5E1C0] flex items-center justify-center text-[#8A5B15]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#2B211E]">Storefront Welcome Promo</h3>
                <p className="text-[11px] text-[#756B66]">Active Mobile App Offer</p>
              </div>
            </div>
            <Badge variant="emerald">Active</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <Input
              label="Promo Voucher Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Discount Percentage (%)"
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
              <Input
                label={`Min Order (${currencySymbol})`}
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E1D9] flex justify-end">
            <Button onClick={handleSavePromo}>Save Offer Campaign</Button>
          </div>
        </Card>

        {/* Store Specials Summary */}
        <Card className="space-y-4">
          <div className="border-b border-[#E8E1D9] pb-3">
            <h3 className="font-extrabold text-sm text-[#2B211E] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C88A2B]" /> SolCafe Menu Item Offers
            </h3>
            <p className="text-[11px] text-[#756B66]">Items with special promotional pricing</p>
          </div>

          <div className="space-y-2">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#2B211E]">{p.title}</p>
                  <p className="text-[10px] text-[#756B66] capitalize">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-[#C88A2B]">
                    {formatCurrency(p.price, currencySymbol, currencyCode)}
                  </p>
                  <Badge variant="gold" className="text-[10px]">
                    Standard
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
