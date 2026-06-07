"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import moment from "moment";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FiCheck, FiChevronDown, FiClock, FiDownload, FiFileText,
  FiPrinter, FiRefreshCw, FiSearch, FiSend, FiTruck, FiX, FiAlertCircle,
} from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataToolbar, Panel, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { adminStatuses, formatCurrency } from "@/lib/adminData";
import { getProductImage } from "@/lib/catalog";
import { useAuth } from "@/Context/auth";
import { connectSocket } from "@/lib/socket";

// ── Status quick-action buttons ────────────────────────────────────────────
const STATUS_ACTIONS = [
  { label: "Approve", status: "Approved", color: "bg-green-600 hover:bg-green-700", icon: <FiCheck size={13} /> },
  { label: "Preparing", status: "Preparing", color: "bg-amber-600 hover:bg-amber-700", icon: <FiClock size={13} /> },
  { label: "Baking", status: "Baking", color: "bg-orange-600 hover:bg-orange-700", icon: "🍰" },
  { label: "Packed", status: "Packed", color: "bg-purple-600 hover:bg-purple-700", icon: "📦" },
  { label: "Out for Delivery", status: "Out for Delivery", color: "bg-blue-600 hover:bg-blue-700", icon: <FiTruck size={13} /> },
  { label: "Delivered", status: "Delivered", color: "bg-emerald-600 hover:bg-emerald-700", icon: "🎉" },
  { label: "Reject", status: "Rejected", color: "bg-rose-600 hover:bg-rose-700", icon: <FiX size={13} /> },
];

