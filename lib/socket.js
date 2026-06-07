import { io } from "socket.io-client";
import { BACKEND } from "@/lib/api";

let socket = null;

export const connectSocket = (token) => {
  if (typeof window === "undefined" || !token) return null;
  if (socket && socket.connected) return socket;

  socket = io(BACKEND, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket connection error:", error.message || error);
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
  if (socket && orderId) {
    socket.emit("joinOrder", { orderId });
  }
};
