"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheck, FiHeart, FiMinus, FiPlus, FiShield, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";
import { useCart } from "@/Context/cart";
import api from "@/lib/api";
import { catalogProducts, findCatalogProduct, getProductImage } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const { setCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      const fallback = findCatalogProduct(slug);
      if (fallback) {
        setProduct(fallback);
        setSelectedImage(getProductImage(fallback));
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const { data } = await api.get(`/api/v1/product/get-product/${slug}`, { timeout: 2500, noRetry: true });
        const nextProduct = data?.product || fallback;
        setProduct(nextProduct || null);
        setSelectedImage(getProductImage(nextProduct));
      } catch {
        setProduct(fallback || null);
        setSelectedImage(getProductImage(fallback));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const related = useMemo(() => {
    if (!product) return [];
    return catalogProducts
      .filter((item) => item.category?.slug === product.category?.slug && item.slug !== product.slug)
      .slice(0, 4);
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [getProductImage(product)];
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    setCart((current) => {
      const existing = Array.isArray(current) ? current : [];
      return [...existing, ...Array.from({ length: quantity }, () => product)];
    });
    toast.success(`${quantity} x ${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="section-container grid gap-10 py-12 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-[2rem]" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-28 rounded-full" />
            <div className="skeleton h-12 w-4/5 rounded-2xl" />
            <div className="skeleton h-4 w-full rounded-xl" />
            <div className="skeleton h-4 w-2/3 rounded-xl" />
            <div className="skeleton h-14 w-48 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <h1 className="font-display text-3xl font-semibold text-espresso-900">Product not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">That dessert is not available right now.</p>
        <Link href="/products" className="btn-luxury mt-6 gap-2"><FiArrowLeft /> Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-cream-deep bg-cream-warm py-4">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-gold-dark">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gold-dark">Shop</Link>
            <span>/</span>
            <span className="truncate font-semibold text-espresso-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="section-container py-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-cream-deep bg-cream-warm shadow-luxury">
              <Image src={selectedImage || getProductImage(product)} alt={product.name} fill priority className="object-cover transition duration-500 hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" />
              {product.discount > 0 && (
                <span className="absolute left-5 top-5 rounded-full bg-espresso-900 px-4 py-2 text-xs font-bold text-cream shadow-card">
                  {product.discount}% off
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border transition ${selectedImage === image ? "border-gold shadow-gold" : "border-cream-deep hover:border-gold/50"}`}
                >
                  <Image src={image} alt={product.name} fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="self-start rounded-[2rem] border border-cream-deep bg-white p-6 shadow-card md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="badge-luxury">{product.category?.name || "Dessert"}</span>
              {product.trending && <span className="rounded-full bg-blush-light px-3 py-1 text-xs font-semibold text-blush-rose">Trending</span>}
              {product.quantity > 0 && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">In stock</span>}
            </div>

            <h1 className="font-display text-4xl font-semibold leading-tight text-espresso-900">{product.name}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FiStar key={index} size={16} fill={index < Math.round(product.rating || 5) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-ink-muted">{product.rating || 5} rating · {product.reviewCount || 24} reviews</span>
            </div>

            <p className="mt-5 text-base leading-8 text-ink-muted">{product.description}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-5xl font-bold text-espresso-900">₹{product.price}</span>
              {product.originalPrice && <span className="pb-2 text-lg text-ink-muted line-through">₹{product.originalPrice}</span>}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-14 w-36 items-center justify-between rounded-full border border-cream-deep bg-cream-warm px-3">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-full p-2 hover:bg-white"><FiMinus size={14} /></button>
                <span className="font-semibold text-espresso-900">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(12, value + 1))} className="rounded-full p-2 hover:bg-white"><FiPlus size={14} /></button>
              </div>
              <button onClick={handleAddToCart} disabled={added} className="btn-luxury flex-1 gap-3 py-4 text-base disabled:opacity-70">
                {added ? <><FiCheck /> Added</> : <><FiShoppingBag /> Add to Cart</>}
              </button>
              <button className="flex h-14 w-14 items-center justify-center rounded-full border border-cream-deep text-espresso-900 transition hover:border-gold hover:text-gold-dark">
                <FiHeart size={18} />
              </button>
            </div>

            <div className="mt-7 grid gap-3 border-t border-cream-deep pt-6 sm:grid-cols-3">
              {[
                { icon: <FiTruck />, title: "Fresh pickup", text: "Same-day slots" },
                { icon: <FiShield />, title: "Eggless", text: "No preservatives" },
                { icon: <FiCheck />, title: "Gift ready", text: "Premium packed" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-cream-warm p-4">
                  <div className="mb-2 text-gold-dark">{item.icon}</div>
                  <p className="text-sm font-semibold text-espresso-900">{item.title}</p>
                  <p className="text-xs text-ink-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-container pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="section-label">You may also like</span>
            <h2 className="section-title mt-1">More from this collection</h2>
          </div>
          <Link href="/products" className="hidden text-sm font-semibold text-gold-dark hover:text-espresso-900 md:block">View all</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => (
            <ProductCard key={item._id} product={item} index={index} size="sm" />
          ))}
        </div>
      </section>
    </div>
  );
}
