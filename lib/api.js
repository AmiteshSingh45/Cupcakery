/**
 * lib/api.js — Centralized Axios instance for Bindi's Cupcakery
 *
 * Solves AxiosError: Network Error caused by:
 *  1. Render free-tier cold start (30-60s wake-up delay → connection timeout)
 *  2. No retry logic — first failed request killed the whole page
 *  3. Hardcoded URLs spread across every component
 *
 * Fix:
 *  - Single base URL from NEXT_PUBLIC_API_URL env var
 *  - Automatic retry with exponential backoff (up to 3 retries)
 *  - 20-second timeout so Render has time to wake up
 *  - Auth header injected automatically if token in localStorage
 */

import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://cupcakery-backend.onrender.com";

// ── Core axios instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BACKEND,
  timeout: 20000, // 20s — gives Render cold-start enough time
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT token if present ────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed?.token) {
            // Set both: standard Bearer (for requireSignIn) + legacy Auth (backward compat)
            config.headers["Authorization"] = `Bearer ${parsed.token}`;
            config.headers["Auth"] = parsed.token;
          }
        }
      } catch {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: retry on network error / 5xx ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (config?.noRetry) {
      return Promise.reject(error);
    }

    // Don't retry on 4xx client errors (auth, validation, etc.)
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) {
      return Promise.reject(error);
    }

    // Max 3 retries with exponential backoff
    config._retryCount = config._retryCount || 0;
    if (config._retryCount >= 3) {
      return Promise.reject(error);
    }

    config._retryCount += 1;
    const delay = config._retryCount * 2000; // 2s, 4s, 6s

    await new Promise((resolve) => setTimeout(resolve, delay));
    return api(config);
  }
);

export default api;
export { BACKEND };
