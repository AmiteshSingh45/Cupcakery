"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../../../Context/auth";
import moment from "moment";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag, FiX, FiClock, FiAlertCircle,
  FiChevronDown, FiChevronUp, FiRefreshCw,
} from "react-icons/fi";
// ✅ Use centralized api instance — correct BACKEND URL + 3-retry logic
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import OrderTracker from "@/components/OrderTracker";
import DeliveryETA from "@/components/DeliveryETA";
import UserMenu from "@/components/Usermenu";

// ── Status badge styling ────────────────────────────────────────────────────
const STATUS_STYLES = {
  "Pending Approval": "bg-amber-100 text-amber-800 border-amber-200",
  "Approved": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Preparing": "bg-orange-100 text-orange-800 border-orange-200",
  "Baking": "bg-red-100 text-red-800 border-red-200",
  "Packed": "bg-purple-100 text-purple-800 border-purple-200",
  "Out for Delivery": "bg-blue-100 text-blue-800 border-blue-200",
  "Delivered": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Cancelled": "bg-rose-100 text-rose-800 border-rose-200",
  "Rejected": "bg-rose-100 text-rose-800 border-rose-200",
  "Refunded": "bg-sky-100 text-sky-800 border-sky-200",
};

const STATUS_ICONS = {
  "Pending Approval": "🛍️", "Approved": "✅", "Preparing": "👩‍🍳",
  "Baking": "🔥", "Packed": "📦", "Out for Delivery": "🛵",
  "Delivered": "🎉", "Cancelled": "❌", "Rejected": "🚫", "Refunded": "💸",
};

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

