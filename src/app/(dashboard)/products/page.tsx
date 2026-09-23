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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function ProductsPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("coffee");
  const [image, setImage] = useState("");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((items) => {
      setProducts(items);
      setLoading(false);
    }, selectedCategory);

    return () => unsubscribe();
  }, [selectedCategory]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("4.99");
    setCategory("coffee");
    setImage("https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60");
    setSizes(["S", "M", "L"]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: MenuItem) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category || "coffee");
    setImage(product.image);
    setSizes(product.sizes || ["S", "M", "L"]);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title,
          description,
          price,
          category,
          image,
          sizes,
        });
      } else {
        await createProduct({
          title,
          description,
          price,
          category,
          image,
          sizes,
          isAvailable: true,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await fetch("/api/cloudinary/sign");
      const signData = await res.json();

      if (!signData.cloudName || !signData.apiKey) {
        // Fallback to demo uploaded image URL
        setImage("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60");
        setUploadingImage(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp.toString());
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await uploadRes.json();
      if (data.secure_url) {
        setImage(data.secure_url);
      }
    } catch (err) {
      console.warn("Cloudinary upload fallback:", err);
      setImage("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Product Catalog Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage SolCafe menu items in Firestore collection `items` shared with Flutter app.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-amber-500 text-slate-950 font-semibold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Items
          </button>
          {FLUTTER_MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading products from Firestore `items` collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Coffee className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No menu items found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add products or adjust category filters to inspect menu items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-800 relative overflow-hidden border border-slate-700/60 shrink-0">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{product.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {product.description || "No detailed description provided."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <Badge variant="amber">{product.category}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleProductAvailability(product.id, !!product.isAvailable)}
                        className="flex items-center gap-1.5 text-xs focus:outline-none"
                      >
                        {product.isAvailable !== false ? (
                          <Badge variant="emerald" className="cursor-pointer">
                            <Eye className="w-3 h-3 mr-1" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="rose" className="cursor-pointer">
                            <EyeOff className="w-3 h-3 mr-1" /> Disabled
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
                          <Edit2 className="w-4 h-4 text-amber-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit SolCafe Product" : "Add SolCafe Menu Product"}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <Input
            label="Product Title / Name"
            placeholder="e.g. Hazelnut Caramel Latte"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Rich espresso brewed with steamed milk and hazelnut syrup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="text"
              placeholder="4.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 capitalize"
              >
                {FLUTTER_MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cloudinary Image Upload & Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Product Image (Cloudinary Storage)</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden shrink-0">
                {image ? (
                  <Image src={image} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Coffee className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  placeholder="https://res.cloudinary.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-400 cursor-pointer border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingImage ? "Uploading to Cloudinary..." : "Upload via Cloudinary"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
          <p className="text-slate-300">
            Are you sure you want to delete this menu product from Firestore? This action will remove it from the SolCafe customer mobile application.
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
