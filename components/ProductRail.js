"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

/**
 * ProductRail — horizontal scrolling product strip (like Theobroma's homepage rails)
 *
 * Props:
 *   products  {array}   — array of product objects
 *   dark      {boolean} — dark background variant
 *   loading   {boolean} — show skeleton state
 */
export default function ProductRail({ products = [], dark = false, loading = false }) {
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  const scroll = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  if (loading) {
    return (
      <div className="flex gap-5 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex-shrink-0 w-72 rounded-3xl overflow-hidden ${
              dark ? "bg-white/5" : "bg-cream-warm"
            } animate-pulse`}
          >
            <div className="h-56 w-full bg-cream-deep/40" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-16 rounded bg-cream-deep/60" />
              <div className="h-4 w-48 rounded bg-cream-deep/60" />
              <div className="h-3 w-32 rounded bg-cream-deep/60" />
              <div className="h-8 w-24 rounded-xl bg-cream-deep/40 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className="relative group/rail">
      {/* Left scroll button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollLeft ? 1 : 0 }}
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                    w-11 h-11 rounded-full shadow-luxury
                    flex items-center justify-center
                    transition-all duration-300
                    ${dark
                      ? "bg-white/10 text-cream hover:bg-gold hover:text-espresso-900"
                      : "bg-white text-espresso-900 hover:bg-gold hover:text-espresso-900"
                    }`}
      >
        <FiChevronLeft size={20} />
      </motion.button>

      {/* Right scroll button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollRight ? 1 : 0 }}
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                    w-11 h-11 rounded-full shadow-luxury
                    flex items-center justify-center
                    transition-all duration-300
                    ${dark
                      ? "bg-white/10 text-cream hover:bg-gold hover:text-espresso-900"
                      : "bg-white text-espresso-900 hover:bg-gold hover:text-espresso-900"
                    }`}
      >
        <FiChevronRight size={20} />
      </motion.button>

      {/* The scrollable rail */}
      <div
        ref={railRef}
        onScroll={updateScrollState}
        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth
                   [scrollbar-width:none] [-ms-overflow-style:none]
                   [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product, i) => (
          <div
            key={product._id}
            className="flex-shrink-0 w-72"
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard product={product} index={i} dark={dark} size="md" />
          </div>
        ))}
      </div>
    </div>
  );
}
