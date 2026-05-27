"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBox,
  FiChevronLeft,
  FiCommand,
  FiCreditCard,
  FiGrid,
  FiHeadphones,
  FiHome,
  FiImage,
  FiLayers,
  FiMenu,
  FiPackage,
  FiPercent,
  FiSearch,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/Context/auth";

export const adminNavGroups = [
  {
    label: "Commerce",
    items: [
      { name: "Overview", path: "/dashboard/admin", icon: FiHome },
      { name: "Products", path: "/dashboard/admin/products", icon: FiPackage },
      { name: "Create Product", path: "/dashboard/admin/create-product", icon: FiBox },
      { name: "Categories", path: "/dashboard/admin/create-category", icon: FiLayers },
      { name: "Orders", path: "/dashboard/admin/orders", icon: FiShoppingBag },
      { name: "Inventory", path: "/dashboard/admin/inventory", icon: FiActivity },
    ],
  },
  {
    label: "Growth",
    items: [
      { name: "Users", path: "/dashboard/admin/users", icon: FiUsers },
      { name: "Reviews", path: "/dashboard/admin/reviews", icon: FiStar },
      { name: "Coupons", path: "/dashboard/admin/coupons", icon: FiPercent },
      { name: "Banners", path: "/dashboard/admin/banners", icon: FiImage },
      { name: "Reports", path: "/dashboard/admin/reports", icon: FiBarChart2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "CMS", path: "/dashboard/admin/cms", icon: FiGrid },
      { name: "Support", path: "/dashboard/admin/support", icon: FiHeadphones },
      { name: "Delivery", path: "/dashboard/admin/delivery", icon: FiTruck },
      { name: "Payments", path: "/dashboard/admin/payments", icon: FiCreditCard },
      { name: "Security", path: "/dashboard/admin/security", icon: FiShield },
      { name: "Settings", path: "/dashboard/admin/settings", icon: FiSettings },
    ],
  },
];

export function AdminShell({ children, title, subtitle, actions }) {
  const pathname = usePathname();
  const [auth] = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");

  const flatNav = useMemo(() => adminNavGroups.flatMap((group) => group.items), []);
  const commandItems = flatNav.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex h-full flex-col border-r border-white/10 bg-espresso-900 text-cream ${
        collapsed && !mobile ? "w-[88px]" : "w-72"
      } transition-all duration-300`}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link href="/dashboard/admin" className="min-w-0">
          <p className={`font-display text-xl font-semibold ${collapsed && !mobile ? "hidden" : "block"}`}>
            Cupcakery
          </p>
          <p className={`text-xs text-cream/45 ${collapsed && !mobile ? "hidden" : "block"}`}>
            Admin Command Center
          </p>
          {collapsed && !mobile && <span className="font-display text-2xl text-gold">C</span>}
        </Link>
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} className="rounded-full bg-white/10 p-2">
            <FiX />
          </button>
        ) : (
          <button onClick={() => setCollapsed((value) => !value)} className="rounded-full bg-white/10 p-2 text-cream/70 hover:text-cream">
            <FiChevronLeft className={collapsed ? "rotate-180" : ""} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {adminNavGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/35 ${collapsed && !mobile ? "hidden" : ""}`}>
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => mobile && setMobileOpen(false)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      active ? "bg-gold text-espresso-900 shadow-gold" : "text-cream/68 hover:bg-white/10 hover:text-cream"
                    } ${collapsed && !mobile ? "justify-center" : ""}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className={collapsed && !mobile ? "hidden" : "block"}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={`border-t border-white/10 p-4 ${collapsed && !mobile ? "text-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed && !mobile ? "justify-center" : ""}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-espresso-900">
            {auth?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className={collapsed && !mobile ? "hidden" : "min-w-0"}>
            <p className="truncate text-sm font-semibold text-cream">{auth?.user?.name || "Administrator"}</p>
            <p className="truncate text-xs text-cream/45">{auth?.user?.email || "admin@cupcakery.local"}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8efe2] text-espresso-900">
      <div className="fixed inset-y-0 left-0 z-30 hidden md:block">
        <Sidebar />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-espresso-900/50 md:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`${collapsed ? "md:pl-[88px]" : "md:pl-72"} transition-all duration-300`}>
        <header className="sticky top-0 z-20 border-b border-cream-deep/70 bg-cream/88 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="rounded-full bg-white p-3 shadow-card md:hidden">
                <FiMenu />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Admin Panel</p>
                <h1 className="truncate font-display text-2xl font-semibold text-espresso-900 md:text-3xl">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCommandOpen(true)} className="hidden h-11 items-center gap-2 rounded-2xl border border-cream-deep bg-white px-4 text-sm font-semibold text-ink-muted shadow-card transition hover:border-gold md:flex">
                <FiCommand />
                Search admin
              </button>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-espresso-900 shadow-card">
                <FiBell />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blush-rose" />
              </button>
              {actions}
            </div>
          </div>
          {subtitle && <p className="px-4 pb-5 text-sm text-ink-muted md:px-8">{subtitle}</p>}
        </header>

        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center bg-espresso-900/45 px-4 pt-24 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
            <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.98 }} className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-luxury" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-cream-deep px-5 py-4">
                <FiSearch className="text-ink-muted" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Jump to products, orders, settings..." className="flex-1 bg-transparent text-sm outline-none" />
                <button onClick={() => setCommandOpen(false)} className="text-ink-muted"><FiX /></button>
              </div>
              <div className="max-h-80 overflow-y-auto p-3">
                {commandItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setCommandOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-espresso-900 transition hover:bg-cream-warm">
                      <Icon className="text-gold-dark" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
