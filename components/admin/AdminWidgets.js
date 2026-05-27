"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight, FiDownload, FiMoreHorizontal } from "react-icons/fi";

export function StatCard({ label, value, delta, icon, tone = "gold", index = 0 }) {
  const tones = {
    gold: "bg-gold/15 text-gold-dark",
    rose: "bg-blush-light text-blush-rose",
    green: "bg-green-50 text-green-700",
    dark: "bg-espresso-900 text-cream",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[1.75rem] border border-cream-deep/70 bg-white p-5 shadow-card"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone] || tones.gold}`}>
          {icon}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          <FiArrowUpRight size={12} />
          {delta}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-espresso-900">{value}</p>
    </motion.div>
  );
}

export function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-[2rem] border border-cream-deep/70 bg-white shadow-card ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-cream-deep/70 p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-espresso-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action || <button className="rounded-full p-2 text-ink-muted hover:bg-cream-warm"><FiMoreHorizontal /></button>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function LineChart({ data = [], labels = [], height = 220 }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (value / max) * 82 - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="adminLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,100 ${points} 100,100`} fill="url(#adminLineFill)" stroke="none" />
        <polyline points={points} fill="none" stroke="#A87C2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
        {(labels.length ? labels : ["Jan", "Mar", "May", "Jul", "Sep", "Nov"]).map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
}

export function BarChart({ data = [], labels = [] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-64 items-end gap-3">
      {data.map((value, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end rounded-full bg-cream-warm p-1" style={{ height: 210 }}>
            <div className="w-full rounded-full bg-gradient-to-t from-gold-dark to-gold transition-all" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-ink-muted">{labels[index] || index + 1}</span>
        </div>
      ))}
    </div>
  );
}

export function DataToolbar({ search, setSearch, filters, actionLabel = "Export CSV" }) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-cream-deep bg-white p-3 shadow-card lg:flex-row lg:items-center">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search records..."
        className="h-12 flex-1 rounded-2xl bg-cream-warm px-4 text-sm outline-none ring-gold/30 focus:ring-2"
      />
      {filters}
      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cream-deep px-4 text-sm font-bold text-espresso-900 transition hover:border-gold">
        <FiDownload />
        {actionLabel}
      </button>
    </div>
  );
}

export function StatusPill({ status }) {
  const normalized = String(status || "Active").toLowerCase();
  const classes = normalized.includes("cancel") || normalized.includes("refund") || normalized.includes("ban") || normalized.includes("reject")
    ? "bg-blush-light text-blush-rose"
    : normalized.includes("pending") || normalized.includes("processing") || normalized.includes("packed")
      ? "bg-gold/15 text-gold-dark"
      : normalized.includes("delivered") || normalized.includes("active") || normalized.includes("approved") || normalized.includes("paid")
        ? "bg-green-50 text-green-700"
        : "bg-cream-warm text-ink-muted";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>{status}</span>;
}
