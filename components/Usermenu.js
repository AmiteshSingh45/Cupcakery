"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiShoppingBag, FiHome } from "react-icons/fi";

const menuItems = [
  { name: "Overview",  path: "/dashboard/user",         icon: <FiHome size={17} /> },
  { name: "Profile",   path: "/dashboard/user/profile", icon: <FiUser size={17} /> },
  { name: "My Orders", path: "/dashboard/user/orders",  icon: <FiShoppingBag size={17} /> },
];

const UserMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {menuItems.map((item, i) => {
        const active = pathname === item.path;
        return (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Link
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-body font-medium
                          transition-all duration-300 group ${
                active
                  ? "bg-gold text-espresso-900 shadow-gold/30 shadow-md"
                  : "text-cream/70 hover:bg-white/8 hover:text-cream"
              }`}
            >
              <span className={`flex-shrink-0 transition-transform duration-300 ${active ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {active && (
                <motion.span
                  layoutId="user-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-espresso-900/40"
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};

export default UserMenu;
