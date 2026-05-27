import { Payment } from "../Models/paymentModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Checkout - Create Order
export const checkout = async (req, res) => {
  try {
    console.log("checkout page ke andar");
    const { amount, receipt } = req.body; // frontend se {amount, receipt} aayega
    console.log("in checkout controllers", amount, receipt);

    const options = {
      amount: amount * 100, // Convert to paisa (Razorpay expects in paise)
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Amount = ", options.amount);

    res.json({
      success: true,
      orderId: order.id,   // Razorpay se actual orderId
      amount: amount,
      currency: order.currency,
      receipt: order.receipt,
      payStatus: "created",
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ✅ Verify Payment & Save to DB
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      amount,
      orderItems,
      userId,
      userShipping,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = orderId + "|" + paymentId;

    console.log("Verify payment = ", amount);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === signature) {
      // ✅ Only save if verified
      const orderConfirm = await Payment.create({
        orderId,
        paymentId,
        signature,
        amount,
        orderItems,
        userId,
        userShipping,
        payStatus: "paid",
      });

      res.json({
        success: true,
        message: "Payment successful",
        orderConfirm,
      });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};


// ✅ Get orders for the logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Payment.find({ userId: req.user._id })
      .populate("orderItems")
      .sort({ createdAt: -1 });

    // Shape to match frontend expectations
    const shaped = orders.map((o) => ({
      _id: o._id,
      status: o.status || "Processing",
      buyer: { name: o.userShipping?.name },
      payment: { success: o.payStatus === "paid" },
      products: o.orderItems || [],
      createdAt: o.createdAt,
      amount: o.amount,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};


// ✅ Get ALL orders — admin only
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Payment.find({})
      .populate("orderItems")
      .sort({ createdAt: -1 });

    const shaped = orders.map((o) => ({
      _id: o._id,
      status: o.status || "Processing",
      buyer: { name: o.userShipping?.name },
      payment: { success: o.payStatus === "paid" },
      products: o.orderItems || [],
      createdAt: o.createdAt,
      amount: o.amount,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};


// ✅ Update order status — admin only
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updated = await Payment.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Status updated", order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};
