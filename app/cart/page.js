"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../../Context/cart";
import { useAuth } from "../../Context/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiShoppingCart, FiArrowLeft, FiCreditCard } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { BACKEND } from "@/lib/api";
import { getProductImage } from "@/lib/catalog";

// ─── Cart Item ────────────────────────────────────────────────────────────────
function CartItem({ item, onRemove }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.35, ease: [0.25,0.46,0.45,0.94] }}
      className="flex items-start gap-4 bg-white rounded-3xl p-5 shadow-card
                 border border-cream-deep/40 hover:shadow-card-hover transition-shadow duration-400"
    >
      {/* Product image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-cream-warm">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <Image
          src={getProductImage(item)}
          alt={item.name}
          fill
          className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          sizes="96px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base font-semibold text-espresso-900 leading-snug line-clamp-2">
          {item.name}
        </h3>
        <p className="text-xs text-ink-muted font-body mt-1 line-clamp-1">
          {item.description?.substring(0, 60)}...
        </p>
        <span className="font-display text-lg font-bold text-espresso-900 mt-2 block">
          ₹{item.price}
        </span>
      </div>

      {/* Remove */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item._id)}
        aria-label={`Remove ${item.name} from cart`}
        className="w-9 h-9 rounded-full bg-blush-light text-blush-rose flex items-center justify-center
                   hover:bg-blush/40 transition-colors flex-shrink-0"
      >
        <FiTrash2 size={15} />
      </motion.button>
    </motion.div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
