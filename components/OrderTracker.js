"use client";

import { motion } from "framer-motion";
import moment from "moment";
import { ORDER_STAGES, TERMINAL_STATUSES } from "@/lib/adminData";

/**
 * OrderTracker — premium visual order tracking component
 * Shows an 8-stage pipeline with completed/active/upcoming states and timestamps.
 */
export default function OrderTracker({ order }) {
  const currentStatus = order?.status || order?.order_status || "Pending Approval";

  // Handle terminal states (Cancelled, Rejected, Refunded)
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    const isRefunded = currentStatus === "Refunded";
    return (
      <div className={`rounded-2xl border p-5 ${
        isRefunded
          ? "border-blue-100 bg-blue-50"
          : "border-rose-100 bg-rose-50"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isRefunded ? "💸" : "❌"}</span>
          <div>
            <p className={`font-bold text-lg ${isRefunded ? "text-blue-800" : "text-rose-800"}`}>
              Order {currentStatus}
            </p>
            <p className={`text-sm ${isRefunded ? "text-blue-600" : "text-rose-600"}`}>
              {order?.cancellationReason || order?.status_message || `This order has been ${currentStatus.toLowerCase()}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get current stage index
  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.key === currentStatus);
  const progressPercent = currentStageIndex >= 0
    ? Math.round(((currentStageIndex) / (ORDER_STAGES.length - 1)) * 100)
    : 0;

  // Map timeline entries by status for timestamps
  const timelineMap = {};
  (order?.timeline || []).forEach((entry) => {
    if (entry.status && !timelineMap[entry.status]) {
      timelineMap[entry.status] = entry.createdAt;
    }
    // Also map by label
    if (entry.label && !timelineMap[entry.label]) {
      timelineMap[entry.label] = entry.createdAt;
    }
  });

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-ink-muted mb-2">
          <span>Order Placed</span>
          <span className="font-semibold text-gold-dark">{progressPercent}% complete</span>
          <span>Delivered</span>
        </div>
        <div className="h-2.5 rounded-full bg-cream-warm overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stage steps — vertical timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-cream-deep" />

        <div className="space-y-0">
          {ORDER_STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isActive = index === currentStageIndex;
            const isPending = index > currentStageIndex;
            const timestamp = timelineMap[stage.key] || timelineMap[stage.label];

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {/* Step indicator */}
                <div
                  className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-base transition-all ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                      : isActive
                      ? "border-gold bg-gold shadow-[0_0_16px_rgba(212,168,83,0.5)]"
                      : "border-cream-deep bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={isPending ? "opacity-30 text-sm" : "text-sm"}>
                      {stage.icon}
                    </span>
                  )}

                  {/* Pulse for active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`font-semibold text-sm ${
                        isCompleted
                          ? "text-emerald-700"
                          : isActive
                          ? "text-gold-dark"
                          : "text-ink-muted"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {timestamp && (
                      <span className="text-[10px] font-semibold text-ink-muted bg-cream-warm px-2 py-0.5 rounded-full">
                        {moment(timestamp).format("h:mm A, MMM D")}
                      </span>
                    )}
                    {isActive && !timestamp && (
                      <span className="text-[10px] font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-0.5 text-xs leading-relaxed ${
                      isActive ? "text-espresso-900" : "text-ink-muted"
                    } ${isPending ? "opacity-50" : ""}`}
                  >
                    {isActive
                      ? order?.status_message || stage.description
                      : isCompleted
                      ? stage.description
                      : stage.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
