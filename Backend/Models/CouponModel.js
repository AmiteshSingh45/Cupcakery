import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed", "free_shipping"], required: true },
    value: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    startsAt: Date,
    expiresAt: Date,
    status: { type: String, enum: ["Active", "Scheduled", "Paused", "Expired"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
