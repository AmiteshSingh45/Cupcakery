import { io } from "socket.io-client";
import { BACKEND } from "@/lib/api";

let socket = null;

/**
 * connectSocket — Production-safe Socket.IO client
 *
 * KEY FIX: Use `transports: ["polling", "websocket"]` NOT just `["websocket"]`.
 *
 * WHY: Render's free-tier reverse proxy cannot reliably upgrade HTTP → WebSocket.
 * Forcing `websocket`-only transport skips the polling fallback, so if the WS
 * upgrade fails (which it does on Render free tier), Socket.IO gives up entirely.
 *
 * Solution: Start with HTTP long-polling (always works through proxies), then
 * automatically upgrade to WebSocket when the connection stabilises.
 */
export const connectSocket = (token) => {
  if (typeof window === "undefined" || !token) return null;

  // Reuse existing connected socket
  if (socket && socket.connected) return socket;

  // Disconnect stale disconnected socket before creating a new one
  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }

  socket = io(BACKEND, {
    auth: { token },

    // ✅ CRITICAL PRODUCTION FIX:
    // "polling" first so it always works through Render's proxy.
    // Socket.IO will automatically upgrade to "websocket" once connected.
    transports: ["polling", "websocket"],

    withCredentials: true,
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    // Non-fatal: orders will still load from REST API
    console.warn("⚠️ Socket connection error (non-fatal):", error.message || error);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOrderRoom = (orderId) => {
  if (socket && socket.connected && orderId) {
    socket.emit("joinOrder", { orderId });
  }
};
