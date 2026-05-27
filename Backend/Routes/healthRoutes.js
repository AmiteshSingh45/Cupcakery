/**
 * Backend Keep-Alive Route
 * Render free tier spins down after 15 min of inactivity.
 * The frontend pings /health every 14 minutes to prevent cold starts.
 */
import express from "express";
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Bindi's Cupcakery API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
