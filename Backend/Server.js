import dotenv from "dotenv";
// ⚠️ dotenv MUST run first
dotenv.config();

import http from "http";
import express from "express";
import { Server as IoServer } from "socket.io";
import JWT from "jsonwebtoken";
import ConnectDb from "./Config/db.js";
import cors from "cors";
import authRoutes from "./Routes/AuthRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import categoryRoutes from "./Routes/CategoryRoutes.js";
import productRoutes from "./Routes/ProductRoutes.js";
import reviewRoutes from "./Routes/reveiwRoutes.js";
import moodRoutes from "./Routes/moodRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import healthRoutes from "./Routes/healthRoutes.js";
import { setSocketServer } from "./Controllers/paymentController.js";
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

// ── CORS — single source of truth, no manual override ────────────────────────
// The cors() middleware handles all preflight (OPTIONS) + actual requests.
// DO NOT add a second manual res.header("Access-Control-Allow-Origin") block —
// that conflicts with Socket.IO's own CORS check and breaks WebSocket upgrades.
app.use(cors(corsOptions));


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
app.use("/api/chat", chatRoutes);
app.use("/", healthRoutes); // ✅ health check for Render keep-alive

// Root welcome (handled inline — not a duplicate of /health)
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Bindi's Cupcakery API 🎂",
    docs: "/health",
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
const server = http.createServer(app);

const io = new IoServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1] || socket.handshake.headers?.auth;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = String(socket.user?._id);
  if (userId) {
    socket.join(`user_${userId}`);
  }

  const isAdmin = socket.user?.role === 1 || ["Super Admin", "Admin"].includes(socket.user?.adminRole);
  if (isAdmin) {
    socket.join("admins");
  }

  socket.on("joinOrder", ({ orderId }) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
    }
  });

  socket.on("disconnect", () => {
    // socket.io automatically cleans up room membership
  });
});

setSocketServer(io);

server.listen(PORT, () => {
  console.log(`🚀 App is listening on port ${PORT}`);
});
