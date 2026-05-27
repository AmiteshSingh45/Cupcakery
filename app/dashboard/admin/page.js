"use client";

import { FiBox, FiCreditCard, FiShoppingBag, FiStar, FiTag, FiTrendingUp, FiUsers } from "react-icons/fi";
import { AdminShell } from "@/components/admin/AdminShell";
import { BarChart, LineChart, Panel, StatCard, StatusPill } from "@/components/admin/AdminWidgets";
import {
  adminOrders,
  adminReviews,
  buildAdminMetrics,
  formatCurrency,
  orderSeries,
  revenueSeries,
} from "@/lib/adminData";
import { catalogCategories, catalogProducts } from "@/lib/catalog";

export default function AdminDashboard() {
  const metrics = buildAdminMetrics();
  const bestSellers = catalogProducts.filter((product) => product.featured).slice(0, 5);
  const lowStock = catalogProducts.filter((product) => (product.stock || product.quantity || 0) < 18).slice(0, 5);

  return (
    <AdminShell
      title="Dashboard Overview"
      subtitle="Revenue, operations, customers, inventory, and quality signals for Bindi's Cupcakery."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Revenue", value: formatCurrency(metrics.revenue), delta: "+18%", icon: <FiCreditCard />, tone: "gold" },
          { label: "Orders", value: metrics.orders, delta: "+12%", icon: <FiShoppingBag />, tone: "green" },
          { label: "Users", value: metrics.users, delta: "+9%", icon: <FiUsers />, tone: "rose" },
          { label: "Products", value: metrics.products, delta: "+72", icon: <FiBox />, tone: "dark" },
          { label: "Categories", value: metrics.categories, delta: "+8", icon: <FiTag />, tone: "gold" },
          { label: "Pending Orders", value: metrics.pending, delta: "+4", icon: <FiTrendingUp />, tone: "gold" },
          { label: "Completed", value: metrics.completed, delta: "+21%", icon: <FiShoppingBag />, tone: "green" },
          { label: "Cancelled", value: metrics.cancelled, delta: "-3%", icon: <FiCreditCard />, tone: "rose" },
          { label: "Low Stock", value: metrics.lowStock, delta: "Watch", icon: <FiBox />, tone: "rose" },
          { label: "Wishlist", value: metrics.wishlist, delta: "+31", icon: <FiStar />, tone: "gold" },
        ].map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="Revenue Analytics" subtitle="Monthly sales and payment performance">
          <LineChart data={revenueSeries} labels={["Jan", "Mar", "May", "Jul", "Sep", "Nov"]} />
        </Panel>
        <Panel title="Orders Over Time" subtitle="Weekly order trend">
          <BarChart data={orderSeries.slice(-8)} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent Orders" subtitle="Latest customer checkout activity" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="text-xs uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {adminOrders.slice(0, 7).map((order) => (
                  <tr key={order._id}>
                    <td className="py-4 font-semibold text-espresso-900">{order._id}</td>
                    <td className="py-4 text-sm text-ink-muted">{order.buyer.name}</td>
                    <td className="py-4 text-sm font-bold text-espresso-900">{formatCurrency(order.amount)}</td>
                    <td className="py-4"><StatusPill status={order.status} /></td>
                    <td className="py-4"><StatusPill status={order.payment.success ? "Paid" : "Failed"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Low Stock Alerts" subtitle="Products needing replenishment">
          <div className="space-y-3">
            {lowStock.map((product) => (
              <div key={product._id} className="flex items-center justify-between rounded-2xl bg-cream-warm p-4">
                <div>
                  <p className="text-sm font-semibold text-espresso-900">{product.name}</p>
                  <p className="text-xs text-ink-muted">{product.category.name}</p>
                </div>
                <span className="rounded-full bg-blush-light px-3 py-1 text-xs font-bold text-blush-rose">
                  {product.stock || product.quantity} left
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Best Selling Products" subtitle="Top merchandising opportunities">
          <div className="space-y-4">
            {bestSellers.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-espresso-900">{index + 1}. {product.name}</p>
                  <p className="text-xs text-ink-muted">{product.reviewCount} reviews · {product.rating} rating</p>
                </div>
                <p className="font-bold text-gold-dark">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Category-wise Sales" subtitle="Collection contribution">
          <div className="space-y-3">
            {catalogCategories.slice(0, 6).map((category, index) => (
              <div key={category.slug}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-muted">
                  <span>{category.name}</span>
                  <span>{12 + index * 9}%</span>
                </div>
                <div className="h-2 rounded-full bg-cream-warm">
                  <div className="h-2 rounded-full bg-gold" style={{ width: `${32 + index * 9}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Latest Reviews" subtitle="Quality and trust signals">
          <div className="space-y-3">
            {adminReviews.slice(0, 4).map((review) => (
              <div key={review._id} className="rounded-2xl bg-cream-warm p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-espresso-900">{review.user_name}</p>
                  <span className="text-xs font-bold text-gold-dark">{review.rating}/5</span>
                </div>
                <p className="line-clamp-2 text-xs text-ink-muted">{review.review_text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
