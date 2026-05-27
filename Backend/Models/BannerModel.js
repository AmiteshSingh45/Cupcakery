import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    placement: { type: String, required: true },
    image: String,
    link: String,
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["Live", "Scheduled", "Draft", "Disabled"], default: "Draft" },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
