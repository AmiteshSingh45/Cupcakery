import express from 'express'
import { requestOtp, verifyOtp, updateProfileController } from "../Controllers/AuthController.js";
import {
    registerController,
    loginController,
    testController,
    } 
from "../Controllers/AuthController.js"
import { getUserOrders, getAllOrders, updateOrderStatus } from "../Controllers/paymentController.js"
import { isAdmin, requireSignIn } from '../Middlewares/AuthMiddleware.js'
import rateLimit from 'express-rate-limit'

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 min per IP
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  message: { success: false, message: "Too many accounts created, please try again later" },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 OTP requests per 15 min per IP
  message: { success: false, message: "Too many OTP requests, please wait 15 minutes" },
});


//router object
const router=express.Router()

//routing
//REGISTER ||  METHOD POST
router.post("/register", registerLimiter, registerController)

// LOGIN || METHOD POST
router.post("/login", loginLimiter, loginController)

//test routes
router.get("/test",requireSignIn, isAdmin, testController)


router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

// Update user profile — protected
router.put("/profile", requireSignIn, updateProfileController);

// Order routes — user
router.get("/orders", requireSignIn, getUserOrders);

// Order routes — admin
router.get("/all-orders", requireSignIn, isAdmin, getAllOrders);
router.put("/order-status/:orderId", requireSignIn, isAdmin, updateOrderStatus);

export default router