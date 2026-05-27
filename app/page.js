"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ReviewForm from "../components/reveiwForm";
import ReviewSlider from "../components/Reveiwslider";
import WhatsAppQR from "../components/WhatsappQR";
import AnimatedSection from "../components/AnimatedSection";
import SectionHeader from "../components/SectionHeader";
import ProductRail from "../components/ProductRail";
import api from "@/lib/api";
import { catalogCategories, catalogProducts } from "@/lib/catalog";
import { FiArrowRight, FiShoppingBag, FiStar } from "react-icons/fi";
import {
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineGift,
  HiOutlinePhone,
} from "react-icons/hi";

// ── Hero images ──────────────────────────────────────────────────────────────
const HERO_IMAGES = [
  "/hpcakefinal.jpg",
  "/hp_img2.jpg",
  "/hp_img3.jpg",
  "/hp_img4.jpg",
];

// ── Trust marquee items ───────────────────────────────────────────────────────
const TRUST_ITEMS = [
  "🥚 100% Eggless",
  "🏠 Homemade with Love",
  "🚫 Zero Preservatives",
  "🎂 Custom Celebration Cakes",
  "☁️ Cloud Kitchen Surat",
  "🌿 Natural Ingredients",
  "💝 Made Fresh to Order",
  "⭐ 500+ Happy Customers",
];

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <HiOutlineSparkles size={28} />,
    title: "100% Eggless",
    desc: "Every treat made without eggs — pure vegetarian indulgence for everyone.",
    gradient: "from-gold/20 to-gold/5",
  },
  {
    icon: <HiOutlineHeart size={28} />,
    title: "Made with Love",
    desc: "Homemade in small batches with natural ingredients, zero preservatives.",
    gradient: "from-blush/40 to-blush/10",
  },
  {
    icon: <HiOutlineGift size={28} />,
    title: "Custom Hampers",
    desc: "Personalize dessert boxes for birthdays, weddings & celebrations.",
    gradient: "from-cream-warm to-cream",
  },
  {
    icon: <HiOutlinePhone size={28} />,
    title: "Easy Ordering",
    desc: "Order directly via WhatsApp or our online menu — quick cloud pickup.",
    gradient: "from-espresso-50 to-cream",
  },
];

// ── Gallery images ────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { src: "/hpcakefinal.jpg", alt: "Celebration Cake", span: "col-span-2 row-span-2" },
  { src: "/hp_img2.jpg", alt: "Cupcakes", span: "" },
  { src: "/hp_img3.jpg", alt: "Brownies", span: "" },
  { src: "/hp_img4.jpg", alt: "Pastries", span: "" },
  { src: "/hpbrowniesproduct.jpg", alt: "Truffles", span: "" },
];

