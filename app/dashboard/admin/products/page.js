"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiEdit3, FiFilter, FiMoreHorizontal, FiPackage, FiPlus, FiSearch, FiStar, FiTrash2 } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { catalogCategories, catalogProducts, getProductImage, normalizeProducts } from "@/lib/catalog";

export default function AdminProductsPage() {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/v1/product/product-list", { timeout: 2500, noRetry: true });
        setApiProducts(data?.products || []);
      } catch {
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const products = normalizeProducts(apiProducts);
  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalized || [product.name, product.description, product.category?.name].join(" ").toLowerCase().includes(normalized);
      const matchesCategory = category === "all" || product.category?.slug === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, products, query]);

  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.includes(product._id));
  const toggleAll = () => {
    setSelected(allVisibleSelected ? [] : visibleProducts.map((product) => product._id));
  };
  const toggleProduct = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <AdminShell
      title="Products"
      subtitle="Manage inventory, merchandising, stock, pricing, SEO, variants, and bulk product operations."
      actions={
        <Link href="/dashboard/admin/create-product" className="btn-luxury hidden gap-2 md:inline-flex">
            <FiPlus size={16} />
            Add Product
          </Link>
      }
    >
        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          {[
            { label: "Total products", value: products.length, icon: <FiPackage /> },
            { label: "Featured", value: products.filter((item) => item.featured).length, icon: <FiStar /> },
            { label: "Low stock", value: products.filter((item) => (item.quantity || item.stock || 0) < 12).length, icon: <FiFilter /> },
            { label: "Selected", value: selected.length, icon: <FiMoreHorizontal /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] border border-cream-deep bg-white p-5 shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-dark">{stat.icon}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{stat.label}</p>
              <p className="font-display text-3xl font-bold text-espresso-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-cream-deep bg-white shadow-card">
          <div className="border-b border-cream-deep p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, flavours, categories..."
                  className="h-12 w-full rounded-2xl bg-cream-warm pl-11 pr-4 text-sm outline-none ring-gold/30 focus:ring-2"
                />
              </div>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 rounded-2xl border border-cream-deep bg-white px-4 text-sm outline-none focus:border-gold"
              >
                <option value="all">All categories</option>
                {catalogCategories.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
              <button className="h-12 rounded-2xl border border-cream-deep px-4 text-sm font-semibold text-espresso-900 transition hover:border-gold">
                Bulk actions
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-cream-warm text-xs uppercase tracking-widest text-ink-muted">
                  <tr>
                    <th className="w-12 px-5 py-4">
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-[#D4A853]" />
                    </th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {visibleProducts.map((product) => (
                    <tr key={product._id} className="transition hover:bg-cream/70">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleProduct(product._id)} className="h-4 w-4 accent-[#D4A853]" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-cream-warm">
                            <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-body font-semibold text-espresso-900">{product.name}</p>
                            <p className="truncate text-xs text-ink-muted">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted">{product.category?.name || "Unassigned"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.featured ? "bg-gold/15 text-gold-dark" : "bg-cream-warm text-ink-muted"}`}>
                          {product.featured ? "Featured" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-espresso-900">{product.quantity || product.stock || 0}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-espresso-900">₹{product.price}</td>
                      <td className="px-5 py-4 text-sm text-ink-muted">{product.rating || 5} ({product.reviewCount || 0})</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products/${product.slug}`} className="rounded-full border border-cream-deep p-2 text-ink-muted transition hover:border-gold hover:text-gold-dark">
                            <FiEdit3 size={15} />
                          </Link>
                          <button className="rounded-full border border-cream-deep p-2 text-ink-muted transition hover:border-blush hover:text-blush-rose">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </AdminShell>
  );
}
