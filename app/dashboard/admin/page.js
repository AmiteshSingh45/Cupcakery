"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { FiBox, FiCreditCard, FiShoppingBag, FiStar, FiTag, FiTrendingUp, FiUsers, FiAlertCircle } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { BarChart, LineChart, Panel, StatCard, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { buildAdminMetrics, formatCurrency, orderSeries, revenueSeries } from "@/lib/adminData";
import { catalogCategories, catalogProducts } from "@/lib/catalog";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/Context/auth";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [auth] = useAuth();

  const catalogMetrics = buildAdminMetrics();
  const bestSellers = catalogProducts.filter((p) => p.featured).slice(0, 5);
  const lowStock = catalogProducts.filter((p) => (p.stock || p.quantity || 0) < 18).slice(0, 5);

  // ── Fetch real metrics and orders ────────────────────────────────────────
  useEffect(() => {
    if (!auth?.token) return;

    // Fetch order stats
    api.get("/api/v1/payment/admin/orders/stats")
      .then(({ data }) => {
        if (data?.success) setApiMetrics(data.stats);
      })
      .catch(() => {})
      .finally(() => setMetricsLoading(false));

    // Fetch recent orders
    api.get("/api/v1/payment/admin/orders", { params: { limit: 10 } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.orders || []);
        setOrders(list);
      })
      .catch(() => setOrders([]));
  }, [auth?.token]);

  // ── Socket for real-time new orders ─────────────────────────────────────
  useEffect(() => {
    if (!auth?.token) return;
    const socket = connectSocket(auth.token);
    if (!socket) return;

    const handleNew = (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        return exists ? prev : [order, ...prev].slice(0, 10);
      });
      // Bump pending count
      setApiMetrics((prev) => prev ? { ...prev, pending: (prev.pending || 0) + 1 } : prev);
    };

    const handleUpdate = (order) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    };

    socket.on("orderCreated", handleNew);
    socket.on("orderUpdated", handleUpdate);

    return () => {
      socket.off("orderCreated", handleNew);
      socket.off("orderUpdated", handleUpdate);
    };
  }, [auth?.token]);

  // ── Build metrics (prefer API, fall back to catalog) ────────────────────
  const metrics = useMemo(() => {
    if (apiMetrics) {
      return {
        revenue: apiMetrics.revenue || 0,
        orders: apiMetrics.total || orders.length,
        pending: apiMetrics.pending || 0,
        completed: apiMetrics.delivered || 0,
        cancelled: apiMetrics.cancelled || 0,
        users: catalogMetrics.users,
        products: catalogMetrics.products,
        categories: catalogMetrics.categories,
        lowStock: catalogMetrics.lowStock,
        wishlist: catalogMetrics.wishlist,
      };
    }
    if (orders.length) {
      return {
        revenue: orders.reduce((sum, o) => sum + (o.final_amount || 0), 0),
        orders: orders.length,
        pending: orders.filter((o) => o.status === "Pending Approval").length,
        completed: orders.filter((o) => o.status === "Delivered").length,
        cancelled: orders.filter((o) => ["Cancelled", "Rejected"].includes(o.status)).length,
        users: catalogMetrics.users,
        products: catalogMetrics.products,
        categories: catalogMetrics.categories,
        lowStock: catalogMetrics.lowStock,
        wishlist: catalogMetrics.wishlist,
      };
    }
    return catalogMetrics;
  }, [apiMetrics, orders, catalogMetrics]);

  const pendingOrders = orders.filter((o) => o.status === "Pending Approval").slice(0, 5);

  return (
    <AdminShell
      title="Dashboard Overview"
      subtitle="Revenue, operations, customers, inventory, and quality signals for Bindi's Cupcakery."
    >
      {/* ── Pending orders alert ───────────────────────────────────────── */}
      {pendingOrders.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <FiAlertCircle className="text-amber-600" size={20} />
            <p className="font-semibold text-amber-900">
              {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} awaiting approval
            </p>
            <Link
              href="/dashboard/admin/orders"
              className="ml-auto rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              Review Orders →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingOrders.map((order) => (
              <Link
                key={order._id}
                href="/dashboard/admin/orders"
                className="flex items-center gap-2 rounded-xl bg-white border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-900 hover:border-amber-400 transition"
              >
                <span>{order.order_id || order._id}</span>
                <span className="text-amber-600">• {order.buyer?.name || "Customer"}</span>
                <span className="text-amber-500">• {formatCurrency(order.final_amount)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Revenue", value: formatCurrency(metrics.revenue), delta: "Live", icon: <FiCreditCard />, tone: "gold" },
          { label: "Orders", value: metrics.orders, delta: "Total", icon: <FiShoppingBag />, tone: "green" },
          { label: "Users", value: metrics.users, delta: "+9%", icon: <FiUsers />, tone: "rose" },
          { label: "Products", value: metrics.products, delta: "Total", icon: <FiBox />, tone: "dark" },
          { label: "Categories", value: metrics.categories, delta: "Total", icon: <FiTag />, tone: "gold" },
          { label: "Pending Approval", value: metrics.pending, delta: metricsLoading ? "..." : "Live", icon: <FiTrendingUp />, tone: metrics.pending > 0 ? "rose" : "gold" },
          { label: "Delivered", value: metrics.completed, delta: "Total", icon: <FiShoppingBag />, tone: "green" },
          { label: "Cancelled", value: metrics.cancelled, delta: "Total", icon: <FiCreditCard />, tone: "rose" },
          { label: "Low Stock", value: metrics.lowStock, delta: "Watch", icon: <FiBox />, tone: "rose" },
          { label: "Wishlist", value: metrics.wishlist, delta: "+31", icon: <FiStar />, tone: "gold" },
        ].map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="Revenue Analytics" subtitle="Monthly sales and payment performance">
          <LineChart data={revenueSeries} labels={["Jan", "Mar", "May", "Jul", "Sep", "Nov"]} />
        </Panel>
        <Panel title="Orders Over Time" subtitle="Weekly order trend">
          <BarChart data={orderSeries.slice(-8)} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Recent orders — real data */}
        <Panel title="Recent Orders" subtitle="Latest customer checkout activity" className="xl:col-span-2">
          {orders.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center text-center text-ink-muted">
              <span className="mb-2 text-3xl">📭</span>
              <p className="text-sm">{metricsLoading ? "Loading orders..." : "No orders yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left">
                <thead className="text-xs uppercase tracking-widest text-ink-muted">
                  <tr>
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {orders.slice(0, 8).map((order) => (
                    <tr key={order._id} className="hover:bg-cream/40">
                      <td className="py-3 text-sm font-bold text-espresso-900">
                        {order.order_id || order._id?.slice(-8)}
                      </td>
                      <td className="py-3 text-sm text-ink-muted">{order.buyer?.name || "Customer"}</td>
                      <td className="py-3 text-sm font-bold text-espresso-900">
                        {formatCurrency(order.final_amount)}
                      </td>
                      <td className="py-3">
                        <StatusPill status={order.status || order.order_status} />
                      </td>
                      <td className="py-3 text-xs text-ink-muted">
                        {moment(order.createdAt).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-center">
                <Link
                  href="/dashboard/admin/orders"
                  className="text-xs font-bold uppercase tracking-widest text-gold-dark hover:underline"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          )}
        </Panel>

        {/* Low stock */}
        <Panel title="Low Stock Alerts" subtitle="Products needing replenishment">
          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">All products are well-stocked 🎉</p>
            ) : (
              lowStock.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-2xl bg-cream-warm p-4">
                  <div>
                    <p className="text-sm font-semibold text-espresso-900">{product.name}</p>
                    <p className="text-xs text-ink-muted">{product.category?.name || product.category}</p>
                  </div>
                  <span className="rounded-full bg-blush-light px-3 py-1 text-xs font-bold text-blush-rose">
                    {product.stock || product.quantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Best sellers */}
        <Panel title="Best Selling Products" subtitle="Top merchandising opportunities">
          <div className="space-y-4">
            {bestSellers.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-espresso-900">
                    {index + 1}. {product.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {product.reviewCount} reviews · {product.rating} ★
                  </p>
                </div>
                <p className="font-bold text-gold-dark">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Category-wise */}
        <Panel title="Category-wise Sales" subtitle="Collection contribution">
          <div className="space-y-3">
            {catalogCategories.slice(0, 6).map((category, index) => (
              <div key={category.slug}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-muted">
                  <span>{category.name}</span>
                  <span>{12 + index * 9}%</span>
                </div>
                <div className="h-2 rounded-full bg-cream-warm">
                  <div
                    className="h-2 rounded-full bg-gold"
                    style={{ width: `${32 + index * 9}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Order status breakdown */}
        <Panel title="Order Status Breakdown" subtitle="Live fulfillment pipeline">
          <div className="space-y-3">
            {[
              { label: "Pending Approval", value: metrics.pending, color: "bg-amber-500" },
              { label: "Delivered", value: metrics.completed, color: "bg-emerald-500" },
              { label: "Cancelled", value: metrics.cancelled, color: "bg-rose-500" },
            ].map((item) => {
              const pct = metrics.orders > 0 ? Math.round((item.value / metrics.orders) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs font-semibold text-ink-muted">
                    <span>{item.label}</span>
                    <span>{item.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream-warm">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!metricsLoading && metrics.orders === 0 && (
              <p className="text-xs text-ink-muted text-center py-4">No orders data yet</p>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
