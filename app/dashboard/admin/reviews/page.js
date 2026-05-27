"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiMessageCircle, FiStar, FiTrash2, FiX } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataToolbar, Panel, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { adminReviews } from "@/lib/adminData";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(adminReviews);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth") || "{}")?.token : "";

  useEffect(() => {
    if (!token) return;
    api.get("/api/v1/reviews/admin/reviews", { headers: { Authorization: `Bearer ${token}` }, timeout: 2500, noRetry: true })
      .then(({ data }) => Array.isArray(data) && data.length && setReviews(data.map((review, index) => ({ ...adminReviews[index % adminReviews.length], ...review }))))
      .catch(() => setReviews(adminReviews));
  }, [token]);

  const visibleReviews = useMemo(() => reviews.filter((review) => {
    const matchesQuery = [review.user_name, review.review_text, review.product?.name].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || review.status === status;
    return matchesQuery && matchesStatus;
  }), [query, reviews, status]);

  const setReview = (id, patch) => setReviews((current) => current.map((review) => review._id === id ? { ...review, ...patch } : review));

  const approve = async (review) => {
    setReview(review._id, { status: "approved" });
    if (!token || String(review._id).startsWith("REV-")) return toast.success("Review approved");
    await api.put(`/api/v1/reviews/admin/reviews/approve/${review._id}`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => toast.error("Backend unavailable"));
  };

  return (
    <AdminShell title="Review Management" subtitle="Moderate reviews, feature social proof, reply to feedback, and monitor review quality.">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ["Total reviews", reviews.length],
          ["Pending", reviews.filter((review) => review.status === "pending").length],
          ["Approved", reviews.filter((review) => review.status === "approved").length],
          ["Featured", reviews.filter((review) => review.is_featured).length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-cream-deep bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-espresso-900">{value}</p>
          </div>
        ))}
      </div>

      <DataToolbar
        search={query}
        setSearch={setQuery}
        actionLabel="Export Reviews"
        filters={
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border border-cream-deep bg-white px-4 text-sm outline-none focus:border-gold">
            <option>All</option>
            <option>pending</option>
            <option>approved</option>
          </select>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {visibleReviews.map((review) => (
          <Panel key={review._id} title={review.user_name || "Anonymous"} subtitle={review.product?.name || "Store review"}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, index) => <FiStar key={index} fill={index < review.rating ? "currentColor" : "none"} />)}
              </div>
              <StatusPill status={review.status} />
            </div>
            <p className="min-h-20 text-sm leading-7 text-ink-muted">{review.review_text}</p>
            <textarea placeholder="Write an admin reply..." className="mt-4 min-h-20 w-full rounded-2xl border border-cream-deep bg-cream-warm p-3 text-sm outline-none focus:border-gold" />
            <div className="mt-4 flex flex-wrap gap-2">
              {review.status === "pending" && <button onClick={() => approve(review)} className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-bold text-white"><FiCheck /> Approve</button>}
              <button onClick={() => setReview(review._id, { status: "rejected" })} className="inline-flex items-center gap-2 rounded-2xl border border-blush px-4 py-2 text-sm font-bold text-blush-rose"><FiX /> Reject</button>
              <button onClick={() => setReview(review._id, { is_featured: !review.is_featured })} className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-4 py-2 text-sm font-bold text-espresso-900"><FiStar /> {review.is_featured ? "Unfeature" : "Feature"}</button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-4 py-2 text-sm font-bold text-espresso-900"><FiMessageCircle /> Reply</button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-4 py-2 text-sm font-bold text-blush-rose"><FiTrash2 /> Delete</button>
            </div>
          </Panel>
        ))}
      </div>
    </AdminShell>
  );
}
