"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiEdit3, FiImage, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataToolbar, Panel, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { catalogCategories } from "@/lib/catalog";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState(catalogCategories);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ name: "", parent: "", image: "", featured: true, sort: 1 });
  const [selected, setSelected] = useState(null);
  const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth") || "{}")?.token : "";

  const getCategories = async () => {
    try {
      const { data } = await api.get("/api/v1/category/get-category", { timeout: 2500, noRetry: true });
      if (data?.category?.length) setCategories(data.category.map((cat, index) => ({ ...cat, image: catalogCategories[index % catalogCategories.length]?.image, featured: index % 2 === 0, sort: index + 1 })));
    } catch {
      setCategories(catalogCategories);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const visibleCategories = useMemo(() => categories.filter((cat) => cat.name.toLowerCase().includes(query.toLowerCase())), [categories, query]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return toast.error("Category name is required.");
    if (!token) return toast.error("Please login as admin first.");

    try {
      if (selected?._id && !String(selected._id).startsWith("cat-")) {
        await api.put(`/api/v1/category/update-category/${selected._id}`, { name: draft.name }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Category updated");
      } else {
        await api.post("/api/v1/category/create-category", { name: draft.name }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Category created");
      }
      setDraft({ name: "", parent: "", image: "", featured: true, sort: 1 });
      setSelected(null);
      getCategories();
    } catch {
      toast.error("Backend unavailable. Showing local category preview.");
      if (selected) {
        setCategories((current) => current.map((cat) => cat._id === selected._id ? { ...cat, ...draft } : cat));
      } else {
        setCategories((current) => [...current, { _id: `local-${Date.now()}`, slug: draft.name.toLowerCase().replace(/\s+/g, "-"), ...draft }]);
      }
    }
  };

  return (
    <AdminShell title="Category Management" subtitle="Create nested collections, upload imagery, feature categories, and control homepage/category sorting.">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Panel title={selected ? "Edit Category" : "Add Category"} subtitle="Category metadata and merchandising">
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Name</span>
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="h-12 w-full rounded-2xl border border-cream-deep px-4 text-sm outline-none focus:border-gold" placeholder="Cupcakes" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Parent category</span>
              <select value={draft.parent} onChange={(event) => setDraft((current) => ({ ...current, parent: event.target.value }))} className="h-12 w-full rounded-2xl border border-cream-deep px-4 text-sm outline-none focus:border-gold">
                <option value="">None</option>
                {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Image URL</span>
              <input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} className="h-12 w-full rounded-2xl border border-cream-deep px-4 text-sm outline-none focus:border-gold" placeholder="/hp_img2.jpg or Cloudinary URL" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-2xl bg-cream-warm p-4 text-sm font-bold text-espresso-900">
                <span className="mb-2 block">Featured</span>
                <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} className="h-5 w-5 accent-[#D4A853]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Sort</span>
                <input type="number" value={draft.sort} onChange={(event) => setDraft((current) => ({ ...current, sort: event.target.value }))} className="h-12 w-full rounded-2xl border border-cream-deep px-4 text-sm outline-none focus:border-gold" />
              </label>
            </div>
            <button className="btn-luxury w-full gap-2"><FiSave /> {selected ? "Update Category" : "Create Category"}</button>
          </form>
        </Panel>

        <div className="space-y-5">
          <DataToolbar search={query} setSearch={setQuery} actionLabel="Export Categories" />
          <Panel title="All Categories" subtitle="Nested, sortable, homepage-ready category list">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="text-xs uppercase tracking-widest text-ink-muted">
                  <tr>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Parent</th>
                    <th className="pb-3">Sort</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {visibleCategories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-cream-warm">
                            {cat.image ? <Image src={cat.image} alt={cat.name} fill className="object-cover" /> : <FiImage className="text-ink-muted" />}
                          </div>
                          <div>
                            <p className="font-semibold text-espresso-900">{cat.name}</p>
                            <p className="text-xs text-ink-muted">/{cat.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-ink-muted">{cat.parent || "Root"}</td>
                      <td className="py-4 text-sm font-semibold text-espresso-900">{cat.sort || index + 1}</td>
                      <td className="py-4"><StatusPill status={cat.featured ? "Featured" : "Active"} /></td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelected(cat); setDraft({ name: cat.name, parent: cat.parent || "", image: cat.image || "", featured: cat.featured ?? true, sort: cat.sort || index + 1 }); }} className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-gold hover:text-gold-dark"><FiEdit3 /></button>
                          <button className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-blush hover:text-blush-rose"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
