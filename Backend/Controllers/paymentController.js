import { Payment, ORDER_STATUSES } from "../Models/paymentModel.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Real-time infrastructure ───────────────────────────────────────────────
const orderEventClients = new Map(); // SSE clients: userId → res[]
let socketServer = null;

export const setSocketServer = (io) => {
  socketServer = io;
};

// ── Status → stage descriptions (user-facing copy) ────────────────────────
const STATUS_MESSAGES = {
  "Pending Approval": "Your order has been placed and is awaiting approval. 🎂",
  Approved: "Great news! Your order has been approved by our team. ✅",
  Preparing: "Our bakers have started preparing your order. 👩‍🍳",
  Baking: "Your delicious treats are in the oven! 🍰",
  Packed: "Your order has been beautifully packed and is ready for pickup. 📦",
  "Out for Delivery": "Your order is on its way! Our delivery partner has picked it up. 🛵",
  Delivered: "Your order has been delivered. Enjoy your treats! 🎉",
  Cancelled: "Your order has been cancelled.",
  Rejected: "Unfortunately, your order could not be accepted at this time.",
  Refunded: "Your refund has been processed successfully.",
};

// ── ETA calculation by order type ─────────────────────────────────────────
const calculateETA = (orderItems = [], preparationType = "standard") => {
  // Detect order complexity from items
  const itemCount = orderItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const hasCustomCake = orderItems.some(
    (i) =>
      String(i.name || "")
        .toLowerCase()
        .includes("custom") ||
      String(i.category || "")
        .toLowerCase()
        .includes("custom")
  );
  const hasBirthdayCake = orderItems.some(
    (i) =>
      String(i.name || "")
        .toLowerCase()
        .includes("birthday") ||
      String(i.name || "")
        .toLowerCase()
        .includes("cake")
  );

  let etaMinutes;
  if (preparationType === "custom" || hasCustomCake) {
    etaMinutes = 24 * 60; // 24 hours for custom cakes
  } else if (hasBirthdayCake) {
    etaMinutes = itemCount > 2 ? 240 : 120; // 2-4 hours for cakes
  } else if (itemCount > 10) {
    etaMinutes = 90; // bulk standard items
  } else {
    etaMinutes = 45; // standard cupcakes, brownies, cookies
  }

  const estimatedDelivery = new Date(Date.now() + etaMinutes * 60 * 1000);
  return { etaMinutes, estimatedDelivery };
};

// ── Socket + SSE broadcast ─────────────────────────────────────────────────
const emitOrderEvent = (event, payload, { userId, admin = false, orderId } = {}) => {
  // Socket.IO
  if (socketServer) {
    if (userId) socketServer.to(`user_${userId}`).emit(event, payload);
    if (admin) socketServer.to("admins").emit(event, payload);
    if (orderId) socketServer.to(`order_${orderId}`).emit(event, payload);
  }

  // SSE fallback
  if (userId) {
    const clients = orderEventClients.get(String(userId));
    if (clients?.length) {
      const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
      clients.forEach((res) => {
        try {
          res.write(`event: ${event}\n`);
          res.write(`data: ${data}\n\n`);
        } catch {}
      });
    }
  }
};

// ── Shape normalizer — what we send to frontend ────────────────────────────
const buildOrderShape = (o) => ({
  _id: o._id,
  order_id: o.order_id || "",
  status: o.order_status || o.status || "Pending Approval",
  order_status: o.order_status || o.status || "Pending Approval",
  payment: {
    success: (o.payment_status || o.payStatus) === "paid",
    method: o.payment_method || "Razorpay",
    status: o.payment_status || o.payStatus || "pending",
  },
  buyer: {
    name: o.userShipping?.name || "",
    email: o.userShipping?.email || "",
    phone: o.userShipping?.phone || o.phone_number || "",
    address: o.address?.full || o.userShipping?.address || "",
  },
  products: o.orderItems || [],
  orderItems: o.orderItems || [],
  createdAt: o.createdAt,
  subtotal: o.subtotal || 0,
  delivery_fee: o.delivery_fee || 0,
  final_amount: o.final_amount || o.amount || o.subtotal || 0,
  delivery_slot: o.delivery_slot || "",
  notes: o.notes || "",
  timeline: (o.timeline || []).map((entry) =>
    typeof entry === "string"
      ? { label: entry, note: "", createdAt: new Date() }
      : entry
  ),
  cancellationReason: o.cancellationReason || "",
  estimated_delivery: o.estimated_delivery || null,
  eta_minutes: o.eta_minutes || 60,
  preparation_type: o.preparation_type || "standard",
  status_message: STATUS_MESSAGES[o.order_status || o.status] || "",
  // timestamps
  approved_at: o.approved_at || null,
  prepared_at: o.prepared_at || null,
  baking_at: o.baking_at || null,
  packed_at: o.packed_at || null,
  dispatched_at: o.dispatched_at || null,
  delivered_at: o.delivered_at || null,
  cancelled_at: o.cancelled_at || null,
  rejected_at: o.rejected_at || null,
  userId: o.userId,
});

