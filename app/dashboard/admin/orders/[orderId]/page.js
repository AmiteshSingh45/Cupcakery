"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import { useAuth } from "../../../../../Context/auth";
import { BACKEND } from "@/lib/api";
import { connectSocket, joinOrderRoom } from "@/lib/socket";

const AdminOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;
  const [auth] = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!auth?.token) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`${BACKEND}/api/v1/payment/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setOrder(data);
      } catch (err) {
        setError("Unable to load order details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [auth?.token, orderId]);

  useEffect(() => {
    if (!auth?.token || !orderId) return;
    const socket = connectSocket(auth.token);
    if (!socket) return;

    const handleUpdate = (incoming) => {
      if (incoming._id === orderId || incoming.order_id === orderId) {
        setOrder(incoming);
      }
    };

    joinOrderRoom(orderId);
    socket.on("orderUpdated", handleUpdate);

    return () => {
      socket.off("orderUpdated", handleUpdate);
    };
  }, [auth?.token, orderId]);

  const updateStatus = async (newStatus) => {
    if (!order) return;
    setStatusUpdating(true);
    try {
      const { data } = await axios.patch(
        `${BACKEND}/api/v1/payment/admin/orders/${order._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      setOrder(data.order);
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Admin Order</p>
            <h1 className="font-display text-3xl font-semibold text-espresso-900">Order Detail</h1>
            {order && (
              <p className="text-sm text-ink-muted mt-1">Order ID: {order.order_id || order._id}</p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-cream-deep bg-white px-5 py-3 text-sm font-semibold text-espresso-900 hover:border-gold hover:bg-cream transition"
          >
            Back to orders
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-ink-muted shadow-card">Loading order details…</div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-10 text-center text-rose-600 shadow-card">{error}</div>
        ) : order ? (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Status</p>
                  <p className="mt-2 inline-flex rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold text-espresso-900">{order.order_status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Payment</p>
                  <p className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${order.payment?.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>
                    {order.payment?.success ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-2xl bg-cream-warm p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Customer</p>
                  <p className="mt-3 text-sm font-semibold text-espresso-900">{order.userShipping?.name}</p>
                  <p className="text-sm text-ink-muted">{order.userShipping?.email}</p>
                  <p className="text-sm text-ink-muted">{order.userShipping?.phone}</p>
                </div>
                <div className="rounded-2xl bg-cream-warm p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Delivery</p>
                  <p className="mt-3 text-sm text-espresso-900">{order.address?.full || order.userShipping?.address || "—"}</p>
                  <p className="text-sm text-ink-muted">Slot: {order.delivery_slot || "Not set"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-2xl bg-cream-warm p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Subtotal</p>
                  <p className="mt-3 text-lg font-semibold text-espresso-900">₹{order.subtotal}</p>
                </div>
                <div className="rounded-2xl bg-cream-warm p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Total</p>
                  <p className="mt-3 text-lg font-semibold text-espresso-900">₹{order.final_amount}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.products?.map((product) => (
                  <div key={product.productId || product._id} className="flex flex-col gap-3 rounded-3xl border border-cream-deep/30 bg-cream-warm p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-white">
                        <Image
                          src={product.image || `${BACKEND}/api/v1/product/product-photo/${product.productId}`}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-espresso-900">{product.name}</p>
                        <p className="text-sm text-ink-muted">{product.description || "No description available."}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-espresso-900">
                      <span>Qty: {product.quantity || 1}</span>
                      <span>Price: ₹{product.price}</span>
                      <span>Subtotal: ₹{product.subtotal ?? (product.quantity || 1) * (product.price || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <h2 className="font-display text-xl font-semibold text-espresso-900 mb-5">Timeline</h2>
                <div className="space-y-4">
                  {(order.timeline?.length ? order.timeline : [{ label: order.order_status, note: "Order created." }]).map((item, index) => (
                    <div key={index} className="rounded-3xl bg-cream-warm p-4">
                      <p className="font-semibold text-espresso-900">{item.label}</p>
                      <p className="text-sm text-ink-muted mt-2">{item.note}</p>
                      {item.createdAt && <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-muted">{moment(item.createdAt).format("LLL")}</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <h2 className="font-display text-xl font-semibold text-espresso-900 mb-5">Actions</h2>
                <div className="space-y-3">
                  {['Approved', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      disabled={statusUpdating || order.order_status === nextStatus}
                      onClick={() => updateStatus(nextStatus)}
                      className="w-full rounded-2xl bg-espresso-900 px-4 py-3 text-sm font-semibold text-cream hover:bg-espresso-800 disabled:opacity-60"
                    >
                      {statusUpdating && order.order_status !== nextStatus ? 'Updating…' : `Mark ${nextStatus}`}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center text-ink-muted shadow-card">Order not found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
