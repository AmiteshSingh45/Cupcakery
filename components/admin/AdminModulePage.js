"use client";

import { useMemo, useState } from "react";
import { FiCheckCircle, FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminShell } from "./AdminShell";
import { DataToolbar, Panel, StatusPill } from "./AdminWidgets";
import {
  adminBanners,
  adminCoupons,
  adminOrders,
  adminTickets,
  adminUsers,
  formatCurrency,
} from "@/lib/adminData";
import { catalogCategories, catalogProducts } from "@/lib/catalog";

const moduleData = {
  users: {
    title: "User Management",
    subtitle: "Manage customers, admins, staff, roles, permissions, order history, bans, and login activity.",
    columns: ["Name", "Role", "Status", "Orders", "Spend", "Last login"],
    rows: adminUsers.map((user) => [user.name, user.role, user.status, user.orders, formatCurrency(user.spend), new Date(user.lastLogin).toLocaleDateString()]),
    stats: [["Customers", adminUsers.filter((u) => u.role === "Customer").length], ["Admins", adminUsers.filter((u) => u.role.includes("Admin")).length], ["Staff", adminUsers.filter((u) => u.role === "Staff").length], ["Banned", adminUsers.filter((u) => u.status === "Banned").length]],
    actions: ["Assign role", "Ban/unban", "View orders", "Address book"],
  },
  inventory: {
    title: "Inventory Management",
    subtitle: "Track low stock, stock history, inventory logs, out-of-stock alerts, and warehouse-ready operations.",
    columns: ["Product", "Category", "Stock", "Status", "SKU", "Last movement"],
    rows: catalogProducts.slice(0, 28).map((p, i) => [p.name, p.category.name, p.stock || p.quantity, (p.stock || p.quantity) < 18 ? "Low stock" : "Healthy", `SKU-${1000 + i}`, `${i + 1}h ago`]),
    stats: [["Tracked SKUs", catalogProducts.length], ["Low stock", catalogProducts.filter((p) => (p.stock || p.quantity) < 18).length], ["Out of stock", 0], ["Warehouses", 1]],
    actions: ["Stock adjust", "Import CSV", "Export ledger", "Reorder list"],
  },
  coupons: {
    title: "Promo & Coupon Management",
    subtitle: "Create percentage, fixed amount, free shipping, customer-specific coupons, and revenue-impact reports.",
    columns: ["Code", "Type", "Value", "Usage", "Revenue", "Status"],
    rows: adminCoupons.map((c) => [c.code, c.type, c.value, c.usage, formatCurrency(c.revenue), c.status]),
    stats: [["Active coupons", adminCoupons.filter((c) => c.status === "Active").length], ["Usage", adminCoupons.reduce((s, c) => s + c.usage, 0)], ["Revenue impact", formatCurrency(adminCoupons.reduce((s, c) => s + c.revenue, 0))], ["Scheduled", 1]],
    actions: ["Create coupon", "Usage limits", "Customer targeting", "Revenue report"],
  },
  banners: {
    title: "Banner Management",
    subtitle: "Control hero banners, promotional strips, campaign sections, featured collections, and section ordering.",
    columns: ["Campaign", "Placement", "Status", "Clicks", "CTR", "Schedule"],
    rows: adminBanners.map((b, i) => [b.title, b.placement, b.status, b.clicks, `${(2.4 + i * 0.8).toFixed(1)}%`, i ? "Upcoming" : "Now live"]),
    stats: [["Live banners", 1], ["Scheduled", 1], ["Drafts", 1], ["Clicks", adminBanners.reduce((s, b) => s + b.clicks, 0)]],
    actions: ["Upload banner", "Reorder", "Enable/disable", "A/B test"],
  },
  cms: {
    title: "Content Management",
    subtitle: "Edit About, Contact, Privacy, Refund Policy, Terms, FAQ, and campaign copy from one CMS surface.",
    columns: ["Page", "Status", "Owner", "Updated", "SEO score", "Actions"],
    rows: ["About Us", "Contact Us", "Privacy Policy", "Refund Policy", "Terms & Conditions", "FAQ"].map((page, i) => [page, i < 2 ? "Published" : "Draft", "Admin", `${i + 1} days ago`, `${86 + i}%`, "Edit"]),
    stats: [["Pages", 6], ["Published", 2], ["Draft", 4], ["SEO avg", "89%"]],
    actions: ["Edit page", "Preview", "Publish", "SEO metadata"],
  },
  support: {
    title: "Customer Support",
    subtitle: "Manage tickets, complaints, chat escalations, refund requests, and customer care SLAs.",
    columns: ["Ticket", "Customer", "Subject", "Priority", "Status", "Channel"],
    rows: adminTickets.map((ticket) => [ticket.id, ticket.customer, ticket.subject, ticket.priority, ticket.status, ticket.channel]),
    stats: [["Open tickets", 3], ["High priority", 1], ["Refund requests", 1], ["Avg response", "18m"]],
    actions: ["Assign ticket", "Reply", "Refund flow", "Escalate"],
  },
  delivery: {
    title: "Delivery Management",
    subtitle: "Configure shipping zones, delivery charges, pickup windows, partners, and estimated delivery rules.",
    columns: ["Zone", "Charge", "ETA", "Partner", "Status", "Min order"],
    rows: [["Surat Central", "₹0", "Same day", "In-house", "Active", "₹299"], ["Adajan", "₹49", "Next day", "Dunzo", "Active", "₹499"], ["Vesu", "₹39", "Same day", "In-house", "Active", "₹399"], ["Outside Surat", "₹149", "2-3 days", "Courier", "Paused", "₹999"]],
    stats: [["Zones", 4], ["Active", 3], ["Partners", 3], ["Free pickup", "Yes"]],
    actions: ["Add zone", "Rate rules", "ETA matrix", "Partner config"],
  },
  payments: {
    title: "Payment Management",
    subtitle: "Monitor transactions, payment status, failed payments, Razorpay reconciliation, and refund history.",
    columns: ["Transaction", "Customer", "Amount", "Method", "Status", "Date"],
    rows: adminOrders.slice(0, 18).map((order, i) => [`TXN-${9000 + i}`, order.buyer.name, formatCurrency(order.amount), order.payment.method, order.payment.success ? "Paid" : "Failed", new Date(order.createdAt).toLocaleDateString()]),
    stats: [["Transactions", 18], ["Paid", 16], ["Failed", 2], ["Refunds", 1]],
    actions: ["Refund", "Download report", "Reconcile", "Payment settings"],
  },
  reports: {
    title: "Reports & Analytics",
    subtitle: "Generate sales, revenue, user growth, product performance, order, and inventory reports with exports.",
    columns: ["Report", "Period", "Records", "Format", "Status", "Owner"],
    rows: [["Sales report", "Monthly", 1250, "PDF/CSV", "Ready", "Admin"], ["Revenue report", "Weekly", 480, "Excel", "Ready", "Admin"], ["Product performance", "Monthly", catalogProducts.length, "CSV", "Ready", "Admin"], ["Inventory report", "Daily", catalogProducts.length, "CSV", "Scheduled", "Staff"]],
    stats: [["Reports", 4], ["Scheduled", 1], ["Exports", 28], ["Last export", "Today"]],
    actions: ["Export PDF", "Export CSV", "Export Excel", "Schedule"],
  },
  security: {
    title: "Security & Audit Logs",
    subtitle: "JWT sessions, admin middleware, permission checks, RBAC roles, rate limits, and audit event monitoring.",
    columns: ["Event", "Actor", "Risk", "IP", "Status", "Time"],
    rows: [["Admin login", "admin@cupcakery.local", "Low", "127.0.0.1", "Allowed", "2m ago"], ["Product update", "Staff", "Low", "127.0.0.1", "Allowed", "18m ago"], ["Failed login", "unknown", "High", "10.0.0.4", "Blocked", "1h ago"], ["Order refund", "Admin", "Medium", "127.0.0.1", "Review", "3h ago"]],
    stats: [["Roles", 4], ["Audit events", 128], ["Blocked", 1], ["Rate limits", "On"]],
    actions: ["Create role", "Permissions", "Audit export", "Rotate keys"],
  },
  settings: {
    title: "Global Settings",
    subtitle: "Configure brand, theme, SEO, social links, SMTP, payment keys, API settings, and operational preferences.",
    columns: ["Setting", "Area", "Value", "Status", "Updated", "Owner"],
    rows: [["Website name", "Brand", "Bindi's Cupcakery", "Active", "Today", "Admin"], ["Theme", "Design", "Luxury bakery", "Active", "Today", "Admin"], ["SMTP", "Email", "Configured", "Active", "Yesterday", "Admin"], ["Razorpay", "Payments", "Sandbox", "Review", "2 days ago", "Admin"]],
    stats: [["Brand", "Ready"], ["SEO", "92%"], ["SMTP", "On"], ["Payments", "Sandbox"]],
    actions: ["Save settings", "Upload logo", "Theme colors", "API keys"],
  },
};

