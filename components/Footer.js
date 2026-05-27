"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone, FiArrowRight } from "react-icons/fi";

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/dashboard/admin")) return null;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const quickLinks = [
    { label: "All Products", href: "/products" },
    { label: "About Us", href: "/About_Us" },
    { label: "Contact Us", href: "/Contact_Us" },
    { label: "Mood Picks", href: "/mood" },
    { label: "Custom Orders", href: "/form" },
    { label: "Login", href: "/Login" },
  ];

  const categories = [
    { label: "Cupcakes", href: "/category/cupcakes" },
    { label: "Cakes", href: "/category/cakes" },
    { label: "Brownies", href: "/category/brownies" },
    { label: "Cookies", href: "/category/cookies" },
    { label: "Ice Creams", href: "/category/ice-creams" },
    { label: "Truffles", href: "/category/truffle" },
  ];

  const socials = [
    {
      icon: <FaInstagram size={18} />,
      href: "https://www.instagram.com/bindis_cupcakery",
      label: "Instagram",
      color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400",
    },
    {
      icon: <FaFacebookF size={18} />,
      href: "https://www.facebook.com/bindi.malji",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: <FaWhatsapp size={18} />,
      href: "https://wa.me/918340497237?text=Hello%2C%20I%20want%20to%20place%20an%20order!",
      label: "WhatsApp",
      color: "hover:bg-green-500",
    },
  ];

  return (
    <footer className="bg-luxury-dark text-cream relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #D4A853 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F5C6C6 0%, transparent 40%)",
        }}
      />

      <div className="section-container relative z-10">
        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16 border-b border-white/10">

          {/* ── Brand Column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/">
              <Image
                src="/logo.jpg"
                alt="Bindi's Cupcakery"
                width={150}
                height={40}
                className="rounded-full opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-cream/60 text-sm leading-relaxed font-body">
              Handcrafted with love — 100% eggless, homemade, and
              preservative-free desserts from our cloud kitchen in Surat.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-cream/70 hover:text-white transition-all duration-300 ${s.color}`}
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Quick Links ───────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-body font-semibold tracking-[0.15em] uppercase text-gold">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/60 hover:text-gold text-sm font-body transition-colors duration-300 flex items-center gap-1.5 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 transition-transform duration-200">
                      <FiArrowRight size={12} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Categories ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-body font-semibold tracking-[0.15em] uppercase text-gold">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-cream/60 hover:text-gold text-sm font-body transition-colors duration-300 flex items-center gap-1.5 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 transition-transform duration-200">
                      <FiArrowRight size={12} />
                    </span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact + Newsletter ──────────────────────────────────────── */}
          <div className="space-y-5">
            <h4 className="text-sm font-body font-semibold tracking-[0.15em] uppercase text-gold">
              Get in Touch
            </h4>

            <div className="space-y-3">
              <a
                href="tel:+918340497237"
                className="flex items-center gap-3 text-sm text-cream/60 hover:text-gold transition-colors font-body"
              >
                <FiPhone size={14} className="text-gold/70 flex-shrink-0" />
                +91 83404 97237
              </a>
              <div className="flex items-start gap-3 text-sm text-cream/60 font-body">
                <FiMapPin size={14} className="text-gold/70 flex-shrink-0 mt-0.5" />
                Cloud Kitchen, Surat, Gujarat
              </div>
              <a
                href="mailto:bindiscupcakery@gmail.com"
                className="flex items-center gap-3 text-sm text-cream/60 hover:text-gold transition-colors font-body"
              >
                <FiMail size={14} className="text-gold/70 flex-shrink-0" />
                bindiscupcakery@gmail.com
              </a>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs text-cream/50 font-body mb-3 uppercase tracking-wider">
                Stay Sweet — Get Updates
              </p>
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gold text-sm font-body"
                >
                  🎉 Thanks for subscribing!
                </motion.p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-cream text-sm font-body placeholder-cream/30 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-gold hover:bg-gold-light flex items-center justify-center text-espresso-900 transition-colors flex-shrink-0"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-cream/40 text-xs font-body text-center sm:text-left">
            © {new Date().getFullYear()} Bindi&apos;s Cupcakery. All Rights Reserved.
            Made with 🍰 in Surat.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-cream/40 hover:text-cream/70 text-xs font-body transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-cream/40 hover:text-cream/70 text-xs font-body transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
