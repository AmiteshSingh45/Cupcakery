"use client";

import { useAuth } from "../../../Context/auth";
import UserMenu from "../../../components/Usermenu";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingBag, FiUser, FiArrowRight, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const Dashboard = () => {
  const [auth] = useAuth();
  const user = auth?.user;

  const quickLinks = [
    { label: "My Profile",  href: "/dashboard/user/profile", icon: <FiUser size={18} />,        desc: "Update your details" },
    { label: "My Orders",   href: "/dashboard/user/orders",  icon: <FiShoppingBag size={18} />,  desc: "Track your orders" },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-espresso-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image src="/logo.jpg" alt="logo" fill className="object-cover" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-cream">My Account</p>
            <p className="text-[10px] text-cream/40 font-body">Bindi&apos;s Cupcakery</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 p-4 pt-6">
          <UserMenu />
        </div>

        {/* Footer avatar */}
        <div className="px-6 py-5 border-t border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-espresso-900 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-cream text-sm font-body font-medium truncate">{user?.name}</p>
              <p className="text-cream/40 text-xs font-body truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-gold">
            My Dashboard
          </span>
          <h1 className="font-display text-3xl font-semibold text-espresso-900 mt-1">
            Hello, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-ink-muted font-body text-sm mt-1">
            Manage your profile and track your sweet orders below.
          </p>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-3xl border border-cream-deep/40 shadow-card overflow-hidden mb-8"
        >
          {/* Gold top bar */}
          <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

          <div className="p-7">
            {/* Avatar + name */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light
                              flex items-center justify-center text-espresso-900 font-display font-bold text-3xl
                              shadow-gold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-espresso-900">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-espresso-900/8 text-espresso-700 text-[11px] font-body font-semibold">
                  ✦ Valued Customer
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-cream-deep/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <FiMail size={14} />
                </div>
                <div>
                  <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-0.5">Email</p>
                  <p className="font-body text-sm text-espresso-900 break-all">{user?.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <FiPhone size={14} />
                </div>
                <div>
                  <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-body text-sm text-espresso-900">{user?.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <FiMapPin size={14} />
                </div>
                <div>
                  <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-0.5">Address</p>
                  <p className="font-body text-sm text-espresso-900">{user?.address || "—"}</p>
                </div>
              </div>
            </div>

            {/* Edit button */}
            <div className="mt-6 pt-5 border-t border-cream-deep/50 flex">
              <Link href="/dashboard/user/profile" className="btn-luxury text-sm px-5 py-2.5 gap-2 group">
                Edit Profile
                <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick links */}
        <div>
          <h2 className="font-display font-semibold text-espresso-900 text-lg mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center gap-4 p-5 rounded-3xl bg-espresso-900 hover:bg-espresso-800
                             border border-white/5 hover:border-gold/20
                             transition-all duration-400 hover:-translate-y-1 hover:shadow-luxury"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center text-gold flex-shrink-0 transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-semibold text-cream">{link.label}</p>
                    <p className="font-body text-xs text-cream/50 mt-0.5">{link.desc}</p>
                  </div>
                  <FiArrowRight size={16} className="text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
