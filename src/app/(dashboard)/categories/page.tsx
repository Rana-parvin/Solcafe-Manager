"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Coffee, Plus, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeToProducts } from "@/lib/firestore/products";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { MenuItem, FLUTTER_MENU_CATEGORIES } from "@/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function CategoriesPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  useEffect(() => {
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    const unsubSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Menu Category Management</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Organize SolCafe food & beverage menu categories shared with Flutter customer application.
          </p>
        </div>
        <Link href="/products">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Manage Catalog Items
          </Button>
        </Link>
      </div>

      {/* Category Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FLUTTER_MENU_CATEGORIES.map((catName) => {
          const catProducts = products.filter(
            (p) => (p.category || "").toLowerCase() === catName.toLowerCase()
          );
          const activeCount = catProducts.filter(
            (p) => p.isAvailable !== false && (p.availableQuantity ?? 0) > 0
          ).length;
          const totalStock = catProducts.reduce(
            (acc, p) => acc + (p.availableQuantity ?? 0),
            0
          );

          return (
            <Card key={catName} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9] flex items-center justify-center text-[#C88A2B] shrink-0 font-bold">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#2B211E] capitalize">
                      {catName}
                    </h3>
                    <p className="text-[11px] text-[#756B66]">
                      {catProducts.length} Total Menu Item{catProducts.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <Badge variant="gold" className="capitalize">
                  {catName}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <p className="text-[10px] text-[#756B66] font-medium">In Stock Items</p>
                  <p className="text-lg font-bold text-[#3A8F5B] mt-0.5">
                    {activeCount} / {catProducts.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D9]">
                  <p className="text-[10px] text-[#756B66] font-medium">Available Units</p>
                  <p className="text-lg font-bold text-[#2B211E] mt-0.5">
                    {totalStock} units
                  </p>
                </div>
              </div>

              {/* Sample Items Preview */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-[#756B66] uppercase tracking-wider">
                  Sample Items
                </p>
                {catProducts.length === 0 ? (
                  <p className="text-xs text-[#9A918B] italic">No items created in this category yet.</p>
                ) : (
                  <div className="space-y-1">
                    {catProducts.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#FAF8F5]/80"
                      >
                        <span className="font-semibold text-[#2B211E] truncate max-w-[150px]">
                          {item.title}
                        </span>
                        <span className="font-mono text-[#C88A2B] font-bold">
                          {formatCurrency(item.price, currencySymbol, currencyCode)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E8E1D9] flex justify-end">
                <Link
                  href={`/products?category=${encodeURIComponent(catName)}`}
                  className="text-xs font-bold text-[#3B2522] hover:text-[#C88A2B] flex items-center gap-1 transition-colors"
                >
                  View Category Items &rarr;
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