export function AdminModulePage({ module }) {
  const config = moduleData[module];
  const [query, setQuery] = useState("");
  const rows = useMemo(() => config.rows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [config.rows, query]);

  return (
    <AdminShell
      title={config.title}
      subtitle={config.subtitle}
      actions={<button className="btn-luxury hidden gap-2 md:inline-flex"><FiPlus /> New</button>}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {config.stats.map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-cream-deep bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-espresso-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        {config.actions.map((action) => (
          <button key={action} className="flex items-center gap-3 rounded-[1.5rem] border border-cream-deep bg-white p-4 text-left text-sm font-bold text-espresso-900 shadow-card transition hover:-translate-y-1 hover:border-gold hover:shadow-card-hover">
            <FiCheckCircle className="text-gold-dark" />
            {action}
          </button>
        ))}
      </div>

      <DataToolbar search={query} setSearch={setQuery} actionLabel="Export" />

      <Panel title={`${config.title} Table`} subtitle="Searchable, export-ready operational table" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="text-xs uppercase tracking-widest text-ink-muted">
              <tr>
                {config.columns.map((column) => <th key={column} className="pb-3">{column}</th>)}
                <th className="pb-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-cream/70">
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`} className="py-4 text-sm">
                      {cellIndex === 0 ? <span className="font-bold text-espresso-900">{cell}</span> : ["Active", "Paid", "Ready", "Published", "Approved", "Allowed", "Healthy"].includes(String(cell)) || String(cell).includes("stock") || String(cell).includes("Failed") || String(cell).includes("Pending") || String(cell).includes("Banned") ? <StatusPill status={cell} /> : <span className="text-ink-muted">{cell}</span>}
                    </td>
                  ))}
                  <td className="py-4 text-right">
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-3 py-2 text-xs font-bold text-espresso-900 hover:border-gold">
                      <FiSettings />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center text-ink-muted">
            <FiSearch size={32} className="mb-3" />
            No records match your search.
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}
