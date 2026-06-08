"use client";

/**
 * RenderKeepAlive — Prevent Render free-tier cold starts
 *
 * Render's free tier spins the backend DOWN after 15 min of inactivity.
 * The first request after spin-down takes 30-60s, causing a "Network Error"
 * for the user who happens to visit first.
 *
 * This component pings /health every 14 minutes from the browser so the
 * backend stays warm. It runs silently in the background — no UI, no state.
 *
 * Mount it ONCE inside the root layout (already done in layout.js).
 */

import { useEffect } from "react";
import { BACKEND } from "@/lib/api";

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

export default function RenderKeepAlive() {
  useEffect(() => {
    // Ping immediately on mount so first visitor doesn't get a cold-start
    const ping = () => {
      fetch(`${BACKEND}/health`, { method: "GET", mode: "cors" }).catch(
        () => {} // Silently ignore — this is best-effort only
      );
    };

    ping(); // First ping on mount
    const interval = setInterval(ping, PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return null; // No UI
}
