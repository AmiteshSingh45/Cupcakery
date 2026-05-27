"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiDownload, FiFileText, FiPrinter, FiRefreshCw, FiSearch, FiSend, FiX } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataToolbar, Panel, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { adminOrders, adminStatuses, formatCurrency } from "@/lib/adminData";
import { getProductImage } from "@/lib/catalog";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(adminOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth") || "{}")?.token : "";

  useEffect(() => {
    if (!token) return;
    api.get("/api/v1/auth/all-orders", { headers: { Authorization: `Bearer ${token}` }, timeout: 2500, noRetry: true })
      .then(({ data }) => Array.isArray(data) && data.length && setOrders(data.map((order, index) => ({ ...adminOrders[index % adminOrders.length], ...order }))))
      .catch(() => setOrders(adminOrders));
  }, [token]);

  const visibleOrders = useMemo(() => {
    const normalized = query.toLowerCase();
    return orders.filter((order) => {
      const matchesQuery = !normalized || [order._id, order.buyer?.name, order.buyer?.email, order.status].join(" ").toLowerCase().includes(normalized);
      const matchesStatus = status === "All" || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  const updateStatus = async (order, nextStatus) => {
    setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status: nextStatus } : item));
    setSelectedOrder((current) => current?._id === order._id ? { ...current, status: nextStatus } : current);
    if (!token || String(order._id).startsWith("ORD-")) return toast.success(`Order marked ${nextStatus}`);
    try {
      await api.put(`/api/v1/auth/order-status/${order._id}`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Order status updated");
    } catch {
      toast.error("Saved locally. Backend did not accept the update.");
    }
  };

  return (
    <AdminShell title="Order Management" subtitle="Search, filter, update fulfillment, print invoices, manage refunds, and inspect customer timelines.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <DataToolbar
            search={query}
            setSearch={setQuery}
            actionLabel="Export Orders"
            filters={
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border border-cream-deep bg-white px-4 text-sm outline-none focus:border-gold">
                <option>All</option>
                {adminStatuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            }
          />
          <Panel title="Orders" subtitle={`${visibleOrders.length} orders visible`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="text-xs uppercase tracking-widest text-ink-muted">
                  <tr>
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Fulfillment</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {visibleOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-cream/60">
                      <td className="py-4 font-bold text-espresso-900">{order._id}</td>
                      <td className="py-4">
                        <p className="text-sm font-semibold text-espresso-900">{order.buyer?.name || "Customer"}</p>
                        <p className="text-xs text-ink-muted">{order.buyer?.email || "No email"}</p>
                      </td>
                      <td className="py-4 text-sm text-ink-muted">{order.products?.length || 0}</td>
                      <td className="py-4 text-sm font-bold text-espresso-900">{formatCurrency(order.amount)}</td>
                      <td className="py-4"><StatusPill status={order.payment?.success ? "Paid" : "Failed"} /></td>
                      <td className="py-4">
                        <select value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="h-10 rounded-xl border border-cream-deep bg-white px-3 text-xs font-semibold outline-none focus:border-gold">
                          {adminStatuses.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-gold hover:text-gold-dark"><FiFileText /></button>
                          <button className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-gold hover:text-gold-dark"><FiPrinter /></button>
                          <button className="rounded-full border border-cream-deep p-2 text-ink-muted hover:border-gold hover:text-gold-dark"><FiDownload /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          title={selectedOrder ? selectedOrder._id : "Order Details"}
          subtitle={selectedOrder ? "Customer, products, payment, notes, and timeline" : "Select an order from the table"}
          action={selectedOrder && <button onClick={() => setSelectedOrder(null)} className="rounded-full p-2 text-ink-muted hover:bg-cream-warm"><FiX /></button>}
        >
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="rounded-2xl bg-cream-warm p-4">
                <p className="font-semibold text-espresso-900">{selectedOrder.buyer?.name}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.email}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.phone}</p>
                <p className="text-sm text-ink-muted">{selectedOrder.buyer?.address}</p>
              </div>
              <div className="space-y-3">
                {selectedOrder.products?.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 rounded-2xl border border-cream-deep p-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-cream-warm">
                      <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-espresso-900">{product.name}</p>
                      <p className="text-xs text-ink-muted">{product.category?.name}</p>
                    </div>
                    <p className="font-bold text-gold-dark">{formatCurrency(product.price)}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-espresso-900 px-4 py-3 text-sm font-bold text-cream"><FiSend /> Notify</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blush px-4 py-3 text-sm font-bold text-blush-rose"><FiRefreshCw /> Refund</button>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-muted">Timeline</p>
                <div className="space-y-3">
                  {(selectedOrder.timeline || ["Order placed", selectedOrder.status]).map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="mt-1 h-3 w-3 rounded-full bg-gold" />
                      <p className="text-sm text-espresso-900">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center text-center text-ink-muted">
              <FiSearch size={34} className="mb-3" />
              Choose an order to inspect the complete invoice and fulfillment timeline.
            </div>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
