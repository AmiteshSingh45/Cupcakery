"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiImage, FiPlus, FiSave, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { catalogCategories } from "@/lib/catalog";

const defaultForm = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  salePrice: "",
  quantity: "",
  sku: "",
  category: "",
  subcategory: "",
  brand: "Bindi's Cupcakery",
  tags: "",
  ingredients: "",
  nutrition: "",
  allergens: "",
  weight: "",
  flavor: "",
  status: "Active",
  shipping: "1",
  featured: false,
  trending: false,
  newArrival: false,
  seoTitle: "",
  seoDescription: "",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return "h-12 w-full rounded-2xl border border-cream-deep bg-white px-4 text-sm text-espresso-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";
}

export default function CreateProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState(catalogCategories);
  const [photos, setPhotos] = useState([]);
  const [variants, setVariants] = useState([{ size: "Single", flavor: "", weight: "", price: "", stock: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/v1/category/get-category", { timeout: 2500, noRetry: true })
      .then(({ data }) => data?.category?.length && setCategories(data.category))
      .catch(() => setCategories(catalogCategories));
  }, []);

  const previews = useMemo(() => photos.map((photo) => ({ name: photo.name, url: URL.createObjectURL(photo) })), [photos]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth") || "{}")?.token : "";

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!token) return toast.error("Please login as admin first.");
    if (!form.name || !form.description || !form.price || !form.quantity || !form.category) {
      return toast.error("Name, description, price, stock, and category are required.");
    }

    setSaving(true);
    try {
      const productData = new FormData();
      productData.append("name", form.name);
      productData.append("description", `${form.shortDescription ? `${form.shortDescription}\n\n` : ""}${form.description}`);
      productData.append("price", form.salePrice || form.price);
      productData.append("quantity", form.quantity);
      productData.append("category", form.category);
      productData.append("shipping", form.shipping);
      productData.append("featured", form.featured);
      productData.append("tag", form.trending ? "Trending" : form.newArrival ? "New" : "");
      if (photos[0]) productData.append("photo", photos[0]);

      const { data } = await api.post("/api/v1/product/create-product", productData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (data?.success) {
        toast.success("Product created successfully");
        router.push("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Could not create product");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong while creating the product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Create Product" subtitle="Build a rich bakery product listing with merchandising, inventory, variants, and SEO metadata.">
      <form onSubmit={handleCreate} className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title="Product Information" subtitle="Core customer-facing details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name">
                <input className={inputClass()} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Belgian Chocolate Cloud Cupcake" />
              </Field>
              <Field label="SKU">
                <input className={inputClass()} value={form.sku} onChange={(event) => update("sku", event.target.value)} placeholder="CUP-CHO-001" />
              </Field>
              <Field label="Short description">
                <input className={inputClass()} value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} placeholder="Rich chocolate cupcake with ganache center" />
              </Field>
              <Field label="Brand">
                <input className={inputClass()} value={form.brand} onChange={(event) => update("brand", event.target.value)} />
              </Field>
              <Field label="Full description">
                <textarea className={`${inputClass()} min-h-36 py-3 md:col-span-2`} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe texture, flavor, freshness, packaging, and serving guidance." />
              </Field>
            </div>
          </Panel>

          <Panel title="Pricing & Inventory" subtitle="Price, sale price, stock, delivery, and inventory readiness">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["price", "Price"],
                ["salePrice", "Sale price"],
                ["quantity", "Stock"],
                ["weight", "Weight"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input type={key === "weight" ? "text" : "number"} className={inputClass()} value={form[key]} onChange={(event) => update(key, event.target.value)} />
                </Field>
              ))}
              <Field label="Delivery availability">
                <select className={inputClass()} value={form.shipping} onChange={(event) => update("shipping", event.target.value)}>
                  <option value="1">Available</option>
                  <option value="0">Pickup only</option>
                </select>
              </Field>
              <Field label="Product status">
                <select className={inputClass()} value={form.status} onChange={(event) => update("status", event.target.value)}>
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                  <option>Out of stock</option>
                </select>
              </Field>
              <Field label="Flavor">
                <input className={inputClass()} value={form.flavor} onChange={(event) => update("flavor", event.target.value)} placeholder="Chocolate, rose, mango..." />
              </Field>
              <Field label="Subcategory">
                <input className={inputClass()} value={form.subcategory} onChange={(event) => update("subcategory", event.target.value)} placeholder="Mini cupcakes" />
              </Field>
            </div>
          </Panel>

          <Panel title="Variants" subtitle="Dynamic size, flavor, weight, pricing, and stock rows">
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid gap-3 rounded-2xl bg-cream-warm p-3 md:grid-cols-5">
                  {["size", "flavor", "weight", "price", "stock"].map((key) => (
                    <input
                      key={key}
                      className={inputClass()}
                      value={variant[key]}
                      placeholder={key}
                      onChange={(event) => setVariants((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: event.target.value } : item))}
                    />
                  ))}
                </div>
              ))}
              <button type="button" onClick={() => setVariants((current) => [...current, { size: "", flavor: "", weight: "", price: "", stock: "" }])} className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-4 py-3 text-sm font-bold text-espresso-900">
                <FiPlus /> Add Variant
              </button>
            </div>
          </Panel>

          <Panel title="Product SEO" subtitle="Search engine metadata for product pages">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title"><input className={inputClass()} value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></Field>
              <Field label="Tags"><input className={inputClass()} value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="eggless, cupcake, chocolate" /></Field>
              <Field label="SEO description"><textarea className={`${inputClass()} min-h-28 py-3 md:col-span-2`} value={form.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing" subtitle="Category and merchandising flags">
            <div className="space-y-4">
              <Field label="Category">
                <select className={inputClass()} value={form.category} onChange={(event) => update("category", event.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </Field>
              {[
                ["featured", "Featured product"],
                ["trending", "Trending product"],
                ["newArrival", "New arrival"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-2xl bg-cream-warm p-4 text-sm font-bold text-espresso-900">
                  {label}
                  <input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} className="h-5 w-5 accent-[#D4A853]" />
                </label>
              ))}
            </div>
          </Panel>

          <Panel title="Images" subtitle="Multiple image upload preview">
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-cream-deep bg-cream-warm p-6 text-center transition hover:border-gold">
              <FiUploadCloud size={34} className="mb-3 text-gold-dark" />
              <p className="font-semibold text-espresso-900">Drop images or browse</p>
              <p className="text-xs text-ink-muted">First image is sent to current backend. UI supports multi-image workflow.</p>
              <input type="file" multiple accept="image/*" hidden onChange={(event) => setPhotos(Array.from(event.target.files || []))} />
            </label>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {previews.map((preview, index) => (
                <div key={preview.url} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-warm">
                  <Image src={preview.url} alt={preview.name} fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 hidden rounded-full bg-white p-2 text-blush-rose shadow-card group-hover:block">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
              {!previews.length && <div className="col-span-3 rounded-2xl bg-cream-warm p-6 text-center text-sm text-ink-muted"><FiImage className="mx-auto mb-2" />No images selected</div>}
            </div>
          </Panel>

          <Panel title="Food Details" subtitle="Ingredients, nutrition, allergens">
            <div className="space-y-4">
              {[
                ["ingredients", "Ingredients"],
                ["nutrition", "Nutritional info"],
                ["allergens", "Allergens"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <textarea className={`${inputClass()} min-h-24 py-3`} value={form[key]} onChange={(event) => update(key, event.target.value)} />
                </Field>
              ))}
            </div>
          </Panel>

          <button disabled={saving} className="btn-luxury w-full gap-2 py-4 text-base disabled:opacity-60">
            <FiSave />
            {saving ? "Saving Product..." : "Save Product"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
