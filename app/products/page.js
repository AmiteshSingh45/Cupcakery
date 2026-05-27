"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiSearch, FiSliders, FiX, FiRefreshCcw } from "react-icons/fi";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { catalogCategories, catalogProducts, normalizeProducts } from "@/lib/catalog";

const priceRanges = [
  { label: "Under ₹250", value: "0-250", min: 0, max: 250 },
  { label: "₹250 to ₹500", value: "250-500", min: 250, max: 500 },
  { label: "₹500 to ₹900", value: "500-900", min: 500, max: 900 },
  { label: "Above ₹900", value: "900-5000", min: 900, max: 5000 },
];

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

function ProductFilters({ selectedCategories, setSelectedCategories, selectedPrice, setSelectedPrice, activeOnly, setActiveOnly }) {
  const toggleCategory = (slug) => {
    setSelectedCategories((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-body font-semibold text-ink-muted uppercase tracking-[0.16em] mb-3">
          Collections
        </p>
        <div className="space-y-2">
          {catalogCategories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-warm">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                  className="h-4 w-4 rounded border-cream-deep accent-[#D4A853]"
                />
                <span className="text-sm font-body text-espresso-900">{category.name}</span>
              </span>
              <span className="text-xs text-ink-muted">{category.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-cream-deep/70" />

      <div>
        <p className="text-xs font-body font-semibold text-ink-muted uppercase tracking-[0.16em] mb-3">
          Price
        </p>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-warm">
              <input
                type="radio"
                name="price"
                checked={selectedPrice === range.value}
                onChange={() => setSelectedPrice(range.value)}
                className="h-4 w-4 accent-[#D4A853]"
              />
              <span className="text-sm font-body text-espresso-900">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-cream-deep/70" />

      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-cream-warm px-4 py-3">
        <span>
          <span className="block text-sm font-body font-semibold text-espresso-900">Bestsellers only</span>
          <span className="block text-xs text-ink-muted">Featured, trending, seasonal picks</span>
        </span>
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(event) => setActiveOnly(event.target.checked)}
          className="h-5 w-5 accent-[#D4A853]"
        />
      </label>
    </div>
  );
}

export default function ProductsPage() {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/product/product-list", { timeout: 2500, noRetry: true });
      setApiProducts(data?.products || []);
    } catch {
      setApiProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const sourceProducts = normalizeProducts(apiProducts);

  const filteredProducts = useMemo(() => {
    let next = [...sourceProducts];
    const normalizedQuery = query.trim().toLowerCase();
    const price = priceRanges.find((range) => range.value === selectedPrice);

    if (normalizedQuery) {
      next = next.filter((product) =>
        [product.name, product.description, product.category?.name, ...(product.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (selectedCategories.length) {
      next = next.filter((product) => selectedCategories.includes(product.category?.slug));
    }

    if (price) {
      next = next.filter((product) => product.price >= price.min && product.price <= price.max);
    }

    if (activeOnly) {
      next = next.filter((product) => product.featured || product.trending || product.seasonal);
    }

    if (sort === "price-asc") next.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price);
    if (sort === "rating") next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "newest") next.sort((a, b) => String(b._id).localeCompare(String(a._id)));
    if (sort === "featured") next.sort((a, b) => Number(b.featured || b.trending) - Number(a.featured || a.trending));

    return next;
  }, [activeOnly, query, selectedCategories, selectedPrice, sort, sourceProducts]);

  const activeFilterCount = selectedCategories.length + (selectedPrice ? 1 : 0) + (activeOnly ? 1 : 0);
  const resetFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedPrice("");
    setActiveOnly(false);
    setSort("featured");
  };

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-cream-deep/60 bg-luxury-warm py-12">
        <div className="section-container">
          <div className="max-w-3xl">
            <span className="section-label">Premium Menu</span>
            <h1 className="section-title mt-2">Handcrafted Dessert Shop</h1>
            <p className="section-subtitle mt-3">
              Browse {catalogProducts.length}+ eggless cupcakes, cakes, brownies, macarons, hampers, and celebration desserts curated for gifting and everyday cravings.
            </p>
          </div>
        </div>
      </section>

      <section className="section-container py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[2rem] border border-cream-deep/60 bg-white p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-espresso-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs font-body font-semibold text-gold-dark hover:text-espresso-900">
                    Reset
                  </button>
                )}
              </div>
              <ProductFilters
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                activeOnly={activeOnly}
                setActiveOnly={setActiveOnly}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 rounded-[2rem] border border-cream-deep/60 bg-white p-3 shadow-card">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search chocolate, hampers, macarons..."
                    className="h-12 w-full rounded-2xl bg-cream-warm pl-11 pr-4 text-sm text-espresso-900 outline-none ring-gold/30 transition focus:ring-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cream-deep px-4 text-sm font-semibold text-espresso-900 lg:hidden"
                  >
                    <FiSliders size={16} />
                    Filters
                    {activeFilterCount > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px]">{activeFilterCount}</span>}
                  </button>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-12 rounded-2xl border border-cream-deep bg-white px-4 text-sm font-body text-espresso-900 outline-none focus:border-gold"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">
                Showing <span className="font-semibold text-espresso-900">{filteredProducts.length}</span> treats
              </p>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="inline-flex items-center gap-2 rounded-full border border-blush px-4 py-2 text-xs font-semibold text-blush-rose transition hover:bg-blush-light">
                  <FiRefreshCcw size={13} />
                  Clear all
                </button>
              )}
            </div>

            {loading ? (
              <SkeletonGrid count={9} />
            ) : filteredProducts.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id || product.slug} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-cream-deep bg-white px-6 py-20 text-center shadow-card">
                <FiFilter size={38} className="mx-auto mb-4 text-cream-deep" />
                <h3 className="font-display text-2xl font-semibold text-espresso-900">No treats match that mix</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Try removing a filter or searching for a broader flavour.</p>
                <button onClick={resetFilters} className="btn-luxury-outline mt-6">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-espresso-900/45 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col bg-white shadow-luxury"
            >
              <div className="flex items-center justify-between border-b border-cream-deep px-6 py-5">
                <h2 className="font-display text-xl font-semibold text-espresso-900">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="rounded-full bg-cream-warm p-2 text-espresso-900">
                  <FiX size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ProductFilters
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                  activeOnly={activeOnly}
                  setActiveOnly={setActiveOnly}
                />
              </div>
              <div className="border-t border-cream-deep p-5">
                <button onClick={() => setFilterOpen(false)} className="btn-luxury w-full">Show {filteredProducts.length} Treats</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
