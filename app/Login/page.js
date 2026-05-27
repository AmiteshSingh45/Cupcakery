"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "../../Context/auth";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { BACKEND } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [auth, , , setAuth] = useAuth();
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("🚀 Sending Login Request...");

    const res = await axios.post(
      `${BACKEND}/api/v1/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 15000,
      }
    );

    console.log("✅ Response:", res.data);

    if (res.data.success) {
      toast.success(res.data.message);

      setAuth({
        user: res.data.user,
        token: res.data.token,
      });

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: res.data.user,
          token: res.data.token,
        })
      );

      localStorage.setItem("user_id", res.data.user._id);
      localStorage.setItem("user_name", res.data.user.name);

      router.push("/");
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.log("🔥 FULL LOGIN ERROR:", error);

    if (error.response) {
      console.log("❌ RESPONSE ERROR:", error.response);
      console.log("❌ DATA:", error.response.data);

      toast.error(
        error.response.data.message || "Backend response error"
      );
    } else if (error.request) {
      console.log("❌ REQUEST ERROR:", error.request);
      toast.error("Request reached browser but backend unreachable");
    } else {
      console.log("❌ GENERAL ERROR:", error.message);
      toast.error(error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const inputWrap = (field) =>
    `flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border font-body text-sm transition-all duration-300 ${
      focusedField === field
        ? "border-gold ring-2 ring-gold/25 bg-white shadow-gold/10 shadow-md"
        : "border-cream-deep bg-cream/60 hover:border-cream-deep/80"
    }`;

  return (
    <div className="min-h-screen bg-luxury-warm flex overflow-hidden">

      {/* ── LEFT PANEL — Brand visual ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-espresso-900">
        <Image
          src="/hpcakefinal.jpg"
          alt="Bindi's Cupcakery"
          fill
          className="object-cover opacity-40"
          sizes="50vw"
          priority
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-900/80 via-espresso-900/60 to-espresso-900/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Bindi's Cupcakery"
              width={120}
              height={120}
              className="rounded-full shadow-luxury border-2 border-gold/20"
            />
          </Link>

          {/* Hero text */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-body font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
              Handcrafted Desserts · Surat
            </span>

            <h1 className="font-display text-4xl xl:text-5xl font-semibold text-cream leading-tight">
              Welcome back to<br />
              <span className="text-gradient-gold">Bindi&apos;s Cupcakery</span>
            </h1>

            <p className="text-cream/60 font-body leading-relaxed max-w-sm">
              Sign in to browse our handcrafted eggless desserts, manage your
              orders, and get sweet exclusives.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {["🥚 100% Eggless", "🏠 Homemade", "🌿 Natural"].map((badge) => (
                <span key={badge} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-cream/70 text-xs font-body">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <blockquote className="border-l-2 border-gold/40 pl-4">
            <p className="text-cream/50 font-body text-sm italic leading-relaxed">
              &ldquo;Made with love, served with joy — every bite is a celebration.&rdquo;
            </p>
            <footer className="text-gold/70 text-xs font-body mt-2">— Bindi&apos;s Cupcakery</footer>
          </blockquote>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ─────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blush/15 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Image
              src="/logo.jpg"
              alt="Bindi's Cupcakery"
              width={90}
              height={90}
              className="rounded-full shadow-card"
            />
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-4xl border border-cream-deep shadow-luxury p-8 sm:p-10">
            {/* Heading */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 text-gold mb-3">
                <HiOutlineSparkles size={16} />
                <span className="text-xs font-body font-semibold tracking-widest uppercase">Sign In</span>
              </div>
              <h1 className="font-display text-3xl font-semibold text-espresso-900">
                Welcome Back
              </h1>
              <p className="text-ink-muted font-body text-sm mt-1.5">
                Sign in to your Bindi&apos;s Cupcakery account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                  Email Address
                </label>
                <div className={inputWrap("email")}>
                  <FiMail size={16} className={focusedField === "email" ? "text-gold" : "text-ink-muted"} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    className="flex-1 bg-transparent text-espresso-900 placeholder-ink-muted/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-body text-gold hover:text-gold-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className={inputWrap("password")}>
                  <FiLock size={16} className={focusedField === "password" ? "text-gold" : "text-ink-muted"} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    required
                    className="flex-1 bg-transparent text-espresso-900 placeholder-ink-muted/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-ink-muted hover:text-espresso-900 transition-colors"
                  >
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="btn-luxury w-full justify-center gap-2 mt-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="w-4 h-4 border-2 border-espresso-900/30 border-t-espresso-900 rounded-full"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-cream-deep" />
              <span className="text-xs font-body text-ink-muted">or</span>
              <div className="flex-1 h-px bg-cream-deep" />
            </div>

            {/* Register link */}
            <p className="text-center text-ink-muted font-body text-sm">
              New here?{" "}
              <Link href="/Register" className="text-gold font-semibold hover:text-gold-dark transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
