"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiArrowLeft, FiLoader } from "react-icons/fi";
import { BACKEND } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Request OTP
  const requestOtp = async () => {
    if (!email) return toast.error("Please enter your email address.");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/api/v1/auth/request-otp`, { email });
      if (res.data.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/api/v1/auth/verify-otp`, {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        router.push("/Login");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warm flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blush/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-4xl border border-cream-deep shadow-luxury p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
              <FiLock size={22} className="text-gold-dark" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-espresso-900">
              Reset Password
            </h1>
            <p className="text-ink-muted font-body text-sm mt-2">
              {otpSent
                ? "Enter the OTP sent to your email and your new password."
                : "Enter your registered email to receive a reset OTP."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!otpSent ? (
              /* ── Step 1: Enter email ─────────────────────────────── */
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-cream-deep bg-cream/50 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 transition-all duration-300">
                    <FiMail size={16} className="text-ink-muted flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="flex-1 bg-transparent text-espresso-900 placeholder-ink-muted/50 focus:outline-none font-body text-sm"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestOtp}
                  disabled={loading}
                  className="btn-luxury w-full justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <FiLoader size={18} />
                      </motion.span>
                      Sending OTP...
                    </>
                  ) : (
                    <>Send OTP <FiArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              /* ── Step 2: Enter OTP + new password ───────────────── */
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="input-luxury tracking-[0.3em] text-center font-body text-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                    New Password
                  </label>
                  <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-cream-deep bg-cream/50 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 transition-all duration-300">
                    <FiLock size={16} className="text-ink-muted flex-shrink-0" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="flex-1 bg-transparent text-espresso-900 placeholder-ink-muted/50 focus:outline-none font-body text-sm"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="btn-luxury w-full justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <FiLoader size={18} />
                      </motion.span>
                      Resetting...
                    </>
                  ) : (
                    <>Verify & Reset Password <FiArrowRight size={18} /></>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="flex items-center gap-1.5 text-xs font-body text-ink-muted hover:text-gold transition-colors mx-auto mt-1"
                >
                  <FiArrowLeft size={12} /> Back to email step
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-ink-muted font-body text-sm mt-7">
            Remembered it?{" "}
            <Link href="/Login" className="text-gold font-semibold hover:text-gold-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
