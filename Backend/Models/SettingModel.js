import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: {},
    group: { type: String, default: "general" },
    isSecret: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
