"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingBag, FiEye, FiStar } from "react-icons/fi";
import { useCart } from "@/Context/cart";
import { getProductImage } from "@/lib/catalog";
import toast from "react-hot-toast";

/**
 * PremiumProductCard — canonical product card used across all pages
 *
 * Props:
 *   product  {object}  — product data from API
 *   size     {string}  — "sm" | "md" (default) | "lg"
 *   index    {number}  — for staggered animation delay
 *   dark     {boolean} — dark background variant
 */
export default function ProductCard({ product, size = "md", index = 0, dark = false }) {
  const { cart, setCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!Array.isArray(cart)) setCart([]);
    setCart((prev) => [...prev, product]);
    toast.success(`${product.name} added to cart!`, {
      icon: "🧁",
    });
  };

  const imageHeight = size === "sm" ? "h-44" : size === "lg" ? "h-72" : "h-56";
  const cardBase = dark
    ? "bg-white/5 border-white/10 hover:border-gold/30"
    : "bg-white border-cream-deep/40 hover:border-gold/20";

  // Render star rating
  const rating = product.rating ?? 5;
  const reviewCount = product.reviewCount ?? 0;
  const productImage = getProductImage(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative rounded-3xl overflow-hidden border shadow-card
                  hover:shadow-card-hover hover:-translate-y-2
                  transition-all duration-500 ease-luxury
                  flex flex-col ${cardBase}`}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className={`relative ${imageHeight} overflow-hidden flex-shrink-0`}>
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/70 via-espresso-900/10 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Tag badge */}
        {product.tag && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gold text-espresso-900
                           text-[11px] font-body font-bold tracking-wide shadow-gold">
            {product.tag}
          </span>
        )}

        {product.discount > 0 && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-espresso-900/85 text-cream text-[11px] font-body font-bold shadow-card">
            {product.discount}% off
          </span>
        )}

        {/* Featured badge */}
        {product.featured && !product.tag && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blush-rose text-white
                           text-[11px] font-body font-bold tracking-wide">
            ✦ Featured
          </span>
        )}

        {/* Hover action buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2.5
                        opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0
                        transition-all duration-400">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
                       bg-white/90 backdrop-blur-sm text-espresso-900
                       text-xs font-body font-semibold
                       hover:bg-white transition-all shadow-sm"
          >
            <FiEye size={13} /> Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
                       bg-gold text-espresso-900
                       text-xs font-body font-semibold
                       hover:bg-gold-light transition-all shadow-gold"
          >
            <FiShoppingBag size={13} /> Add
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category label */}
        {product.category?.name && (
          <span className={`text-[10px] font-body font-semibold tracking-[0.15em] uppercase mb-2 ${
            dark ? "text-gold/70" : "text-gold-dark"
          }`}>
            {product.category.name}
          </span>
        )}

        {/* Product name */}
        <h3 className={`font-display font-semibold text-base leading-snug mb-1.5 line-clamp-2 ${
          dark ? "text-cream" : "text-espresso-900"
        }`}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={11}
                className={i < Math.round(rating) ? "text-gold" : "text-cream-deep"}
                style={{ fill: i < Math.round(rating) ? "currentColor" : "none" }}
              />
            ))}
          </div>
          {reviewCount > 0 && (
            <span className={`text-[10px] font-body ${dark ? "text-cream/40" : "text-ink-muted"}`}>
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Description */}
        {size !== "sm" && product.description && (
          <p className={`font-body text-xs leading-relaxed line-clamp-2 mb-4 flex-1 ${
            dark ? "text-cream/50" : "text-ink-muted"
          }`}>
            {product.description}
          </p>
        )}

        {/* Price + actions */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-cream-deep/30">
          <span className="flex flex-col">
            <span className={`font-body font-bold text-xl ${dark ? "text-gold" : "text-gold-dark"}`}>
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className={`text-xs line-through ${dark ? "text-cream/35" : "text-ink-muted/70"}`}>
                ₹{product.originalPrice}
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/products/${product.slug}`}
              className={`px-3 py-2 rounded-xl border text-xs font-body font-medium
                          transition-all duration-200 ${
                dark
                  ? "border-white/10 text-cream/60 hover:border-gold/50 hover:text-gold"
                  : "border-cream-deep text-ink hover:border-espresso-900 hover:text-espresso-900"
              }`}
            >
              Details
            </Link>
            <button
              onClick={handleAddToCart}
              className="px-3 py-2 rounded-xl bg-espresso-900 text-cream
                         text-xs font-body font-medium
                         hover:bg-gold hover:text-espresso-900
                         transition-all duration-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
