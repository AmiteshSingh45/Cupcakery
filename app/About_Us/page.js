"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineHeart, HiOutlineGift } from "react-icons/hi";

const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "100%", label: "Eggless Recipes" },
  { value: "6+",   label: "Dessert Categories" },
  { value: "0",    label: "Preservatives" },
];

const VALUES = [
  {
    icon: <HiOutlineSparkles size={24} />,
    title: "Pure Ingredients",
    desc: "No shortcuts. Only natural, carefully sourced ingredients go into every batch.",
  },
  {
    icon: <HiOutlineHeart size={24} />,
    title: "Baked with Love",
    desc: "Each dessert is handmade with attention and care — it shows in every bite.",
  },
  {
    icon: <HiOutlineGift size={24} />,
    title: "Custom Creations",
    desc: "We turn your celebrations into sweet memories with personalized dessert hampers.",
  },
];

const About = () => {
  return (
    <div className="bg-cream text-espresso-900">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] min-h-[420px] flex items-end pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/logo.jpg"
            alt="Bindi's Cupcakery"
            fill
            priority
            className="object-cover brightness-[0.45]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 via-espresso-900/20 to-transparent" />
        </div>

        <div className="relative z-10 section-container">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-body font-semibold tracking-widest uppercase mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-hero-sm text-cream leading-tight"
          >
            About Bindi&apos;s Cupcakery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-cream/70 font-body text-lg mt-3 max-w-xl"
          >
            Bringing the joy of handcrafted, eggless desserts to Surat — one sweet creation at a time.
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHO WE ARE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection variant="slide-right">
              <span className="section-label">Who We Are</span>
              <h2 className="section-title mt-2 mb-5">
                A Cloud Kitchen{" "}
                <span className="text-gradient-gold">Born from Passion</span>
              </h2>
              <div className="space-y-4 text-ink-muted font-body leading-relaxed">
                <p>
                  Bindi&apos;s Cupcakery started with a simple dream — to create
                  desserts that everyone can enjoy, regardless of dietary
                  preferences. Operating from our cloud kitchen in Parle Point,
                  Surat, we handcraft every treat fresh to order.
                </p>
                <p>
                  From our signature chocolate hazelnut brownies to delicate
                  cupcakes and customized celebration cakes — every product is
                  100% eggless, preservative-free, and made with ingredients
                  you can trust.
                </p>
                <p>
                  We believe that great desserts don&apos;t need artificial
                  shortcuts. Just real ingredients, genuine love, and a
                  passion for making every occasion sweeter.
                </p>
              </div>
              <Link href="/products" className="btn-luxury gap-2 group mt-8 inline-flex">
                Explore Our Menu
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedSection>

            <AnimatedSection variant="slide-left">
              <div className="relative rounded-4xl overflow-hidden aspect-[4/3] shadow-luxury">
                <Image
                  src="/hpcakefinal.jpg"
                  alt="Our handcrafted desserts"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/30 to-transparent" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-espresso-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-luxury-dark opacity-80" />
        <div className="section-container relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <AnimatedSection key={stat.label} variant="fade-up" delay={i * 0.1} className="text-center">
                <p className="font-display text-5xl font-bold text-gradient-gold">{stat.value}</p>
                <p className="text-cream/60 text-sm font-body mt-2 uppercase tracking-wider">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OUR VALUES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-cream-warm">
        <div className="section-container">
          <AnimatedSection variant="fade-up" className="text-center mb-12">
            <span className="section-label">Our Values</span>
            <h2 className="section-title mt-2">
              What Makes Us{" "}
              <span className="text-gradient-gold">Different</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val, i) => (
              <AnimatedSection key={val.title} variant="fade-up" delay={i * 0.12}>
                <div className="group bg-white rounded-3xl p-7 border border-cream-deep shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-5 group-hover:bg-gold group-hover:text-espresso-900 transition-all duration-400">
                    {val.icon}
                  </div>
                  <h3 className="font-display font-semibold text-espresso-900 text-xl mb-2">{val.title}</h3>
                  <p className="text-ink-muted font-body text-sm leading-relaxed">{val.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COMMUNITY CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-luxury-warm relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gold/12 blur-3xl pointer-events-none" />
        <div className="section-container relative z-10">
          <AnimatedSection variant="scale-in" className="text-center max-w-2xl mx-auto">
            <span className="section-label">Join the Family</span>
            <h2 className="section-title mt-2 mb-4">
              Be Part of Our{" "}
              <span className="text-gradient-gold">Sweet Community</span>
            </h2>
            <p className="section-subtitle mx-auto mb-8">
              Follow us on social media for behind-the-scenes peeks, new
              arrivals, and special offers.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="https://www.instagram.com/bindis_cupcakery"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-body font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <FaInstagram size={18} /> Instagram
              </Link>
              <Link
                href="https://www.facebook.com/bindi.malji"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-body font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <FaFacebookF size={18} /> Facebook
              </Link>
              <Link
                href="https://wa.me/918340497237"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white font-body font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <FaWhatsapp size={18} /> WhatsApp
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
