import JWT from "jsonwebtoken";
import userModel from "../Models/UserModels.js";


//Protected Routes token base
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
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};




//admin acceess
export const isAdmin = async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user._id);
      if (user.role !== 1 && user.adminRole !== "Super Admin" && user.adminRole !== "Admin") {
        return res.status(401).send({
          success: false,
          message: "UnAuthorized Access",
        });
      } else {
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({
        success: false,
        error,
        message: "Error in admin middelware",
      });
    }
  };


export const Authenticated = async (req, res, next) => {
    const token = req.header("Auth");
  
    if (!token) return res.status(401).json({ message: "Login first" });
  
    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      const id = decoded._id || decoded.userId;
  
      const foundUser = await userModel.findById(id);
  
      if (!foundUser) return res.status(401).json({ message: "User not exist" });
  
      req.user = foundUser;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };

export const requirePermission = (permission) => async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).select("role adminRole permissions status");
    if (!user || user.status === "Banned") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const isLegacyAdmin = user.role === 1;
    const isPrivileged = ["Super Admin", "Admin"].includes(user.adminRole);
    const hasPermission = user.permissions?.includes(permission);
    if (isLegacyAdmin || isPrivileged || hasPermission) return next();
    return res.status(403).json({ success: false, message: `Missing permission: ${permission}` });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Permission check failed" });
  }
};
