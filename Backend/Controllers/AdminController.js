import productModel from "../Models/ProductModels.js";
import categoryModel from "../Models/CategoryModels.js";
import userModel from "../Models/UserModels.js";
import Review from "../Models/reveiwModel.js";
import { Payment } from "../Models/paymentModel.js";
import Coupon from "../Models/CouponModel.js";
import Banner from "../Models/BannerModel.js";
import AuditLog from "../Models/AuditLogModel.js";
import Setting from "../Models/SettingModel.js";

const paginate = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const adminOverviewController = async (req, res) => {
  try {
    const [products, categories, users, orders, reviews, coupons, banners] = await Promise.all([
      productModel.countDocuments(),
      categoryModel.countDocuments(),
      userModel.countDocuments(),
      Payment.find({}).select("amount payStatus status createdAt orderItems").lean(),
      Review.countDocuments(),
      Coupon.countDocuments(),
      Banner.countDocuments(),
    ]);

    const revenue = orders
      .filter((order) => order.payStatus === "paid")
      .reduce((sum, order) => sum + Number(order.amount || 0), 0);

    const pendingOrders = orders.filter((order) => ["Pending", "Confirmed", "Processing", "Packed"].includes(order.status)).length;
    const completedOrders = orders.filter((order) => order.status === "Delivered").length;
    const cancelledOrders = orders.filter((order) => ["Cancelled", "Returned", "Refunded"].includes(order.status)).length;
    const lowStockProducts = await productModel.countDocuments({ quantity: { $lte: 10 } });

    res.json({
      success: true,
      metrics: {
        revenue,
        products,
        categories,
        users,
        orders: orders.length,
        reviews,
        coupons,
        banners,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load admin overview", error: error.message });
  }
};

export const adminUsersController = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const q = req.query.q?.trim();
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }, { phone: new RegExp(q, "i") }] } : {};
    const [users, total] = await Promise.all([
      userModel.find(filter).select("-password -answer").sort({ createdAt: -1 }).skip(skip).limit(limit),
      userModel.countDocuments(filter),
    ]);
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load users", error: error.message });
  }
};

export const updateUserRoleController = async (req, res) => {
  try {
    const { adminRole, permissions, status } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { adminRole, permissions, status },
      { new: true }
    ).select("-password -answer");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

export const listResourceController = (Model, resourceName) => async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const [items, total] = await Promise.all([
      Model.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(),
    ]);
    res.json({ success: true, [resourceName]: items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to load ${resourceName}`, error: error.message });
  }
};

export const createResourceController = (Model, resourceName) => async (req, res) => {
  try {
    const item = await Model.create(req.body);
    await AuditLog.create({
      actor: req.user?._id,
      action: `${resourceName}.create`,
      resource: resourceName,
      resourceId: String(item._id),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.status(201).json({ success: true, [resourceName]: item });
  } catch (error) {
    res.status(400).json({ success: false, message: `Failed to create ${resourceName}`, error: error.message });
  }
};

export const listCoupons = listResourceController(Coupon, "coupons");
export const createCoupon = createResourceController(Coupon, "coupon");
export const listBanners = listResourceController(Banner, "banners");
export const createBanner = createResourceController(Banner, "banner");
export const listAuditLogs = listResourceController(AuditLog, "auditLogs");
export const listSettings = listResourceController(Setting, "settings");
export const upsertSetting = async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value: req.body.value, group: req.body.group, isSecret: req.body.isSecret },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to save setting", error: error.message });
  }
};