// ── Single Order Card ───────────────────────────────────────────────────────
function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const status = order.status || order.order_status || "Pending Approval";
  const statusStyle = STATUS_STYLES[status] || "bg-cream-warm text-espresso-900 border-cream-deep";

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await onCancel(order._id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-3xl border border-cream-deep/70 bg-white shadow-card overflow-hidden"
    >
      {/* ── Card top bar ────────────────────────────────────────── */}
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-cream-deep/50">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">Order ID</p>
          <p className="font-display text-base font-bold text-espresso-900">
            {order.order_id || order._id}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            <FiClock size={10} className="inline mr-1" />
            {moment(order.createdAt).format("MMM D, YYYY [at] h:mm A")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold ${statusStyle}`}>
            <span>{STATUS_ICONS[status]}</span>
            {status}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-deep text-ink-muted hover:border-gold hover:text-gold-dark transition"
          >
            {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Summary row ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-cream-deep/50 px-5 py-4">
        <div className="pr-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">Amount</p>
          <p className="mt-0.5 font-bold text-espresso-900 text-lg">{formatCurrency(order.final_amount ?? order.amount)}</p>
        </div>
        <div className="px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">Items</p>
          <p className="mt-0.5 font-bold text-espresso-900 text-lg">
            {(order.orderItems || order.products || []).length}
          </p>
        </div>
        <div className="pl-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">Payment</p>
          <p className={`mt-0.5 text-sm font-bold ${order.payment?.success ? "text-emerald-600" : "text-amber-600"}`}>
            {order.payment?.success ? "Paid ✓" : "Pending"}
          </p>
        </div>
      </div>

      {/* ── Expandable section ─────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-cream-deep/50 p-5">
              {/* ETA */}
              <DeliveryETA order={order} />

              {/* Order Items */}
              {(order.orderItems || order.products || []).length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Items</p>
                  <div className="space-y-2">
                    {(order.orderItems || order.products || []).map((item, i) => (
                      <div
                        key={item._id || i}
                        className="flex items-center gap-3 rounded-2xl bg-cream-warm p-3"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl flex-shrink-0 shadow-sm">
                          🧁
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-espresso-900 truncate">{item.name}</p>
                          <p className="text-xs text-ink-muted">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="font-bold text-sm text-gold-dark flex-shrink-0">
                          {formatCurrency(item.subtotal || (item.price * (item.quantity || 1)))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Tracker */}
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Order Progress</p>
                <OrderTracker order={order} />
              </div>

              {/* Delivery info */}
              {(order.buyer?.address || order.delivery_slot) && (
                <div className="rounded-2xl bg-cream-warm p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Delivery Info</p>
                  {order.buyer?.address && (
                    <p className="text-sm text-espresso-900">{order.buyer.address}</p>
                  )}
                  {order.delivery_slot && (
                    <p className="text-sm text-ink-muted mt-1">Slot: {order.delivery_slot}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="rounded-2xl bg-cream-warm p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted mb-1">Special Instructions</p>
                  <p className="text-sm text-espresso-900">{order.notes}</p>
                </div>
              )}

              {/* Price breakdown */}
              <div className="rounded-2xl border border-cream-deep p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Bill Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Delivery fee</span>
                  <span>{formatCurrency(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-cream-deep pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-gold-dark">{formatCurrency(order.final_amount ?? order.amount)}</span>
                </div>
              </div>

              {/* Cancel button — only if Pending Approval */}
              {status === "Pending Approval" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full rounded-2xl border-2 border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}

              {/* View full details link */}
              <Link
                href={`/dashboard/user/orders/${order._id}`}
                className="block w-full text-center rounded-2xl bg-espresso-900 px-5 py-3 text-sm font-bold text-cream hover:bg-espresso-800 transition"
              >
                View Full Details →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth] = useAuth();
  const [activeTab, setActiveTab] = useState("active"); // "active" | "all" | "completed" | "cancelled"

  // ── Fetch orders ──────────────────────────────────────────────────────────
  // ✅ FIX: Use centralized api instance — no raw axios, no hardcoded BACKEND
  // The api instance reads NEXT_PUBLIC_API_URL at runtime, has 20s timeout,
  // 3 auto-retries, and automatically attaches the Bearer token via interceptor.
  const fetchOrders = useCallback(async () => {
    // ✅ RACE CONDITION FIX: auth starts as `null` on first render (localStorage
    // is async). We guard here — the useEffect below will re-run once auth populates.
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    try {
      // api interceptor already attaches Authorization header automatically
      const { data } = await api.get("/api/v1/payment/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load orders";
      setError(`Failed to load orders. ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  // Re-runs whenever auth.token changes (handles the race condition:
  // initially auth=null → no fetch. Once localStorage loads → auth.token
  // is set → fetchOrders re-runs properly)
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Real-time Socket.IO updates ───────────────────────────────────────────
  useEffect(() => {
    if (!auth?.token) return;
    const socket = connectSocket(auth.token);

    const upsertOrder = (incoming) => {
      setOrders((prev) => {
        const index = prev.findIndex(
          (o) => o._id === incoming._id || o.order_id === incoming.order_id
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = incoming;
          return updated;
        }
        return [incoming, ...prev];
      });

      // Notify user of status change
      const status = incoming.status || incoming.order_status;
      const message = incoming.status_message || `Order status: ${status}`;
      if (status === "Delivered") {
        toast.success(`🎉 ${message}`, { duration: 5000 });
      } else if (status === "Out for Delivery") {
        toast.success(`🛵 ${message}`, { duration: 4000 });
      } else if (["Cancelled", "Rejected"].includes(status)) {
        toast.error(`❌ Order ${status.toLowerCase()}`);
      } else {
        toast.success(`📦 ${message}`, { duration: 3000 });
      }
    };

    if (socket) {
      socket.on("orderUpdated", upsertOrder);
      socket.on("orderCreated", upsertOrder);
    }

    return () => {
      if (socket) {
        socket.off("orderUpdated", upsertOrder);
        socket.off("orderCreated", upsertOrder);
      }
    };
  }, [auth?.token]);

  // ── Cancel order ──────────────────────────────────────────────────────────
  const cancelOrder = async (orderId) => {
    try {
      const { data } = await api.post(
        `/api/v1/payment/orders/${orderId}/cancel`,
        { reason: "Cancelled by customer" }
      );
      if (data?.order) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
        toast.success("Order cancelled successfully");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel order";
      toast.error(msg);
    }
  };

  // ── Filter tabs ───────────────────────────────────────────────────────────
  const activeOrders = orders.filter((o) =>
    !["Delivered", "Cancelled", "Rejected", "Refunded"].includes(o.status || o.order_status)
  );
  const completedOrders = orders.filter((o) =>
    (o.status || o.order_status) === "Delivered"
  );
  const cancelledOrders = orders.filter((o) =>
    ["Cancelled", "Rejected", "Refunded"].includes(o.status || o.order_status)
  );

  const tabOrders = {
    active: activeOrders,
    all: orders,
    completed: completedOrders,
    cancelled: cancelledOrders,
  }[activeTab];

  const tabs = [
    { key: "active", label: "Active", count: activeOrders.length },
    { key: "all", label: "All Orders", count: orders.length },
    { key: "completed", label: "Delivered", count: completedOrders.length },
    { key: "cancelled", label: "Cancelled", count: cancelledOrders.length },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-espresso-900 min-h-screen">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div>
            <p className="font-display text-sm font-semibold text-cream">My Orders</p>
            <p className="text-[10px] text-cream/40">Bindi&apos;s Cupcakery</p>
          </div>
        </div>
        <div className="flex-1 p-4 pt-6">
          <UserMenu />
        </div>
        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-espresso-900 font-bold text-sm">
              {auth?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-cream text-sm font-medium truncate">{auth?.user?.name}</p>
              <p className="text-cream/40 text-xs truncate">{auth?.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            My Dashboard
          </span>
          <div className="flex items-center justify-between mt-1">
            <h1 className="font-display text-3xl font-semibold text-espresso-900">
              My Orders
            </h1>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-cream-deep bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted shadow-card hover:border-gold hover:text-gold-dark transition"
            >
              <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-espresso-900 text-cream shadow-card"
                  : "bg-white border border-cream-deep text-ink-muted hover:border-gold hover:text-espresso-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === tab.key ? "bg-gold text-espresso-900" : "bg-cream-warm text-ink-muted"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-white border border-cream-deep" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiAlertCircle size={40} className="mb-4 text-rose-400" />
            <p className="font-semibold text-espresso-900">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 rounded-2xl bg-espresso-900 px-6 py-3 text-sm font-bold text-cream hover:bg-espresso-800 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tabOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <span className="mb-5 text-6xl">
              {activeTab === "cancelled" ? "😔" : activeTab === "completed" ? "🎉" : "🛍️"}
            </span>
            <h2 className="font-display text-2xl font-semibold text-espresso-900 mb-2">
              {activeTab === "active"
                ? "No active orders"
                : activeTab === "completed"
                ? "No delivered orders yet"
                : activeTab === "cancelled"
                ? "No cancelled orders"
                : "No orders yet"}
            </h2>
            <p className="text-sm text-ink-muted mb-8 max-w-xs">
              {activeTab === "active"
                ? "Place an order and track it here in real-time."
                : "Your order history will appear here."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-gold px-8 py-3 font-bold text-espresso-900 hover:bg-gold-dark transition"
            >
              <FiShoppingBag />
              Shop Now
            </Link>
          </motion.div>
        )}

        {/* Orders list */}
        {!loading && !error && tabOrders.length > 0 && (
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {tabOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={cancelOrder}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
