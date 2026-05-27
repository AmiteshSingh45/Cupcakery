import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    action: { type: String, required: true },
    resource: String,
    resourceId: String,
    metadata: {},
    ip: String,
    userAgent: String,
    risk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
