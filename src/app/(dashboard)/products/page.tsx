"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Coffee,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from "@/lib/firestore/products";
import { MenuItem, FLUTTER_MENU_CATEGORIES } from "@/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { subscribeToCafeSettings } from "@/lib/firestore/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { ImageUploader } from "@/components/ui/ImageUploader";

export default function ProductsPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Currency & Settings State
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("coffee");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeProducts = subscribeToProducts((items) => {
      setProducts(items);
      setLoading(false);
    }, selectedCategory);

    const unsubscribeSettings = subscribeToCafeSettings((data) => {
      setCurrencySymbol(data.general.currencySymbol || data.payment.currencySymbol || "₹");
      setCurrencyCode(data.general.currency || data.payment.currency || "INR");
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, [selectedCategory]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("4.99");
    setCategory("coffee");
    setImage("");
    setSelectedFile(null);
    setAvailableQuantity(0);
    setSizes(["S", "M", "L"]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: MenuItem) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category || "coffee");
    setImage(product.image || "");
    setSelectedFile(null);
    setAvailableQuantity(product.availableQuantity !== undefined ? product.availableQuantity : (product.isAvailable !== false ? 10 : 0));
    setSizes(product.sizes || ["S", "M", "L"]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !price.trim()) {
      setFormError("Product title and price are required.");
      return;
    }

    if (!image || image.trim() === "") {
      setFormError("A valid 16:9 product image is required. Please upload a product image from your device before saving.");
      return;
    }

    setIsSubmitting(true);
    const qty = Math.max(0, Math.floor(availableQuantity));

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          image,
          sizes,
          availableQuantity: qty,
          isAvailable: qty > 0,
        });
      } else {
        await createProduct({
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          image,
          sizes,
          availableQuantity: qty,
          isAvailable: qty > 0,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving product:", err);
      setFormError(err?.message || "Failed to save product to Cloud Firestore. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B211E]">Product Catalog Management</h1>
          <p className="text-xs text-[#756B66] mt-1">
            Manage SolCafe menu items in Cloud Firestore collection `items` shared with Flutter app.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filter Tabs & Search Bar Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D9]">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "All"
                ? "bg-[#3B2522] text-[#FFFFFF] shadow-sm"
                : "bg-[#FFFFFF] text-[#756B66] hover:text-[#2B211E] border border-[#E8E1D9]"
            }`}
          >
            All Items
          </button>
          {FLUTTER_MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-[#3B2522] text-[#FFFFFF] shadow-sm"
                  : "bg-[#FFFFFF] text-[#756B66] hover:text-[#2B211E] border border-[#E8E1D9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Products Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9A918B] text-xs animate-pulse">
            Loading products from Cloud Firestore `items` collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Coffee className="w-10 h-10 text-[#9A918B] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2B211E]">No menu items found</p>
            <p className="text-xs text-[#756B66] mt-1">
              Add products or adjust category filters to inspect menu items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#756B66] border-b border-[#E8E1D9] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price ({currencySymbol})</th>
                  <th className="py-3.5 px-4">Available Quantity</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9] text-[#2B211E]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-9 rounded-xl bg-[#FAF8F5] relative overflow-hidden border border-[#E8E1D9] shrink-0">
                          <Image
                            src={product.image || "/images/appicon_large_size_final.png"}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#2B211E]">{product.title}</p>
                          <p className="text-[11px] text-[#756B66] line-clamp-1 max-w-xs">
                            {product.description || "No detailed description provided."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <Badge variant="gold">{product.category}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#3B2522]">
                      {formatCurrency(product.price, currencySymbol, currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {(product.availableQuantity ?? 0) > 0 ? (
                        <span className="text-[#3A8F5B] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3A8F5B]" />
                          {product.availableQuantity} units
                        </span>
                      ) : (
                        <span className="text-[#C94A4A] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C94A4A] animate-pulse" />
                          0 units (Out of Stock)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[10px] text-[#2B211E] font-mono border border-[#E8E1D9] font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleProductAvailability(product.id, !!product.isAvailable, product.availableQuantity)}
                        className="flex items-center gap-1.5 text-xs focus:outline-none"
                      >
                        {product.isAvailable !== false && (product.availableQuantity ?? 0) > 0 ? (
                          <Badge variant="emerald" className="cursor-pointer">
                            <Eye className="w-3 h-3 mr-1" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="rose" className="cursor-pointer">
                            <EyeOff className="w-3 h-3 mr-1" /> Out of Stock
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModal(product)}
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4 text-[#C88A2B]" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-[#C94A4A]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit SolCafe Product" : "Add SolCafe Menu Product"}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F7B6B6] text-[#C94A4A] flex items-start gap-2.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Product Title / Name"
            placeholder="e.g. Hazelnut Caramel Latte"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2B211E]">Description</label>
            <textarea
              rows={3}
              placeholder="Rich espresso brewed with steamed milk and hazelnut syrup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-3 text-xs text-[#2B211E] focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={`Price (${currencySymbol})`}
              type="text"
              placeholder="4.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Input
              label="Available Quantity (Stock)"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={availableQuantity}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                setAvailableQuantity(isNaN(parsed) ? 0 : Math.max(0, parsed));
              }}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2B211E]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-2.5 text-xs text-[#2B211E] focus:outline-none focus:ring-2 focus:ring-[#C88A2B]/40 capitalize font-medium"
              >
                {FLUTTER_MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Device File Picker with 16:9 Aspect Ratio Validation */}
          <ImageUploader
            label="Product Image (Required 16:9)"
            description="Select an image from your device with a 16:9 aspect ratio (e.g. 1200 × 675 px)."
            value={image}
            onChange={(url, file) => {
              if (url !== undefined) setImage(url);
              if (file !== undefined) setSelectedFile(file);
              setFormError(null);
            }}
            onFileSelect={(file) => setSelectedFile(file)}
            folder="solcafe_products"
            aspectRatio="wide"
            require16by9={true}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E1D9]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Product Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#756B66]">
            Are you sure you want to delete this menu product from Cloud Firestore? This action will remove it from the SolCafe customer mobile application.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
