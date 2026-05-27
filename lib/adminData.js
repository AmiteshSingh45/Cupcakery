import { catalogCategories, catalogProducts } from "./catalog";

const customers = [
  "Priya Sharma",
  "Aarav Mehta",
  "Riya Patel",
  "Kabir Shah",
  "Aanya Desai",
  "Vihaan Kapoor",
  "Meera Iyer",
  "Neel Malhotra",
  "Ishita Rao",
  "Dev Nair",
  "Sara Khan",
  "Arjun Verma",
];

export const adminStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

export const adminOrders = Array.from({ length: 36 }).map((_, index) => {
  const first = catalogProducts[(index * 3) % catalogProducts.length];
  const second = catalogProducts[(index * 3 + 7) % catalogProducts.length];
  const products = index % 3 === 0 ? [first, second] : [first];
  const amount = products.reduce((sum, product) => sum + product.price, 0);
  const status = adminStatuses[[0, 1, 2, 3, 4, 6, 7][index % 7]];
  const createdAt = new Date(Date.now() - index * 86400000 * 0.8).toISOString();

  return {
    _id: `ORD-${String(10240 + index).padStart(5, "0")}`,
    buyer: {
      name: customers[index % customers.length],
      email: `${customers[index % customers.length].toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `+91 98${String(76000000 + index * 13719).slice(0, 8)}`,
      address: "Parle Point, Surat, Gujarat",
    },
    products,
    amount,
    status,
    payment: { success: index % 9 !== 0, method: index % 2 ? "Razorpay" : "UPI" },
    coupon: index % 5 === 0 ? "SWEET10" : "",
    createdAt,
    timeline: ["Order placed", "Payment verified", status].filter(Boolean),
  };
});

export const adminUsers = customers.map((name, index) => ({
  _id: `USR-${1000 + index}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  phone: `+91 97${String(65000000 + index * 8321).slice(0, 8)}`,
  role: index === 0 ? "Super Admin" : index < 3 ? "Admin" : index < 5 ? "Staff" : "Customer",
  status: index % 8 === 0 ? "Banned" : "Active",
  orders: 2 + ((index * 5) % 18),
  spend: 1200 + index * 740,
  lastLogin: new Date(Date.now() - index * 3600000 * 9).toISOString(),
}));

export const adminReviews = catalogProducts.slice(0, 18).map((product, index) => ({
  _id: `REV-${3000 + index}`,
  product,
  user_name: customers[(index + 2) % customers.length],
  rating: 4 + (index % 2),
  review_text: `${product.name} was fresh, beautifully packed, and tasted premium. Perfect for celebrations.`,
  status: index % 4 === 0 ? "pending" : "approved",
  is_featured: index % 5 === 0,
  createdAt: new Date(Date.now() - index * 6400000).toISOString(),
}));

export const adminCoupons = [
  { code: "SWEET10", type: "Percentage", value: "10%", usage: 142, revenue: 84200, status: "Active", expires: "2026-06-30" },
  { code: "BIRTHDAY150", type: "Fixed", value: "₹150", usage: 58, revenue: 42100, status: "Active", expires: "2026-08-15" },
  { code: "FREESHIP", type: "Free shipping", value: "Delivery", usage: 89, revenue: 37600, status: "Scheduled", expires: "2026-07-10" },
  { code: "FESTIVE20", type: "Percentage", value: "20%", usage: 210, revenue: 129400, status: "Paused", expires: "2026-12-31" },
];

export const adminTickets = [
  { id: "TCK-1008", customer: "Priya Sharma", subject: "Need invoice copy", priority: "Low", status: "Open", channel: "Email" },
  { id: "TCK-1009", customer: "Aarav Mehta", subject: "Delivery slot change", priority: "Medium", status: "Pending", channel: "WhatsApp" },
  { id: "TCK-1010", customer: "Riya Patel", subject: "Refund request", priority: "High", status: "Escalated", channel: "Chat" },
];

export const adminBanners = [
  { title: "Mother's Day Dessert Edit", placement: "Homepage hero", status: "Live", clicks: 2840 },
  { title: "Brownie Weekend", placement: "Promo strip", status: "Scheduled", clicks: 1120 },
  { title: "Corporate Hampers", placement: "Collection banner", status: "Draft", clicks: 620 },
];

export const revenueSeries = [
  42000, 56000, 61000, 72000, 68000, 84000, 97000, 112000, 108000, 126000, 141000, 158000,
];

export const orderSeries = [18, 24, 26, 31, 29, 35, 42, 48, 45, 52, 57, 64];

export function buildAdminMetrics(products = catalogProducts, orders = adminOrders, users = adminUsers) {
  const delivered = orders.filter((order) => order.status === "Delivered");
  const cancelled = orders.filter((order) => ["Cancelled", "Returned", "Refunded"].includes(order.status));
  const pending = orders.filter((order) => ["Pending", "Confirmed", "Processing", "Packed"].includes(order.status));
  const revenue = orders.filter((order) => order.payment?.success).reduce((sum, order) => sum + (order.amount || 0), 0);
  const lowStock = products.filter((product) => (product.stock || product.quantity || 0) <= 12);

  return {
    revenue,
    orders: orders.length,
    users: users.length,
    products: products.length,
    categories: catalogCategories.length,
    pending: pending.length,
    completed: delivered.length,
    cancelled: cancelled.length,
    lowStock: lowStock.length,
    wishlist: 348,
    repeatCustomers: 64,
    refunds: orders.filter((order) => order.status === "Refunded").length,
  };
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}