// ── Timeline entry builder ─────────────────────────────────────────────────
const buildTimelineEntry = (label, note, actor = "system", status = null) => ({
  label,
  note,
  status: status || label,
  actor,
  createdAt: new Date(),
});

// ── Apply per-status timestamps ────────────────────────────────────────────
const applyStatusTimestamps = (order, status) => {
  const ts = new Date();
  const map = {
    Approved: "approved_at",
    Preparing: "prepared_at",
    Baking: "baking_at",
    Packed: "packed_at",
    "Out for Delivery": "dispatched_at",
    Delivered: "delivered_at",
    Cancelled: "cancelled_at",
    Rejected: "rejected_at",
  };
  if (map[status]) order[map[status]] = ts;
};

// ── Optional email notification ────────────────────────────────────────────
const sendEmailNotification = async (toEmail, toName, status, orderId) => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_EMAIL_PASS },
    });
    const message = STATUS_MESSAGES[status] || `Your order status is now: ${status}`;
    await transporter.sendMail({
      from: `"Bindi's Cupcakery" <${process.env.ADMIN_EMAIL}>`,
      to: toEmail,
      subject: `Order Update: ${status} — Bindi's Cupcakery`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px;">
          <h2 style="color: #1a0a00;">Order Update 🎂</h2>
          <p>Hi ${toName || "there"},</p>
          <p>${message}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin-top: 24px; color: #888; font-size: 12px;">
            Bindi's Cupcakery — Handcrafted with love in Surat 🧁
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.warn("Email notification failed (non-blocking):", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ✅ Create Razorpay order
export const checkout = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.json({ success: true, orderId: order.id, amount, currency: order.currency, receipt: order.receipt, payStatus: "created" });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ✅ Verify payment & save order to DB
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId, paymentId, signature, amount, orderItems,
      userId, userShipping, address, phone_number, notes,
      delivery_slot, payment_method, delivery_fee, subtotal, preparation_type,
    } = req.body;

    const saveUserId = userId || req.user?._id;
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const normalizedItems = Array.isArray(orderItems)
      ? orderItems.map((item) => ({
          productId: item._id || item.productId || null,
          name: item.name || item.title || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          subtotal: item.subtotal ?? (item.price || 0) * (item.quantity || 1),
          image: item.image || "",
          category: item.category?.name || item.category || "",
          description: item.description || "",
        }))
      : [];

    const { etaMinutes, estimatedDelivery } = calculateETA(normalizedItems, preparation_type);
    const finalAmount = Number(subtotal ?? amount) + Number(delivery_fee ?? 0);

    const orderRecord = await Payment.create({
      order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      userId: saveUserId,
      orderItems: normalizedItems,
      subtotal: Number(subtotal ?? amount) || 0,
      delivery_fee: Number(delivery_fee ?? 0) || 0,
      final_amount: finalAmount,
      payment_method: payment_method || "Razorpay",
      payment_status: "paid",
      payStatus: "paid",
      order_status: "Pending Approval",
      status: "Pending Approval",
      preparation_type: preparation_type || "standard",
      estimated_delivery: estimatedDelivery,
      eta_minutes: etaMinutes,
      address: { full: address || userShipping?.address || "" },
      phone_number: phone_number || userShipping?.phone || "",
      notes: notes || "",
      delivery_slot: delivery_slot || "",
      userShipping: {
        name: userShipping?.name || "",
        email: userShipping?.email || "",
        phone: phone_number || userShipping?.phone || "",
        address: address || userShipping?.address || "",
      },
      timeline: [buildTimelineEntry("Order Placed", "Payment verified and order saved.", "system", "Pending Approval")],
      razorpay_order_id: orderId,
      paymentId,
      signature,
    });

    const shaped = buildOrderShape(orderRecord);
    emitOrderEvent("orderCreated", shaped, {
      userId: String(saveUserId),
      admin: true,
      orderId: String(orderRecord._id),
    });

    res.json({ success: true, message: "Payment successful", order: shaped });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// ✅ Get orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map(buildOrderShape));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// ✅ Get single order for logged-in user
export const getOrderById = async (req, res) => {
  try {
    const order = await Payment.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    res.json(buildOrderShape(order));
  } catch (error) {
    console.error("Error fetching order detail:", error);
    res.status(500).json({ success: false, message: "Error fetching order detail" });
  }
};

// ✅ Get ALL orders — admin only
export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== "All") filter.order_status = status;
    if (search) {
      filter.$or = [
        { order_id: { $regex: search, $options: "i" } },
        { "userShipping.name": { $regex: search, $options: "i" } },
        { "userShipping.email": { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);
    res.json({ orders: orders.map(buildOrderShape), total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};

// ✅ Update order status — admin only (THE MAIN FIX)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    // Validate against canonical enum
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Payment.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const adminName = req.user?.name || "Admin";
    const previousStatus = order.order_status || order.status;

    // Update status fields
    order.order_status = status;
    order.status = status;
    applyStatusTimestamps(order, status);

    // Add timeline entry
    order.timeline = order.timeline || [];
    order.timeline.push(
      buildTimelineEntry(
        status,
        note || STATUS_MESSAGES[status] || `Order status updated to ${status}.`,
        "admin",
        status
      )
    );

    // Log notification
    order.notification_history = order.notification_history || [];
    order.notification_history.push({
      kind: "status_change",
      message: STATUS_MESSAGES[status] || `Status changed to ${status}`,
      sentAt: new Date(),
      channel: "in-app",
    });

    await order.save();

    const shaped = buildOrderShape(order);

    // Real-time broadcast to user + admin dashboard
    emitOrderEvent("orderUpdated", shaped, {
      userId: String(order.userId),
      admin: true,
      orderId: String(order._id),
    });

    // Optional email notification
    if (order.userShipping?.email) {
      sendEmailNotification(
        order.userShipping.email,
        order.userShipping.name,
        status,
        order.order_id || String(order._id)
      );
    }

    res.json({ success: true, message: `Order status updated to ${status}`, order: shaped });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
  }
};

// ✅ Admin: override ETA
export const updateOrderETA = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { eta_minutes, estimated_delivery } = req.body;

    const order = await Payment.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (eta_minutes) {
      order.eta_minutes = Number(eta_minutes);
      order.estimated_delivery = new Date(Date.now() + Number(eta_minutes) * 60 * 1000);
    }
    if (estimated_delivery) {
      order.estimated_delivery = new Date(estimated_delivery);
    }

    order.timeline = order.timeline || [];
    order.timeline.push(
      buildTimelineEntry("ETA Updated", `Admin updated estimated delivery time.`, "admin")
    );

    await order.save();
    const shaped = buildOrderShape(order);

    emitOrderEvent("orderUpdated", shaped, {
      userId: String(order.userId),
      admin: true,
      orderId: String(order._id),
    });

    res.json({ success: true, order: shaped });
  } catch (error) {
    console.error("Error updating ETA:", error);
    res.status(500).json({ success: false, message: "Error updating ETA" });
  }
};

// ✅ Admin: add note to order
export const addAdminNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;

    const order = await Payment.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.adminNotes = order.adminNotes || [];
    order.adminNotes.push({ note, actor: req.user?.name || "Admin", createdAt: new Date() });
    order.timeline = order.timeline || [];
    order.timeline.push(buildTimelineEntry("Admin Note", note, "admin"));

    await order.save();
    res.json({ success: true, order: buildOrderShape(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding admin note" });
  }
};

// ✅ User: cancel order (only before approval)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Payment.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const currentStatus = order.order_status || order.status;
    if (!["Pending Approval"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order can only be cancelled while in Pending Approval status",
      });
    }

    order.order_status = "Cancelled";
    order.status = "Cancelled";
    order.cancellationReason = reason || "Cancelled by customer";
    order.cancelled_at = new Date();
    order.timeline = order.timeline || [];
    order.timeline.push(buildTimelineEntry("Cancelled", order.cancellationReason, "user", "Cancelled"));

    await order.save();
    const shaped = buildOrderShape(order);

    emitOrderEvent("orderUpdated", shaped, {
      userId: String(order.userId),
      admin: true,
      orderId: String(order._id),
    });

    res.json({ success: true, message: "Order cancelled", order: shaped });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

// ✅ Admin: real-time order stats
export const getOrderStats = async (req, res) => {
  try {
    const [total, pending, approved, preparing, packed, outForDelivery, delivered, cancelled] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ order_status: "Pending Approval" }),
      Payment.countDocuments({ order_status: "Approved" }),
      Payment.countDocuments({ order_status: { $in: ["Preparing", "Baking"] } }),
      Payment.countDocuments({ order_status: "Packed" }),
      Payment.countDocuments({ order_status: "Out for Delivery" }),
      Payment.countDocuments({ order_status: "Delivered" }),
      Payment.countDocuments({ order_status: { $in: ["Cancelled", "Rejected", "Refunded"] } }),
    ]);

    const revenueData = await Payment.aggregate([
      { $match: { payment_status: "paid" } },
      { $group: { _id: null, total: { $sum: "$final_amount" } } },
    ]);

    res.json({
      success: true,
      stats: {
        total, pending, approved, preparing, packed, outForDelivery, delivered, cancelled,
        revenue: revenueData[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

// ✅ SSE stream for live order updates
export const orderEventStream = async (req, res) => {
  try {
    const token = req.query.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded._id);

    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();
    res.write(`retry: 10000\n\n`);

    const clients = orderEventClients.get(userId) || [];
    clients.push(res);
    orderEventClients.set(userId, clients);

    res.write(`event: connected\ndata: ${JSON.stringify({ message: "connected", userId })}\n\n`);

    const keepAlive = setInterval(() => {
      try { res.write(`: keep-alive\n\n`); } catch {}
    }, 20000);

    req.on("close", () => {
      clearInterval(keepAlive);
      const remaining = (orderEventClients.get(userId) || []).filter((c) => c !== res);
      remaining.length ? orderEventClients.set(userId, remaining) : orderEventClients.delete(userId);
    });
  } catch (error) {
    console.error("Error opening SSE stream:", error);
    if (!res.headersSent) res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Debug endpoints (only in non-production)
// ─────────────────────────────────────────────────────────────────────────────
export const debugCreateTestOrder = async (req, res) => {
  try {
    const payload = req.body || {};
    const orderRecord = await Payment.create({
      order_id: `TEST-ORD-${Date.now()}`,
      userId: payload.userId || new mongoose.Types.ObjectId(),
      orderItems: payload.orderItems || [{ name: "Test Cupcake", price: 100, quantity: 1, subtotal: 100 }],
      subtotal: payload.subtotal || 100,
      delivery_fee: payload.delivery_fee || 0,
      final_amount: payload.final_amount || 100,
      payment_method: "Test",
      payment_status: "paid",
      payStatus: "paid",
      order_status: payload.order_status || "Pending Approval",
      status: payload.order_status || "Pending Approval",
      address: { full: "Test address, Surat" },
      phone_number: "0000000000",
      notes: "Test order",
      estimated_delivery: new Date(Date.now() + 45 * 60 * 1000),
      eta_minutes: 45,
      userShipping: { name: "Test User", email: "test@test.com", phone: "0000000000", address: "Test address" },
      timeline: [buildTimelineEntry("Order Placed", "Debug test order", "system", "Pending Approval")],
    });
    emitOrderEvent("orderCreated", buildOrderShape(orderRecord), { admin: true, orderId: String(orderRecord._id) });
    res.json({ success: true, order: buildOrderShape(orderRecord) });
  } catch (err) {
    console.error("Debug create failed", err);
    res.status(500).json({ success: false, message: "Debug create failed", error: err.message });
  }
};

export const debugUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid: ${ORDER_STATUSES.join(", ")}` });
    }

    const order = await Payment.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.order_status = status;
    order.status = status;
    applyStatusTimestamps(order, status);
    order.timeline = order.timeline || [];
    order.timeline.push(buildTimelineEntry(status, `Debug updated to ${status}`, "system", status));
    await order.save();

    const shaped = buildOrderShape(order);
    emitOrderEvent("orderUpdated", shaped, { admin: true, orderId: String(order._id) });

    res.json({ success: true, order: shaped });
  } catch (err) {
    console.error("Debug update failed", err);
    res.status(500).json({ success: false, message: "Debug update failed", error: err.message });
  }
};