import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: {},
      required: true,
    },
    answer: {
      type: String,
      required: true
    },
    role: {
      type: Number,
      default: 0,
    },
    adminRole: {
      type: String,
      enum: ["Customer", "Super Admin", "Admin", "Staff", "Moderator"],
      default: "Customer",
    },
    permissions: [String],
    status: {
      type: String,
      enum: ["Active", "Banned", "Invited", "Suspended"],
      default: "Active",
    },
    addresses: [{ label: String, line1: String, city: String, state: String, pincode: String }],
    lastLoginAt: Date,
    loginActivity: [{ ip: String, userAgent: String, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);