// ── Slide Dot ────────────────────────────────────────────────────────────────
function HeroDot({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full transition-all duration-400 ${
        active ? "w-6 h-2 bg-gold" : "w-2 h-2 bg-white/50 hover:bg-white/80"
      }`}
    />
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewest, setLoadingNewest] = useState(true);

  // Hero auto-advance
  useEffect(() => {
    const iv = setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 4500);
    return () => clearInterval(iv);
  }, []);

  // Fetch featured products (Best Sellers)
  useEffect(() => {
    api
      .get("/api/v1/product/featured?limit=8")
      .then(({ data }) => {
        if (data?.products?.length) setFeaturedProducts(data.products);
        else setFeaturedProducts(catalogProducts.filter((product) => product.featured).slice(0, 8));
      })
      .catch(() => setFeaturedProducts(catalogProducts.filter((product) => product.featured).slice(0, 8)))
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Fetch newest products (New Arrivals)
  useEffect(() => {
    api
      .get("/api/v1/product/newest?limit=8")
      .then(({ data }) => {
        if (data?.products?.length) setNewestProducts(data.products);
        else setNewestProducts(catalogProducts.slice(-8).reverse());
      })
      .catch(() => setNewestProducts(catalogProducts.slice(-8).reverse()))
      .finally(() => setLoadingNewest(false));
  }, []);

  // Fetch categories for the showcase grid
  useEffect(() => {
    api
      .get("/api/v1/category/get-category")
      .then(({ data }) => {
        if (data?.category?.length) setCategories(data.category);
        else setCategories(catalogCategories);
      })
      .catch(() => setCategories(catalogCategories));
  }, []);

  // Category images mapping (fallback images by category name)
  const getCategoryImage = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("cake")) return "/hpcakeproduct.jpeg";
    if (n.includes("brownie")) return "/hpbrowniesproduct.jpg";
    if (n.includes("cookie")) return "/hpcookiesproduct1.jpg";
    if (n.includes("truffle")) return "/hptruffleproduct.jpg";
    if (n.includes("cupcake")) return "/hpcakefinal.jpg";
    return "/hpcakefinal.jpg";
  };

  return (
    <div className="bg-cream text-espresso-900 overflow-hidden">
      <WhatsAppQR />

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[92vh] min-h-[600px] flex items-end pb-16 overflow-hidden">
        {/* Background slideshow */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[slide]}
              alt="Bindi's Cupcakery"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/90 via-espresso-900/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Floating decorative blobs */}
        <div className="absolute top-20 right-16 w-24 h-24 rounded-full bg-gold/10 blur-2xl animate-float-slow pointer-events-none" />
        <div className="absolute top-40 right-40 w-16 h-16 rounded-full bg-blush/15 blur-xl animate-float-delayed pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 section-container w-full">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-body font-semibold tracking-widest uppercase mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
              Handcrafted Desserts · Surat, Gujarat
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="font-display text-hero-lg text-cream leading-[1.05] mb-5"
            >
              Bindi&apos;s{" "}
              <span className="text-gradient-gold">Cupcakery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-cream/75 text-lg font-body mb-8 leading-relaxed max-w-lg"
            >
              100% eggless, homemade & preservative-free — desserts crafted
              with love for every celebration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <Link href="/products" className="btn-luxury group gap-3">
                <FiShoppingBag size={18} />
                Order Now
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <Link href="/About_Us" className="btn-luxury-ghost gap-2">
                Our Story
              </Link>
            </motion.div>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2 mt-8">
            {HERO_IMAGES.map((_, i) => (
              <HeroDot key={i} active={i === slide} onClick={() => setSlide(i)} />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TRUST MARQUEE BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-espresso-900 py-3.5 overflow-hidden border-y border-gold/10">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 text-xs font-body font-medium tracking-widest uppercase text-cream/70 mx-8"
            >
              {item}
              <span className="text-gold/50">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          WHY CHOOSE US — BENTO GRID
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream-warm">
        <div className="section-container">
          <SectionHeader
            label="Why Us"
            title={<>Made Different, <span className="text-gradient-gold">Tasted Better</span></>}
            subtitle="Every bite tells the story of handcrafted passion, natural ingredients, and genuine love for baking."
            className="mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat, i) => (
              <AnimatedSection key={feat.title} variant="fade-up" delay={i * 0.1}>
                <div
                  className={`group h-full bg-gradient-to-br ${feat.gradient} border border-cream-deep/60
                              rounded-3xl p-6 hover:shadow-card-hover hover:-translate-y-1.5
                              transition-all duration-500 ease-luxury cursor-default`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-espresso-900/6 border border-espresso-900/8
                                  flex items-center justify-center text-espresso-700 mb-4
                                  group-hover:bg-espresso-900 group-hover:text-cream
                                  transition-all duration-400">
                    {feat.icon}
                  </div>
                  <h3 className="font-display font-semibold text-espresso-900 text-lg mb-2 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-ink-muted text-sm font-body leading-relaxed">{feat.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURED CATEGORIES SHOWCASE
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream">
        <div className="section-container">
          <SectionHeader
            label="Collections"
            title="Our Sweet World"
            subtitle="From rich brownies to delicate cupcakes — explore our full range of artisan treats."
            className="mb-12"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {(categories.length > 0 ? categories.slice(0, 8) : [
              { name: "Cakes", slug: "cakes" },
              { name: "Brownies", slug: "brownies" },
              { name: "Cookies", slug: "cookies" },
              { name: "Truffle", slug: "truffle" },
            ]).map((cat, i) => (
              <AnimatedSection key={cat.slug || cat.name} variant="scale-in" delay={i * 0.08}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative block rounded-3xl overflow-hidden aspect-[4/5] shadow-card hover:shadow-card-hover transition-shadow duration-500"
                >
                  <Image
                    src={getCategoryImage(cat.name)}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    <h3 className="font-display font-semibold text-cream text-lg leading-tight">
                      {cat.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-gold text-xs font-body mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <FiArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection variant="fade-up" delay={0.3} className="flex justify-center mt-10">
            <Link href="/products" className="btn-luxury-outline gap-2 group">
              View All Products
              <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          BEST SELLERS — Dynamic API
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-espresso-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-blush/6 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              label="Best Sellers"
              title={<>Our Most <span className="text-gradient-gold">Loved</span> Treats</>}
              subtitle="Handpicked by customers who can't stop coming back."
              center={false}
              light
            />
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-gold/70 hover:text-gold text-sm font-body font-medium transition-colors flex-shrink-0 mb-1"
            >
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          <ProductRail products={featuredProducts} dark loading={loadingFeatured} />

          <div className="flex justify-center mt-8 md:hidden">
            <Link href="/products" className="btn-luxury-ghost gap-2 group text-sm">
              View All <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          BRAND STORY — SPLIT LAYOUT
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-luxury-warm relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-blush/15 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image side */}
            <AnimatedSection variant="slide-right">
              <div className="relative">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-luxury">
                  <Image
                    src="/hpcakefinal.jpg"
                    alt="Our Story — Bindi's Cupcakery"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/30 to-transparent" />
                </div>
                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-3xl shadow-luxury p-5 border border-cream-deep"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl">
                      🧁
                    </div>
                    <div>
                      <p className="font-display font-bold text-2xl text-espresso-900">500+</p>
                      <p className="font-body text-xs text-ink-muted">Happy Customers</p>
                    </div>
                  </div>
                </motion.div>
                {/* Floating rating card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -top-6 -left-6 bg-espresso-900 rounded-3xl shadow-luxury p-4 border border-gold/20"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} className="text-gold" style={{ fill: "currentColor" }} />
                    ))}
                  </div>
                  <p className="font-body text-xs text-cream/70">5.0 Average Rating</p>
                </motion.div>
              </div>
            </AnimatedSection>

            {/* Text side */}
            <AnimatedSection variant="slide-left" className="space-y-6">
              <div>
                <span className="section-label">Our Story</span>
                <h2 className="font-display text-section font-semibold text-espresso-900 mt-2 leading-tight">
                  Baked with Passion,{" "}
                  <span className="text-gradient-gold">Served with Love</span>
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-ink-muted font-body leading-relaxed">
                  Bindi&apos;s Cupcakery was born from a simple dream — to bring
                  joy to every table through the magic of homemade desserts. Every
                  treat we create is crafted in our cloud kitchen in Surat, using
                  only the finest natural ingredients.
                </p>
                <p className="text-ink-muted font-body leading-relaxed">
                  We believe that the best desserts are those made with intention.
                  That&apos;s why every batch is handcrafted, every flavour is
                  thoughtfully developed, and every delivery carries a piece of
                  our heart.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { num: "100%", label: "Eggless" },
                  { num: "0", label: "Preservatives" },
                  { num: "∞", label: "Love" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-2xl bg-cream border border-cream-deep">
                    <p className="font-display font-bold text-2xl text-espresso-900">{stat.num}</p>
                    <p className="font-body text-xs text-ink-muted mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/About_Us" className="btn-luxury gap-2 group inline-flex">
                Read Our Full Story
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          NEW ARRIVALS — Dynamic API
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream">
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              label="New Arrivals"
              title={<>Fresh from the <span className="text-gradient-gold">Kitchen</span></>}
              subtitle="The latest additions to our handcrafted collection."
              center={false}
            />
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-espresso-900/50 hover:text-espresso-900 text-sm font-body font-medium transition-colors flex-shrink-0 mb-1"
            >
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          <ProductRail products={newestProducts} loading={loadingNewest} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          GALLERY STRIP
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-espresso-900 relative overflow-hidden">
        <div className="section-container">
          <SectionHeader
            label="Gallery"
            title={<>A Visual <span className="text-gradient-gold">Feast</span></>}
            subtitle="Every photo tells the story of a treat made with love."
            light
            className="mb-12"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 auto-rows-[180px]">
            {GALLERY_IMAGES.map((img, i) => (
              <AnimatedSection
                key={i}
                variant="scale-in"
                delay={i * 0.08}
                className={i === 0 ? "col-span-2 row-span-2" : ""}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-espresso-900/0 group-hover:bg-espresso-900/30 transition-colors duration-500 flex items-center justify-center">
                    <span className="text-cream text-sm font-body font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {img.alt}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection variant="fade-up" delay={0.4} className="flex justify-center mt-10">
            <a
              href="https://www.instagram.com/bindis_cupcakery"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury-ghost gap-2 group"
            >
              Follow on Instagram
              <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-luxury-warm relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gold/12 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blush/20 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <AnimatedSection variant="scale-in">
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Let&apos;s Get Sweet</span>
              <h2 className="section-title mt-2 mb-4">
                Craving Something{" "}
                <span className="text-gradient-gold">Delicious?</span>
              </h2>
              <p className="section-subtitle mx-auto mb-8">
                Browse our full menu of handcrafted eggless desserts and place
                your order today.
              </p>
              <Link href="/products" className="btn-luxury text-base px-10 py-4 gap-3 group">
                Explore Our Menu
                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          REVIEWS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream">
        <div className="section-container">
          <SectionHeader
            label="Testimonials"
            title={<>Words from Our <span className="text-gradient-gold">Sweet Family</span></>}
            subtitle="Real reviews from customers who can't stop indulging."
            className="mb-12"
          />

          <AnimatedSection variant="fade-up" delay={0.1}>
            <ReviewSlider />
          </AnimatedSection>

          <AnimatedSection variant="fade-up" delay={0.2} className="mt-14">
            <div className="max-w-lg mx-auto">
              <h3 className="font-display text-2xl font-semibold text-espresso-900 text-center mb-2">
                Share Your Experience
              </h3>
              <p className="text-ink-muted text-center text-sm font-body mb-6">
                Tried our treats? We&apos;d love to hear from you!
              </p>
              <ReviewForm />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
