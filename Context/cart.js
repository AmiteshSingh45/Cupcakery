"use client"; // Ensure this file is client-side only

import { useState, useContext, createContext, useEffect } from "react";

// Create a CartContext to manage the cart state
const CartContext = createContext();

// CartProvider component to wrap the app and provide cart state
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart items from localStorage on component mount
    let existingCartItems = localStorage.getItem("cart");
    if (existingCartItems) {
      setCart(JSON.parse(existingCartItems));
    }
  }, []);

  // Update localStorage whenever cart changes (including when empty)
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart context
const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { useCart, CartProvider };
