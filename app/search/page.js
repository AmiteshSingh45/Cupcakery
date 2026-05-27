"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import { catalogProducts } from "@/lib/catalog";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return catalogProducts.filter((product) =>
      [product.name, product.description, product.category?.name, ...(product.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-cream-deep/60 bg-luxury-warm py-12">
        <div className="section-container text-center">
          <span className="section-label">Search</span>
          <h1 className="section-title mt-2">{query ? `Results for "${query}"` : "Search the Bakery"}</h1>
          <p className="section-subtitle mx-auto mt-3">
            {query ? `${results.length} premium treats found.` : "Use the search in the navigation to find cakes, brownies, hampers, cookies, and more."}
          </p>
        </div>
      </section>

      <section className="section-container py-10">
        {results.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-cream-deep bg-white px-6 py-20 text-center shadow-card">
            <FiSearch size={42} className="mx-auto mb-4 text-cream-deep" />
            <h3 className="font-display text-2xl font-semibold text-espresso-900">No matching treats yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Try chocolate, hamper, cupcake, macaron, or browse the full menu.</p>
            <Link href="/products" className="btn-luxury mt-6">View All Products</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SearchResults />
    </Suspense>
  );
}
