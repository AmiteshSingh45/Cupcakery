"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/Context/auth";
import { usePathname, useRouter } from "next/navigation";
import useCategory from "@/hooks/useCategory";
import { useCart } from "@/Context/cart";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiGrid,
  FiChevronDown,
  FiMenu,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

const Navbar = () => {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const searchInputRef = useRef(null);

  const collectionsRef = useRef(null);
  const userMenuRef = useRef(null);

  const { categories, loading: catLoading } = useCategory();
  const [auth, login, logout] = useAuth();
  const router = useRouter();
  const { cart } = useCart();
  const cartCount = cart?.length ?? 0;

  // Scroll awareness
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!auth?.user);
  }, [auth]);

  const handleLogout = () => {
    logout();
    router.push("/Login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target))
        setCollectionsOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Products", href: "/products" },
    { label: "Mood Picks", href: "/mood", icon: <HiSparkles size={14} /> },
    { label: "About Us", href: "/About_Us" },
    { label: "Contact Us", href: "/Contact_Us" },
  ];

  if (pathname?.startsWith("/dashboard/admin")) return null;

  return (
    <>
      {/* ── Main Navbar ──────────────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 z-[10010] relative w-full overflow-visible transition-all duration-500 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-xl shadow-luxury border-b border-cream-deep/60"
            : "bg-cream/70 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="section-container flex items-center justify-between h-20 overflow-visible">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Bindi's Cupcakery"
              width={160}
              height={44}
              className="rounded-full object-cover"
              priority
            />
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-1">

            {/* Collections dropdown */}
            <li className="relative overflow-visible" ref={collectionsRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCollectionsOpen((v) => !v);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-300 ${
                  collectionsOpen
                    ? "bg-espresso-900 text-cream"
                    : "text-ink hover:bg-espresso-900/8 hover:text-espresso-900"
                }`}
              >
                Collections
                <motion.span animate={{ rotate: collectionsOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <FiChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {collectionsOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-cream/95 backdrop-blur-xl rounded-2xl shadow-luxury border border-cream-deep/50 p-2 z-[10020]"
                  >
                    {catLoading ? (
                      <li className="px-4 py-3 text-xs text-ink-muted animate-pulse">Loading collections…</li>
                    ) : categories?.length > 0 ? (
                      categories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/category/${c.slug}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-sm font-body font-medium text-ink hover:bg-espresso-900 hover:text-cream transition-all duration-200"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-xs text-ink-muted">No collections found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium text-ink hover:bg-espresso-900/8 hover:text-espresso-900 transition-all duration-300"
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop Actions ───────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center">
              <motion.div
                animate={{ width: searchOpen ? 200 : 0, opacity: searchOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  placeholder="Search treats…"
                  className="w-full px-4 py-2 rounded-full bg-espresso-900/6 border border-cream-deep
                             text-sm font-body text-espresso-900 placeholder-ink-muted
                             focus:outline-none focus:border-gold/50 transition-all"
                />
              </motion.div>
              <button
                type={searchOpen ? "submit" : "button"}
                onClick={!searchOpen ? openSearch : undefined}
                className="flex items-center justify-center w-10 h-10 rounded-full
                           hover:bg-espresso-900/8 transition-all duration-300 text-ink"
              >
                <FiSearch size={18} />
              </button>
            </form>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-espresso-900/8 transition-all duration-300 text-ink"
            >
              <FiShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blush-rose text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Auth */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/Login" className="px-4 py-2 rounded-full text-sm font-body font-medium text-ink hover:bg-espresso-900/8 transition-all duration-300">
                  Login
                </Link>
                <Link href="/Register" className="btn-luxury text-sm px-5 py-2.5">
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative overflow-visible" ref={userMenuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-cream-deep hover:border-gold hover:shadow-gold/20 hover:shadow-md transition-all duration-300"
                >
                  <span className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-espresso-900 text-xs font-bold">
                    {auth?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="text-sm font-body font-medium text-ink max-w-[100px] truncate">
                    {auth?.user?.name}
                  </span>
                  <motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <FiChevronDown size={12} className="text-ink-muted" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-cream/95 backdrop-blur-xl rounded-2xl shadow-luxury border border-cream-deep/50 p-2 z-[10020]"
                    >
                      <li>
                        <Link
                          href={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-body font-medium text-ink hover:bg-espresso-900 hover:text-cream transition-all duration-200"
                        >
                          <FiGrid size={14} /> Dashboard
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-body font-medium text-blush-rose hover:bg-blush-light transition-all duration-200"
                        >
                          <FiLogOut size={14} /> Logout
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Mobile: Cart + Hamburger ──────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full text-ink">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-blush-rose text-white text-[10px] font-bold flex items-center justify-center rounded-full w-[18px] h-[18px]">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-espresso-900/8 transition-all text-ink"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <FiX size={22} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <FiMenu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-cream flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-cream-deep/50">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image src="/logo.jpg" alt="Bindi's Cupcakery" width={130} height={36} className="rounded-full" />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-espresso-900/6 text-ink"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-display font-semibold text-espresso-900 hover:bg-espresso-900/6 transition-all">
                Home
              </Link>

              {/* Collections */}
              <div>
                <button
                  onClick={() => setCollectionsOpen((v) => !v)}
                  className="flex items-center justify-between w-full px-4 py-4 rounded-2xl text-lg font-display font-semibold text-espresso-900 hover:bg-espresso-900/6 transition-all"
                >
                  Collections
                  <motion.span animate={{ rotate: collectionsOpen ? 180 : 0 }}>
                    <FiChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-4"
                    >
                      {categories?.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-3 rounded-xl text-base font-body font-medium text-ink hover:text-espresso-900 hover:bg-cream-deep/60 transition-all"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-display font-semibold text-espresso-900 hover:bg-espresso-900/6 transition-all"
                >
                  {link.icon} {link.label}
                </Link>
              ))}

              <div className="border-t border-cream-deep/60 my-4 pt-4 space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Link href="/Login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-display font-semibold text-espresso-900 hover:bg-espresso-900/6 transition-all">
                      <FiUser size={18} /> Login
                    </Link>
                    <Link href="/Register" onClick={() => setMenuOpen(false)} className="btn-luxury w-full justify-center text-base">
                      Create Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-display font-semibold text-espresso-900 hover:bg-espresso-900/6 transition-all">
                      <FiGrid size={18} /> Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl text-lg font-display font-semibold text-blush-rose hover:bg-blush-light transition-all">
                      <FiLogOut size={18} /> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
