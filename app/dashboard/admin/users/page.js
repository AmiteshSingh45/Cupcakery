"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataToolbar, Panel, StatusPill } from "@/components/admin/AdminWidgets";
import api from "@/lib/api";
import { useAuth } from "@/Context/auth";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [query, setQuery] = useState("");
  const [auth] = useAuth();

  // ── Fetch real users from backend ────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/api/v1/admin/users");
      const list = Array.isArray(data?.users) ? data.users : [];
      setUsers(list);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to load users";
      setFetchError(msg);
      toast.error(`Failed to load users: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Filter ──────────────────────────────────────────────────────────────
  const visibleUsers = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.role, u.adminRole, u.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => [
      ["Total Users", users.length],
      [
        "Admins",
        users.filter(
          (u) =>
            u.role === 1 || ["Super Admin", "Admin"].includes(u.adminRole)
        ).length,
      ],
      ["Banned", users.filter((u) => u.status === "Banned").length],
      ["Active", users.filter((u) => u.status !== "Banned" && u.status !== "Suspended").length],
    ],
    [users]
  );

  return (
    <AdminShell
      title="User Management"
      subtitle="Manage customers, admins, staff, roles, permissions, and login activity."
      actions={
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex h-11 items-center gap-2 rounded-2xl border border-cream-deep bg-white px-4 text-sm font-semibold text-ink-muted shadow-card transition hover:border-gold"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      }
    >
      {/* ── Stats cards ──────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.5rem] border border-cream-deep bg-white p-5 shadow-card"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-espresso-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <DataToolbar search={query} setSearch={setQuery} actionLabel="Export" />

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Panel
        title="Users Table"
        subtitle={
          loading
            ? "Loading users…"
            : fetchError
            ? `Error: ${fetchError}`
            : `${visibleUsers.length} of ${users.length} users`
        }
        className="mt-6"
      >
        {/* Error state */}
        {fetchError && !loading && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
            <FiAlertCircle size={18} />
            <div>
              <p className="text-sm font-semibold">Failed to load users from backend</p>
              <p className="text-xs">{fetchError}</p>
            </div>
            <button
              onClick={fetchUsers}
              className="ml-auto rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-cream-warm" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && users.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <FiUser size={40} className="mb-3 text-ink-muted opacity-40" />
            <p className="font-semibold text-espresso-900">No users found</p>
            <p className="mt-1 text-sm text-ink-muted">
              Users will appear here once people register.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && visibleUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="text-xs uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {visibleUsers.map((user) => {
                  const roleLabel =
                    user.role === 1
                      ? "Super Admin"
                      : user.adminRole || "Customer";
                  return (
                    <tr key={user._id} className="hover:bg-cream/70 transition-colors">
                      <td className="py-4">
                        <span className="font-bold text-espresso-900 text-sm">
                          {user.name || "—"}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-ink-muted">
                        {user.email}
                      </td>
                      <td className="py-4 text-sm text-ink-muted">
                        {user.phone || "—"}
                      </td>
                      <td className="py-4">
                        <StatusPill status={roleLabel} />
                      </td>
                      <td className="py-4">
                        <StatusPill status={user.status || "Active"} />
                      </td>
                      <td className="py-4 text-sm text-ink-muted">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-4 text-right">
                        <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-deep px-3 py-2 text-xs font-bold text-espresso-900 hover:border-gold transition">
                          <FiSettings size={12} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !fetchError && visibleUsers.length === 0 && users.length > 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center text-ink-muted">
            <FiSearch size={32} className="mb-3" />
            No users match your search.
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}