export default function AdminOrdersPage() {
  // ── State — start EMPTY (no mock fallback for real orders) ────────────────
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [auth] = useAuth();

  // ── Fetch orders from real backend ─────────────────────────────────────────
  const fetchOrders = async () => {
    if (!auth?.token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/api/v1/payment/admin/orders");
      // API now returns { orders: [...], total, page, pages }
      const list = Array.isArray(data) ? data : (data?.orders || []);
      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load orders";
      setFetchError(msg);
      toast.error(`Failed to load orders: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [auth?.token]);

  // ── Socket.IO — real-time order updates ────────────────────────────────────
  useEffect(() => {
    if (!auth?.token) return;
    const socket = connectSocket(auth.token);

    const upsertOrder = (incoming) => {
      setOrders((current) => {
        const index = current.findIndex(
          (item) => item._id === incoming._id || item.order_id === incoming.order_id
        );
        if (index >= 0) {
          const next = [...current];
          next[index] = incoming;
          return next;
        }
        return [incoming, ...current];
      });

      setSelectedOrder((current) => {
        if (!current) return current;
        if (current._id === incoming._id || current.order_id === incoming.order_id) {
          return incoming;
        }
        return current;
      });
    };

    if (socket) {
      socket.on("orderCreated", upsertOrder);
      socket.on("orderUpdated", upsertOrder);
    }

    return () => {
      if (socket) {
        socket.off("orderCreated", upsertOrder);
        socket.off("orderUpdated", upsertOrder);
      }
    };
  }, [auth?.token]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const visibleOrders = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !q ||
        [order._id, order.order_id, order.buyer?.name, order.buyer?.email, order.status]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesStatus = statusFilter === "All" || order.status === statusFilter || order.order_status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  // ── Status update — THE FIX ────────────────────────────────────────────────
  const updateStatus = async (order, nextStatus) => {
    if (!order._id || !auth?.token) {
      toast.error("Cannot update: missing order ID or not authenticated");
      return;
    }

    // Optimistic update
    const prevOrders = orders;
    const prevSelected = selectedOrder;
    setOrders((current) =>
      current.map((item) =>
        item._id === order._id ? { ...item, status: nextStatus, order_status: nextStatus } : item
      )
    );
    setSelectedOrder((current) =>
      current?._id === order._id ? { ...current, status: nextStatus, order_status: nextStatus } : current
    );

    setUpdatingId(order._id);
    try {
      const { data } = await api.patch(
        `/api/v1/payment/admin/orders/${order._id}/status`,
        { status: nextStatus }
      );
      // Update with fresh server data
      if (data?.order) {
        setOrders((current) =>
          current.map((item) => (item._id === data.order._id ? data.order : item))
        );
        setSelectedOrder((current) =>
          current?._id === data.order._id ? data.order : current
        );
      }
      toast.success(`✅ Order status updated to "${nextStatus}"`);
    } catch (err) {
      // Revert on failure — never show stale local state
      setOrders(prevOrders);
      setSelectedOrder(prevSelected);
      const msg = err.response?.data?.message || "Failed to update order status";
      toast.error(`❌ ${msg}`);
      console.error("Order status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── ETA update ─────────────────────────────────────────────────────────────
  const updateETA = async (order, etaMinutes) => {
    try {
      const { data } = await api.patch(
        `/api/v1/payment/admin/orders/${order._id}/eta`,
        { eta_minutes: etaMinutes }
      );
      if (data?.order) {
        setOrders((current) =>
          current.map((item) => (item._id === data.order._id ? data.order : item))
        );
        setSelectedOrder((current) => (current?._id === data.order._id ? data.order : current));
      }
      toast.success("ETA updated");
    } catch {
      toast.error("Failed to update ETA");
    }
  };

  return (
    <AdminShell
      title="Order Management"
      subtitle="Manage, track, and update all customer orders in real-time."
      actions={
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex h-11 items-center gap-2 rounded-2xl border border-cream-deep bg-white px-4 text-sm font-semibold text-ink-muted shadow-card transition hover:border-gold"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        {/* ── Orders Table ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <DataToolbar
            search={query}
            setSearch={setQuery}
            actionLabel="Export Orders"
            filters={
              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 rounded-2xl border border-cream-deep bg-white px-4 text-sm outline-none focus:border-gold"
              >
                <option value="All">All Statuses</option>
                {adminStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            }
          />

          <Panel
            title="Orders"
            subtitle={
              loading
                ? "Loading orders..."
                : fetchError
                ? `Error: ${fetchError}`
                : `${visibleOrders.length} of ${orders.length} orders`
            }
          >
            {/* Error state */}
            {fetchError && !loading && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                <FiAlertCircle size={18} />
                <div>
                  <p className="text-sm font-semibold">Failed to load orders from backend</p>
                  <p className="text-xs">{fetchError}</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="ml-auto rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-cream-warm" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !fetchError && orders.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <span className="mb-3 text-5xl">📭</span>
                <p className="font-semibold text-espresso-900">No orders yet</p>
                <p className="mt-1 text-sm text-ink-muted">Orders will appear here once customers checkout.</p>
              </div>
            )}

            {/* Orders table */}
            {!loading && visibleOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="text-xs uppercase tracking-widest text-ink-muted">
                    <tr>
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Quick Actions</th>
                      <th className="pb-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-deep">
                    {visibleOrders.map((order) => (
                      <tr
                        key={order._id}
                        className={`hover:bg-cream/60 transition-colors ${
                          selectedOrder?._id === order._id ? "bg-gold/5" : ""
                        }`}
                      >
                        <td className="py-4">
                          <p className="font-bold text-espresso-900 text-sm">{order.order_id || order._id}</p>
                          <p className="text-[10px] text-ink-muted">{moment(order.createdAt).fromNow()}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-semibold text-espresso-900">{order.buyer?.name || "Customer"}</p>
                          <p className="text-xs text-ink-muted">{order.buyer?.email || "No email"}</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-espresso-900">
                          {formatCurrency(order.final_amount ?? order.amount)}
                        </td>
                        <td className="py-4">
                          <StatusPill status={order.payment?.success ? "Paid" : "Pending"} />
                        </td>
                        <td className="py-4">
                          <StatusPill status={order.status || order.order_status} />
                        </td>
                        <td className="py-4">
                          {/* Quick next-step actions */}
                          <div className="flex flex-wrap gap-1">
                            {STATUS_ACTIONS.slice(0, 3).map((action) => (
                              <button
                                key={action.status}
                                disabled={updatingId === order._id || order.status === action.status}
                                onClick={() => updateStatus(order, action.status)}
                                title={action.label}
                                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white transition disabled:opacity-40 ${action.color}`}
                              >
                                <span>{action.icon}</span>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedOrder((curr) =>
                                curr?._id === order._id ? null : order
                              )
                            }
                            className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-gold hover:text-gold-dark transition"
                          >
                            <FiFileText size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Order Detail Panel ──────────────────────────────────────────── */}
        <Panel
          title={selectedOrder ? (selectedOrder.order_id || selectedOrder._id) : "Order Details"}
          subtitle={
            selectedOrder
              ? `${moment(selectedOrder.createdAt).format("LLL")} • ${selectedOrder.status}`
              : "Select an order to inspect"
          }
          action={
            selectedOrder && (
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-ink-muted hover:bg-cream-warm"
              >
                <FiX />
              </button>
            )
          }
        >
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Customer info */}
              <div className="rounded-2xl bg-cream-warm p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Customer</p>
                <p className="font-semibold text-espresso-900">{selectedOrder.buyer?.name}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.email}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.phone}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.address}</p>
              </div>

              {/* Products */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Items</p>
                <div className="space-y-2">
                  {(selectedOrder.orderItems || selectedOrder.products || []).map((product, i) => (
                    <div key={product._id || i} className="flex items-center gap-3 rounded-2xl border border-cream-deep p-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream-warm text-xl flex-shrink-0">
                        🧁
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-espresso-900">{product.name}</p>
                        <p className="text-xs text-ink-muted">Qty: {product.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-gold-dark text-sm">{formatCurrency(product.subtotal || product.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="rounded-2xl bg-cream-warm p-4 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Summary</p>
                <div className="flex justify-between text-sm"><span className="text-ink-muted">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-ink-muted">Delivery</span><span>{formatCurrency(selectedOrder.delivery_fee)}</span></div>
                <div className="flex justify-between text-sm font-bold"><span>Total</span><span className="text-gold-dark">{formatCurrency(selectedOrder.final_amount)}</span></div>
              </div>

              {/* ETA setter */}
              <div className="rounded-2xl border border-cream-deep p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Set ETA</p>
                <div className="flex gap-2 flex-wrap">
                  {[30, 45, 60, 90, 120, 240].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateETA(selectedOrder, mins)}
                      className="rounded-xl border border-cream-deep px-3 py-1.5 text-xs font-semibold text-espresso-900 hover:border-gold hover:text-gold-dark transition"
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>
                {selectedOrder.estimated_delivery && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Current ETA: {moment(selectedOrder.estimated_delivery).format("h:mm A, MMM D")}
                  </p>
                )}
              </div>

              {/* All status actions */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_ACTIONS.map((action) => (
                    <button
                      key={action.status}
                      disabled={updatingId === selectedOrder._id || selectedOrder.status === action.status}
                      onClick={() => updateStatus(selectedOrder, action.status)}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${action.color}`}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                      {selectedOrder.status === action.status && " ✓"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Timeline</p>
                <div className="space-y-3">
                  {(selectedOrder.timeline?.length
                    ? selectedOrder.timeline
                    : [{ label: selectedOrder.status, note: "Order status", createdAt: selectedOrder.createdAt }]
                  ).map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-3 w-3 rounded-full bg-gold flex-shrink-0" />
                        {i < (selectedOrder.timeline?.length || 1) - 1 && (
                          <div className="mt-1 w-px flex-1 min-h-4 bg-cream-deep" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-semibold text-espresso-900">{item.label}</p>
                        {item.note && <p className="text-xs text-ink-muted">{item.note}</p>}
                        {item.createdAt && (
                          <p className="text-[10px] text-ink-muted mt-0.5">
                            {moment(item.createdAt).format("LLL")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notify / Refund actions */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cream-deep">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-espresso-900 px-4 py-3 text-sm font-bold text-cream hover:bg-espresso-800 transition">
                  <FiSend size={14} />
                  Notify
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blush px-4 py-3 text-sm font-bold text-blush-rose hover:bg-blush-light transition">
                  <FiRefreshCw size={14} />
                  Refund
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center text-center text-ink-muted">
              <FiSearch size={34} className="mb-3 opacity-40" />
              <p className="text-sm font-semibold">Select an order</p>
              <p className="text-xs mt-1">to see full details, update status, and set ETA</p>
            </div>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
