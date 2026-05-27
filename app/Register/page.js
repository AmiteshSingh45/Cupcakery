"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { BACKEND } from "@/lib/api";

const FIELDS = [
  { id: "name",    label: "Full Name",              type: "text",     placeholder: "Priya Sharma" },
  { id: "email",   label: "Email Address",          type: "email",    placeholder: "priya@email.com" },
  { id: "password",label: "Password",               type: "password", placeholder: "Min. 8 characters" },
  { id: "phone",   label: "Phone Number",           type: "tel",      placeholder: "+91 98765 43210" },
  { id: "address", label: "Address",                type: "text",     placeholder: "Parle Point, Surat" },
  { id: "answer",  label: "Security Answer",        type: "text",     placeholder: "Your mother's maiden name..." },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "", answer: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  // ── All original registration logic preserved exactly ────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND}/api/v1/auth/register`,
        { name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address, answer: form.answer }
      );
      if (res.data?.success) {
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
    <div className="min-h-screen bg-cream-warm flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] max-w-lg rounded-full bg-blush/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[35vw] h-[35vw] max-w-md rounded-full bg-gold/10 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25,0.46,0.45,0.94] }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-luxury border border-cream-deep/50 overflow-hidden">
          {/* Brand accent top bar */}
          <div className="h-1 w-full bg-gold-shine" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-card">
                <Image src="/logo.jpg" alt="Bindi's Cupcakery" fill className="object-cover" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-espresso-900">Bindi&apos;s Cupcakery</h1>
                <p className="text-xs text-ink-muted font-body">Join the sweet community 🍰</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-semibold text-espresso-900 mb-1">Create Account</h2>
            <p className="text-sm text-ink-muted font-body mb-7">
              Sign up to order your favourite handcrafted desserts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {FIELDS.map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id}
                    className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-2 font-body">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      id={field.id}
                      type={field.id === "password" ? (showPwd ? "text" : "password") : field.type}
                      value={form[field.id]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      className={`input-luxury ${field.id === "password" ? "pr-12" : ""}`}
                    />
                    {field.id === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted
                                   hover:text-espresso-900 transition-colors"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <p className="text-xs text-ink-muted font-body pt-1 pb-2">
                🔐 Security answer is used for password recovery.
              </p>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "" : "0 8px 25px rgba(212,168,83,0.4)" }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="btn-luxury w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>Create Account <FiArrowRight size={17} /></>
                )}
              </motion.button>
            </form>

            <p className="text-center text-sm text-ink-muted font-body mt-6">
              Already have an account?{" "}
              <Link href="/Login" className="text-gold-dark font-semibold hover:text-gold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
