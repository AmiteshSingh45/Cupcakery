"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { FiClock, FiTruck } from "react-icons/fi";

/**
 * DeliveryETA — real-time countdown to estimated delivery
 * All hooks are called unconditionally before any early returns (Rules of Hooks).
 */
export default function DeliveryETA({ order }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  const estimatedDelivery = order?.estimated_delivery;
  const currentStatus = order?.status || order?.order_status;

  // ── Countdown — runs always (hooks must not be conditional) ──────────────
  useEffect(() => {
    // Clear state when status is terminal
    if (
      !estimatedDelivery ||
      ["Delivered", "Cancelled", "Rejected", "Refunded"].includes(currentStatus)
    ) {
      setTimeLeft(null);
      setIsOverdue(false);
      return;
    }

    const tick = () => {
      const diff = moment(estimatedDelivery).diff(moment(), "seconds");
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft(null);
        return;
      }
      setIsOverdue(false);
      setTimeLeft({
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
        total: diff,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [estimatedDelivery, currentStatus]);

  // ── Early returns AFTER all hooks ─────────────────────────────────────────
  if (currentStatus === "Delivered") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="text-sm font-bold text-emerald-800">Delivered!</p>
          <p className="text-xs text-emerald-600">
            {order?.delivered_at
              ? `Delivered at ${moment(order.delivered_at).format("h:mm A, MMM D")}`
              : "Your order has been delivered."}
          </p>
        </div>
      </div>
    );
  }

  if (["Cancelled", "Rejected", "Refunded"].includes(currentStatus)) {
    return null;
  }

  if (!estimatedDelivery) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-gold/5 border border-gold/20 p-4">
        <FiClock size={20} className="text-gold flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-espresso-900">Estimated Delivery</p>
          <p className="text-xs text-ink-muted">Our team is calculating your delivery time...</p>
        </div>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <FiTruck size={20} className="text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-800">On the way...</p>
          <p className="text-xs text-amber-600">
            Expected by {moment(estimatedDelivery).format("h:mm A")} — should arrive any moment!
          </p>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds } = timeLeft || {};

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-cream-warm p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiTruck size={16} className="text-gold-dark" />
        <p className="text-xs font-bold uppercase tracking-widest text-gold-dark">
          Estimated Delivery
        </p>
      </div>

      <p className="text-sm font-semibold text-espresso-900 mb-3">
        {moment(estimatedDelivery).calendar(null, {
          sameDay: "[Today at] h:mm A",
          nextDay: "[Tomorrow at] h:mm A",
          nextWeek: "dddd [at] h:mm A",
          sameElse: "MMM D [at] h:mm A",
        })}
      </p>

      {timeLeft && (
        <div className="flex gap-2">
          {hours > 0 && (
            <div className="text-center">
              <div className="rounded-xl bg-espresso-900 px-3 py-2 font-display text-2xl font-bold text-gold min-w-[52px]">
                {String(hours).padStart(2, "0")}
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">hrs</p>
            </div>
          )}
          <div className="text-center">
            <div className="rounded-xl bg-espresso-900 px-3 py-2 font-display text-2xl font-bold text-gold min-w-[52px]">
              {String(minutes).padStart(2, "0")}
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">min</p>
          </div>
          <div className="text-center">
            <div className="rounded-xl bg-espresso-900 px-3 py-2 font-display text-2xl font-bold text-gold min-w-[52px]">
              {String(seconds).padStart(2, "0")}
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">sec</p>
          </div>
          {timeLeft.total < 1800 && (
            <div className="flex items-center">
              <span className="rounded-xl bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                Almost here! 🚀
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
