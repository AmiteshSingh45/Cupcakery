"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { catalogCategories, getCatalogByCategory } from "@/lib/catalog";

export default function CategoryPage() {
  const { slug } = useParams();
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = useMemo(
    () => catalogCategories.find((item) => item.slug === slug) || { name: "Collection", slug },
    [slug]
  );

  useEffect(() => {
    if (!slug) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/v1/product/product-category/${slug}`, { timeout: 2500, noRetry: true });
        setApiProducts(data?.products || []);
      } catch {
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  const products = apiProducts.length ? apiProducts : getCatalogByCategory(slug);

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-cream-deep/60 bg-luxury-warm py-12">
        <div className="section-container">
          <span className="section-label">Collection</span>
          <h1 className="section-title mt-2">{category.name}</h1>
          <p className="section-subtitle mt-3">
            Premium eggless {String(category.name).toLowerCase()} made fresh in small batches for gifting, parties, and everyday indulgence.
          </p>
        </div>
      </section>

      <section className="section-container py-10">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product._id || product.slug} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-cream-deep bg-white px-6 py-20 text-center shadow-card">
            <h3 className="font-display text-2xl font-semibold text-espresso-900">This collection is resting</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Browse the full menu while we prep more fresh treats.</p>
            <Link href="/products" className="btn-luxury mt-6">View All Products</Link>
          </div>
        )}
      </section>
    </div>
  );
}
