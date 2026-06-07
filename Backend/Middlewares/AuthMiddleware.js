import JWT from "jsonwebtoken";
import userModel from "../Models/UserModels.js";

// ─────────────────────────────────────────────────────────────────────────────
// requireSignIn — verify JWT and attach decoded user to req.user
// ─────────────────────────────────────────────────────────────────────────────
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const legacyToken = req.headers.auth;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : legacyToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// isAdmin — verify user has admin role (fetches fresh from DB to prevent stale data)
// ─────────────────────────────────────────────────────────────────────────────
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).select("role adminRole status");

    if (!user) {
      return res.status(403).json({ success: false, message: "Access denied: user not found" });
    }

    if (user.status === "Banned" || user.status === "Suspended") {
      return res.status(403).json({ success: false, message: "Access denied: account suspended" });
    }

    const isLegacyAdmin = user.role === 1;
    const isRoleAdmin = ["Super Admin", "Admin"].includes(user.adminRole);

    if (!isLegacyAdmin && !isRoleAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: admin privileges required",
      });
    }

    // Attach full user context for controllers
    req.user = { ...req.user, name: user.name, adminRole: user.adminRole, status: user.status };
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(403).json({ success: false, message: "Access denied: authorization check failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission — granular permission check (for fine-grained admin access)
// ─────────────────────────────────────────────────────────────────────────────
export const requirePermission = (permission) => async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).select("role adminRole permissions status");
    if (!user || ["Banned", "Suspended"].includes(user.status)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const isSuperAdmin = user.role === 1 || user.adminRole === "Super Admin";
    const hasPermission = user.permissions?.includes(permission);
    const isAdminRole = ["Admin"].includes(user.adminRole);

    if (isSuperAdmin || isAdminRole || hasPermission) return next();
    return res.status(403).json({ success: false, message: `Missing permission: ${permission}` });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Permission check failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated — legacy middleware (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export const Authenticated = async (req, res, next) => {
  const token = req.header("Auth");
  if (!token) return res.status(401).json({ message: "Login first" });
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const id = decoded._id || decoded.userId;
    const foundUser = await userModel.findById(id);
    if (!foundUser) return res.status(401).json({ message: "User not found" });
    req.user = foundUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
