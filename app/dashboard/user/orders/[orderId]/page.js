"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import moment from "moment";
import { useAuth } from "../../../../../Context/auth";
import { BACKEND } from "@/lib/api";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;
  const [auth] = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        setError("Unable to load order details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [auth?.token, orderId]);

  const handleCancel = async () => {
    if (!order || order.order_status !== "Pending Approval") return;
    setCancelling(true);
    try {
      const { data } = await axios.post(
        `${BACKEND}/api/v1/payment/orders/${order._id}/cancel`,
        { reason: "Cancelled by customer before approval" },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      setOrder(data.order);
    } catch (err) {
      setError("Unable to cancel order. Please try again.");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (!auth?.token) {
    return (
      <div className="min-h-screen bg-cream px-6 py-10">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-espresso-900 mb-4">Please sign in</h1>
          <p className="text-ink-muted mb-6">You must be logged in to view order details.</p>
          <button onClick={() => router.push("/Login")} className="btn-luxury">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Order Details</p>
            <h1 className="font-display text-3xl font-semibold text-espresso-900">Order #{order?.order_id || orderId}</h1>
            <p className="text-sm text-ink-muted mt-2">{order ? `Placed ${moment(order.createdAt).fromNow()}` : "Loading order..."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/user/orders" className="inline-flex items-center justify-center rounded-2xl border border-cream-deep bg-white px-5 py-3 text-sm font-semibold text-espresso-900 hover:border-gold hover:bg-cream transition">
              Back to orders
            </Link>
            {order?.order_status === "Pending Approval" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-ink-muted shadow-card">Loading order details…</div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-10 text-center text-rose-600 shadow-card">{error}</div>
        ) : order ? (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Status</p>
                    <p className="mt-2 rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold text-espresso-900">{order.order_status}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Payment</p>
                    <p className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${order.payment?.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>
                      {order.payment?.success ? "Paid" : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-cream-warm p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Delivery Address</p>
                    <p className="mt-3 text-sm text-espresso-900">{order.address?.full || order.userShipping?.address || "—"}</p>
                    <p className="mt-2 text-sm text-ink-muted">{order.userShipping?.name}</p>
                    <p className="text-sm text-ink-muted">{order.phone_number || order.userShipping?.phone}</p>
                  </div>
                  <div className="rounded-2xl bg-cream-warm p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Order summary</p>
                    <div className="mt-3 space-y-2 text-sm text-espresso-900">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                      <div className="flex justify-between"><span>Delivery fee</span><span>₹{order.delivery_fee}</span></div>
                      <div className="flex justify-between"><span className="font-semibold">Total</span><span className="font-semibold">₹{order.final_amount}</span></div>
                      <div className="flex justify-between"><span>Method</span><span>{order.payment_method || "Razorpay"}</span></div>
                      <div className="flex justify-between"><span>Slot</span><span>{order.delivery_slot || "Not set"}</span></div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <h2 className="font-display text-xl font-semibold text-espresso-900 mb-5">Items</h2>
                <div className="space-y-4">
                  {order.products?.map((product) => (
                    <div key={product.productId || product._id} className="flex items-start gap-4 rounded-3xl border border-cream-deep/30 bg-cream-warm p-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-white">
                        <Image
                          src={product.image || `${BACKEND}/api/v1/product/product-photo/${product.productId}`}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-espresso-900">{product.name}</p>
                        <p className="text-sm text-ink-muted mt-1">{product.description || "No description available."}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-espresso-900">
                          <span>Qty: {product.quantity || 1}</span>
                          <span>Price: ₹{product.price}</span>
                          <span>Subtotal: ₹{product.subtotal ?? (product.quantity || 1) * (product.price || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <h2 className="font-display text-xl font-semibold text-espresso-900 mb-5">Timeline</h2>
                <div className="space-y-4">
                  {(order.timeline && order.timeline.length ? order.timeline : [{ label: order.order_status, note: "Order status updated." }]).map((item, index) => (
                    <div key={index} className="rounded-3xl bg-cream-warm p-4">
                      <p className="font-semibold text-espresso-900">{item.label}</p>
                      <p className="text-sm text-ink-muted mt-2">{item.note}</p>
                      {item.createdAt && <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-muted">{moment(item.createdAt).format("LLL")}</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-card border border-cream-deep/40">
                <h2 className="font-display text-xl font-semibold text-espresso-900 mb-5">Notes</h2>
                <p className="text-sm text-ink-muted">{order.notes || "No special notes."}</p>
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

export default OrderDetailPage;
