"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminUser } from "@/Context/auth";
import { FiLock, FiAlertTriangle, FiHome } from "react-icons/fi";
import Link from "next/link";

/**
 * AdminGuard — wraps all admin pages to enforce access control.
 *
 * Behaviour:
 *   - Not logged in  → redirect to /Login
 *   - Logged in but not admin → show "Access Denied" page
 *   - Admin → render children normally
 */
export default function AdminGuard({ children }) {
  const [auth] = useAuth();
  const router = useRouter();
  // Wait for auth to hydrate from localStorage before rendering
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Still hydrating — show nothing to prevent flash
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8efe2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-deep border-t-gold" />
          <p className="text-sm font-semibold text-ink-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!auth?.token) {
    if (typeof window !== "undefined") {
      router.replace("/Login");
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8efe2]">
        <div className="flex flex-col items-center gap-3">
          <FiLock size={32} className="text-gold" />
          <p className="font-semibold text-espresso-900">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Authenticated but not admin — access denied
  if (!isAdminUser(auth)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8efe2] px-6">
        <div className="w-full max-w-md rounded-3xl border border-cream-deep bg-white p-10 text-center shadow-card">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blush-light">
            <FiAlertTriangle size={36} className="text-blush-rose" />
          </div>

          {/* Heading */}
          <h1 className="mb-2 font-display text-3xl font-bold text-espresso-900">Access Denied</h1>
          <p className="mb-8 text-sm text-ink-muted leading-relaxed">
            You don&apos;t have permission to view this page.
            <br />
            This area is restricted to administrators only.
          </p>

          {/* Details */}
          <div className="mb-8 rounded-2xl bg-cream-warm p-4 text-left text-sm">
            <p className="font-semibold text-espresso-900 mb-1">Logged in as:</p>
            <p className="text-ink-muted">{auth.user?.name || "Unknown"}</p>
            <p className="text-ink-muted">{auth.user?.email || ""}</p>
            <p className="mt-2 font-semibold text-espresso-900">Role:</p>
            <p className="text-ink-muted capitalize">{auth.user?.adminRole || "Customer"}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/user"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-espresso-900 px-6 py-3 text-sm font-bold text-cream transition hover:bg-espresso-800"
            >
              <FiHome size={16} />
              Go to My Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cream-deep px-6 py-3 text-sm font-semibold text-espresso-900 transition hover:border-gold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin — render normally
  return <>{children}</>;
}