const CartPage = () => {
  const [auth] = useAuth();
  const { cart, setCart } = useCart();
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [address, setAddress] = useState(auth?.user?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(auth?.user?.phone || "");
  const [notes, setNotes] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const router = useRouter();

  // ── Razorpay script loader (original logic preserved) ────────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const cartArray = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);

  const totalPrice = () => cartArray.reduce((total, item) => total + item.price, 0);

  const removeItem = (productId) => {
    const updated = cartArray.filter((item) => item._id !== productId);
    setCart(updated);
  };

  useEffect(() => { setIsCartLoaded(cartArray.length > 0); }, [cartArray]);

  // ── Payment handler (original logic preserved exactly) ───────────────────
  const paymentHandler = async (e, amount) => {
    e.preventDefault();
    setPayLoading(true);
    const receiptId = `order_${Date.now()}`;

    try {
      const response = await fetch(`${BACKEND}/api/v1/payment/create-order`, {
        method:  "POST",
        body:    JSON.stringify({ amount, currency: "INR", receipt: receiptId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error: ${response.status} - ${text}`);
      }

      const order = await response.json();
      const razorpayAmount = order.amount * 100;

      const options = {
        key:         "rzp_test_s7445STXOihmYb",
        amount:      razorpayAmount,
        currency:    order.currency,
        name:        "Bindi's Cupcakery",
        description: "Dessert Order",
        order_id:    order.orderId,
        handler: async function (response) {
          const orderDetails = {
            userId:       auth?.user?._id,
            orderId:      response.razorpay_order_id,
            paymentId:    response.razorpay_payment_id,
            signature:    response.razorpay_signature,
            amount,
            subtotal:     amount,
            delivery_fee: 0,
            orderItems:   cartArray,
            userShipping: {
              name:    auth?.user?.name || "",
              email:   auth?.user?.email || "",
              phone:   phoneNumber,
              address: address,
            },
            address,
            phone_number: phoneNumber,
            notes,
            delivery_slot: deliverySlot,
            payment_method: "Razorpay",
          };

          const saveRes = await fetch(`${BACKEND}/api/v1/payment/verify-payment`, {
            method:  "POST",
            body:    JSON.stringify(orderDetails),
            headers: {
              "Content-Type": "application/json",
              Authorization: auth?.token ? `Bearer ${auth.token}` : "",
            },
          });

          if (!saveRes.ok) {
            const errText = await saveRes.text();
            throw new Error(`Order Save Error: ${saveRes.status} - ${errText}`);
          }
          setCart([]);
          toast.success("Payment Successful! Your order has been placed 🎉");
          router.push("/dashboard/user/orders");
        },
        prefill: {
          name:    auth?.user?.name || "Customer",
          email:   auth?.user?.email || "customer@example.com",
          contact: phoneNumber || "9000000000",
        },
        theme: { color: "#D4A853" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => toast.error("Payment Failed: " + r.error.description));
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error.message);
      toast.error("Error processing payment. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-espresso-900 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-2">
              <FiShoppingCart size={20} className="text-gold" />
              <span className="section-label text-gold">Your Order</span>
            </div>
            <h1 className="font-display text-hero-sm text-cream font-bold">
              {auth?.user ? `Hello, ${auth.user.name}!` : "Your Cart"}
            </h1>
            <p className="text-cream/55 font-body mt-2 text-base">
              {cartArray.length
                ? `${cartArray.length} item${cartArray.length !== 1 ? "s" : ""} in your cart`
                : "Your cart is empty"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="section-container py-10">
        {!isCartLoaded ? (
          /* ── Empty cart ─────────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="font-display text-2xl text-espresso-900 mb-3">Your cart is empty</h2>
            <p className="text-ink-muted font-body text-base mb-8 max-w-xs mx-auto">
              Discover our range of handcrafted eggless desserts and add your favourites!
            </p>
            <Link href="/products">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-luxury">
                <FiArrowLeft size={16} />
                Explore Products
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* ── Cart content ───────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg font-semibold text-espresso-900">Cart Items</h2>
                <Link href="/products"
                  className="flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold
                             font-body font-medium transition-colors">
                  <FiArrowLeft size={14} />
                  Continue shopping
                </Link>
              </div>

              <AnimatePresence>
                {cartArray.map((item, index) => (
                  <CartItem key={`${item._id}-${index}`} item={item} onRemove={removeItem} />
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-3xl shadow-card border border-cream-deep/40 overflow-hidden">
                {/* Gold accent */}
                <div className="h-1 bg-gold-shine" />

                <div className="p-7">
                  <h2 className="font-display text-xl font-semibold text-espresso-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-ink-muted">Subtotal ({cartArray.length} items)</span>
                      <span className="font-semibold text-espresso-900">₹{totalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-ink-muted">Delivery</span>
                      <span className="text-green-600 font-semibold">Free Pickup</span>
                    </div>
                    <div className="h-px bg-cream-deep/60 my-2" />
                    <div className="flex justify-between font-body">
                      <span className="font-semibold text-espresso-900">Total</span>
                      <span className="font-display text-2xl font-bold text-espresso-900">
                        ₹{totalPrice()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-5 bg-cream-warm rounded-3xl p-4">
                    <label className="block text-sm font-medium text-espresso-900">
                      Delivery Address
                      <input
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Enter delivery address"
                        className="mt-2 w-full rounded-2xl border border-cream-deep bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                      />
                    </label>
                    <label className="block text-sm font-medium text-espresso-900">
                      Phone Number
                      <input
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        placeholder="Enter phone number"
                        className="mt-2 w-full rounded-2xl border border-cream-deep bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                      />
                    </label>
                    <label className="block text-sm font-medium text-espresso-900">
                      Delivery Notes
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Any special delivery instructions"
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-cream-deep bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                      />
                    </label>
                    <label className="block text-sm font-medium text-espresso-900">
                      Delivery Slot
                      <input
                        value={deliverySlot}
                        onChange={(event) => setDeliverySlot(event.target.value)}
                        placeholder="e.g. Tomorrow 4-6 PM"
                        className="mt-2 w-full rounded-2xl border border-cream-deep bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-ink-muted font-body mb-5 bg-cream-warm rounded-2xl p-3 text-center">
                    🏪 Pickup at Parle Point, Surat · 10 AM – 7 PM
                  </p>

                  {auth?.token ? (
                    <motion.button
                      whileHover={{ scale: payLoading ? 1 : 1.02, boxShadow: "0 8px 25px rgba(212,168,83,0.4)" }}
                      whileTap={{ scale: payLoading ? 1 : 0.97 }}
                      onClick={(e) => paymentHandler(e, totalPrice())}
                      disabled={cartArray.length === 0 || payLoading}
                      className="btn-luxury w-full justify-center py-4 text-base
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {payLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <FiCreditCard size={17} />
                          Proceed to Payment
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push("/Login")}
                      className="btn-luxury w-full justify-center py-4 text-base"
                    >
                      Sign In to Checkout
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
