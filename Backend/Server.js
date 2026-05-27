import dotenv from "dotenv";
// ⚠️ dotenv MUST run first
dotenv.config();

import express from "express";
import ConnectDb from "./Config/db.js";
import cors from "cors";
import authRoutes from "./Routes/AuthRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import categoryRoutes from "./Routes/CategoryRoutes.js";
import productRoutes from "./Routes/ProductRoutes.js";
import reviewRoutes from "./Routes/reveiwRoutes.js";
import moodRoutes from "./Routes/moodRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import morgan from "morgan";

const app = express();

// ─────────────────────────────────────────────────────────────
// Connect MongoDB
// ─────────────────────────────────────────────────────────────
ConnectDb();

// ─────────────────────────────────────────────────────────────
// Allowed Frontend Origins
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",

  // Vercel frontend
  "https://cupcakery.vercel.app",

  // Custom domain
  "https://bindiscupcakery.com",
  "https://www.bindiscupcakery.com",
];

// ─────────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌍 Request Origin:", origin);

    // Allow Postman, curl, server-side requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ Blocked by CORS:", origin);
    return callback(new Error("CORS not allowed"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Auth",
  ],

  exposedHeaders: [
    "Content-Length",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 200,
};

// ─────────────────────────────────────────────────────────────
// Apply CORS BEFORE Routes
// ─────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// Handle preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Auth"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api", moodRoutes);
app.use("/api/v1/payment", payment);

// ─────────────────────────────────────────────────────────────
// Health Route
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Bindi's Cupcakery API 🎂",
  });
});

// ─────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 App is listening on port ${PORT}`);
});
