import express from "express";
import {
  adminOverviewController,
  adminUsersController,
  createBanner,
  createCoupon,
  listAuditLogs,
  listBanners,
  listCoupons,
  listSettings,
  updateUserRoleController,
  upsertSetting,
} from "../Controllers/AdminController.js";
import { isAdmin, requirePermission, requireSignIn } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(requireSignIn, isAdmin);

router.get("/overview", adminOverviewController);
router.get("/users", requirePermission("users.read"), adminUsersController);
router.patch("/users/:id", requirePermission("users.write"), updateUserRoleController);
router.get("/coupons", requirePermission("coupons.read"), listCoupons);
router.post("/coupons", requirePermission("coupons.write"), createCoupon);
router.get("/banners", requirePermission("banners.read"), listBanners);
router.post("/banners", requirePermission("banners.write"), createBanner);
router.get("/audit-logs", requirePermission("security.read"), listAuditLogs);
router.get("/settings", requirePermission("settings.read"), listSettings);
router.put("/settings/:key", requirePermission("settings.write"), upsertSetting);

export default router;
