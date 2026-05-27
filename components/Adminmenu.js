"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/components/admin/AdminShell";

export default function AdminMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/35">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? "bg-gold text-espresso-900 shadow-gold" : "text-cream/70 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  <Icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
