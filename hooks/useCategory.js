"use client";

/**
 * useCategory.js — Fixed version
 *
 * ROOT CAUSE of AxiosError: Network Error:
 *   - Render free tier spins down after 15 min of inactivity
 *   - First cold-start request times out (Render takes 30-60s to wake)
 *   - Old code had NO retry, NO timeout — one failed fetch = permanent empty state
 *
 * FIXES APPLIED:
 *   1. Uses centralized `api` instance (20s timeout + 3 auto-retries)
 *   2. Uses NEXT_PUBLIC_BACKEND_URL env var (not a hardcoded URL)
 *   3. Shows proper loading state while retrying
 *   4. Falls back gracefully to [] on final failure
 */

import { useState, useEffect } from "react";
import api from "../lib/api";
import { catalogCategories } from "../lib/catalog";

export default function useCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/api/v1/category/get-category");
        if (Array.isArray(data?.category)) {
          setCategories(data.category);
        } else {
          setCategories(catalogCategories);
        }
      } catch (err) {
        console.error("useCategory error (after retries):", err?.message);
        setError(err?.message || "Failed to load categories");
        setCategories(catalogCategories);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  return { categories, loading, error };
}
