"use client";

import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import toast from "react-hot-toast";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/Context/auth";

const NotificationsContext = createContext(null);

const STATUS_TOAST_MAP = {
  "Approved": { msg: "✅ Your order has been approved!", type: "success" },
  "Preparing": { msg: "👩‍🍳 Preparation has started on your order!", type: "success" },
  "Baking": { msg: "🔥 Your treats are being baked!", type: "success" },
  "Packed": { msg: "📦 Your order is packed and ready!", type: "success" },
  "Out for Delivery": { msg: "🛵 Your order is on its way!", type: "success" },
  "Delivered": { msg: "🎉 Your order has been delivered! Enjoy!", type: "success" },
  "Cancelled": { msg: "❌ Your order has been cancelled.", type: "error" },
  "Rejected": { msg: "🚫 Your order was rejected. Contact support.", type: "error" },
  "Refunded": { msg: "💸 Your refund has been processed.", type: "success" },
};

const initialState = { notifications: [], unreadCount: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const newNotif = {
        id: Date.now(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return {
        notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep last 50
        unreadCount: state.unreadCount + 1,
      };
    }
    case "MARK_ALL_READ":
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

export function NotificationsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [auth] = useAuth();

  const addNotification = useCallback((notification) => {
    dispatch({ type: "ADD", payload: notification });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_READ" });
  }, []);

  // Listen to Socket.IO order events and convert to notifications
  useEffect(() => {
    if (!auth?.token) return;
    const socket = connectSocket(auth.token);
    if (!socket) return;

    const handleOrderUpdated = (order) => {
      const status = order.status || order.order_status;
      const config = STATUS_TOAST_MAP[status];
      const message = config?.msg || order.status_message || `Order status: ${status}`;

      // Add to in-app notification center
      addNotification({
        type: "order_update",
        title: `Order ${status}`,
        message,
        orderId: order._id,
        orderRef: order.order_id || order._id,
        status,
      });

      // Show toast
      if (config?.type === "error") {
        toast.error(message, { duration: 5000 });
      } else {
        toast.success(message, {
          duration: 5000,
          icon: config?.msg?.split(" ")[0] || "📦",
        });
      }
    };

    const handleOrderCreated = (order) => {
      addNotification({
        type: "order_created",
        title: "Order Placed!",
        message: `Your order ${order.order_id || ""} has been placed successfully.`,
        orderId: order._id,
        orderRef: order.order_id || order._id,
        status: "Pending Approval",
      });
    };

    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("orderCreated", handleOrderCreated);

    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("orderCreated", handleOrderCreated);
    };
  }, [auth?.token, addNotification]);

  return (
    <NotificationsContext.Provider
      value={{ ...state, addNotification, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    // Return safe defaults if used outside provider
    return { notifications: [], unreadCount: 0, addNotification: () => {}, markAllRead: () => {} };
  }
  return ctx;
};
