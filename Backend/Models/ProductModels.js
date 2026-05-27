import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salePrice: Number,
    shortDescription: String,
    sku: { type: String, index: true },
    subcategory: String,
    brand: { type: String, default: "Bindi's Cupcakery" },
    tags: [String],
    ingredients: String,
    nutritionalInfo: String,
    allergens: [String],
    weight: String,
    flavor: String,
    status: {
      type: String,
      enum: ["Active", "Draft", "Archived", "Out of stock"],
      default: "Active",
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    images: [{ url: String, publicId: String, alt: String, sort: Number }],
    variants: [
      {
        size: String,
        flavor: String,
        quantity: Number,
        weight: String,
        price: Number,
        stock: Number,
        sku: String,
      },
    ],
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    inventoryHistory: [
      {
        change: Number,
        reason: String,
        actor: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    shipping: {
      type: Boolean,
    },
    // ── Homepage sections ───────────────────────────────────────────────
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    tag: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
