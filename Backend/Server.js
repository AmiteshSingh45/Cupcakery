import dotenv from "dotenv";
// ⚠️ CRITICAL: dotenv.config() MUST run before any other imports that read env vars
dotenv.config();

import express from "express";
import ConnectDb from "./Config/db.js";
import cors from "cors";
import authRoutes from "./Routes/AuthRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import categoryRoutes from "./Routes/CategoryRoutes.js";
import productRoutes from "./Routes/ProductRoutes.js";
import reviewRoutes from "./Routes/reveiwRoutes.js";
import morgan from "morgan";
import moodRoutes from "./Routes/moodRoutes.js";

const app = express();

// ── Connect to MongoDB ─────────────────────────────────────────────────────
ConnectDb();

// ── CORS ─────────────────────────────────────────────────────────────────
// Allowlist of every trusted frontend origin.
// Add new domains here when needed — never use "*" with credentials: true.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://cupcakery.vercel.app",
  "https://bindiscupcakery.com",
  "https://www.bindiscupcakery.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / curl / server-to-server requests (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // ✅ Reflect exact origin back — required when credentials: true
      callback(null, true);
    } else {
      // ❌ Reject — browser will see "blocked by CORS policy"
      callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Auth"],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  credentials: true,         // Send/receive cookies & Authorization headers
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

// ── Apply CORS globally — MUST be before any routes ───────────────────────
app.use(cors(corsOptions));

// ── Handle OPTIONS preflight on every route ────────────────────────────────
// Browsers send OPTIONS before POST/PUT/DELETE with custom headers.
// Without this, preflight fails and the real request is never sent.
app.options("*", cors(corsOptions));

// ── HTTP request logger ────────────────────────────────────────────────────
app.use(morgan("dev"));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api", moodRoutes);
app.use("/api/v1/payment", payment);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Bindi's Cupcakery API 🎂", status: "OK" });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start server ───────────────────────────────────────────────────────────
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 App is listening on port ${port}`);
});
