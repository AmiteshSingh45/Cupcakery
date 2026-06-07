import express from "express";
import {
  checkout,
  verifyPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderETA,
  addAdminNote,
  getOrderStats,
  orderEventStream,
  debugCreateTestOrder,
  debugUpdateOrderStatus,
} from "../Controllers/paymentController.js";
import { requireSignIn, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/create-order", checkout);

// ── Auth required (user) ──────────────────────────────────────────────────────
router.post("/verify-payment", requireSignIn, verifyPayment);
router.get("/orders", requireSignIn, getUserOrders);
router.get("/orders/:orderId", requireSignIn, getOrderById);
router.post("/orders/:orderId/cancel", requireSignIn, cancelOrder);

// ── SSE real-time stream ──────────────────────────────────────────────────────
router.get("/events", orderEventStream);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.get("/admin/orders", requireSignIn, isAdmin, getAllOrders);
router.get("/admin/orders/stats", requireSignIn, isAdmin, getOrderStats);
router.patch("/admin/orders/:orderId/status", requireSignIn, isAdmin, updateOrderStatus);
router.patch("/admin/orders/:orderId/eta", requireSignIn, isAdmin, updateOrderETA);
router.post("/admin/orders/:orderId/note", requireSignIn, isAdmin, addAdminNote);

// ── Debug (non-production only) ───────────────────────────────────────────────
if (process.env.ALLOW_DEBUG_ADMIN_API === "true" || process.env.NODE_ENV !== "production") {
  router.post("/debug/orders", debugCreateTestOrder);
  router.patch("/debug/orders/:orderId/status", debugUpdateOrderStatus);
}

// ── Legacy ────────────────────────────────────────────────────────────────────
router.get("/payment-success", (req, res) => {
  res.json({ success: true, message: "Payment successful" });
});

export default router;