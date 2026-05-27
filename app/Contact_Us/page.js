"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FiMapPin, FiPhone, FiMail, FiSend, FiLoader, FiClock } from "react-icons/fi";

const CONTACT_INFO = [
  {
    icon: <FiPhone size={20} />,
    label: "Phone",
    value: "+91 83404 97237",
    href: "tel:+918340497237",
  },
  {
    icon: <FiMail size={20} />,
    label: "Email",
    value: "bindiscupcakery@gmail.com",
    href: "mailto:bindiscupcakery@gmail.com",
  },
  {
    icon: <FiMapPin size={20} />,
    label: "Location",
    value: "Parle Point, Surat, Gujarat, India",
    href: "#",
  },
  {
    icon: <FiClock size={20} />,
    label: "Hours",
    value: "10 AM – 7 PM, Mon–Sat",
    href: "#",
  },
];

const SOCIALS = [
  {
    icon: <FaInstagram size={20} />,
    label: "Instagram",
    href: "https://www.instagram.com/bindis_cupcakery",
    color: "from-pink-500 to-orange-400",
  },
  {
    icon: <FaFacebookF size={20} />,
    label: "Facebook",
    href: "https://www.facebook.com/bindi.malji",
    color: "from-blue-600 to-blue-500",
  },
  {
    icon: <FaWhatsapp size={20} />,
    label: "WhatsApp",
    href: "https://wa.me/918340497237?text=Hello%2C%20I%20want%20to%20know%20more!",
    color: "from-green-500 to-green-400",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission (UI only — no backend for contact form)
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 rounded-2xl border font-body text-sm text-espresso-900 bg-white placeholder-ink-muted/40 transition-all duration-300 focus:outline-none ${
      focusedField === field
        ? "border-gold ring-2 ring-gold/20"
        : "border-cream-deep"
    }`;

  return (
    <div className="bg-cream min-h-screen">
      {/* ── Hero strip ────────────────────────────────────────────────────── */}
      <div className="bg-luxury-dark py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #D4A853 0%, transparent 50%)" }}
        />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-gold">Contact Us</span>
            <h1 className="font-display text-hero-sm text-cream mt-2 leading-tight">
              Let&apos;s Have a{" "}
              <span className="text-gradient-gold">Sweet Conversation</span>
            </h1>
            <p className="text-cream/60 font-body mt-3 max-w-md">
              Questions, bulk orders, or just saying hi — we&apos;re always happy
              to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <section className="py-section">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Left: Contact Info ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              <AnimatedSection variant="slide-right">
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-semibold text-espresso-900">
                    Get in Touch
                  </h2>
                  <p className="text-ink-muted font-body text-sm leading-relaxed">
                    We&apos;re a cloud kitchen in Surat. Reach out via any of
                    the channels below and we&apos;ll get back to you quickly.
                  </p>
                </div>
              </AnimatedSection>

              {/* Info Cards */}
              <div className="space-y-3">
                {CONTACT_INFO.map((info, i) => (
                  <AnimatedSection key={info.label} variant="slide-right" delay={i * 0.08}>
                    <a
                      href={info.href}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-cream-deep hover:border-gold/40 hover:shadow-card transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0 group-hover:bg-gold group-hover:text-espresso-900 transition-all duration-300">
                        {info.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-body font-semibold uppercase tracking-widest text-ink-muted">
                          {info.label}
                        </p>
                        <p className="text-espresso-900 font-body font-medium text-sm mt-0.5">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  </AnimatedSection>
                ))}
              </div>

              {/* Socials */}
              <AnimatedSection variant="slide-right" delay={0.4}>
                <div>
                  <p className="text-xs font-body font-semibold uppercase tracking-widest text-ink-muted mb-3">
                    Follow Us
                  </p>
                  <div className="flex gap-3">
                    {SOCIALS.map((s) => (
                      <Link
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${s.color} text-white text-xs font-body font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                      >
                        {s.icon}
                        <span className="hidden sm:inline">{s.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* ── Right: Contact Form ────────────────────────────────────── */}
            <div className="lg:col-span-3">
              <AnimatedSection variant="slide-left">
                <div className="bg-white rounded-4xl border border-cream-deep shadow-card p-8">
                  <h2 className="font-display text-2xl font-semibold text-espresso-900 mb-1">
                    Send a Message
                  </h2>
                  <p className="text-ink-muted font-body text-sm mb-7">
                    Tell us about your order, event, or any queries.
                  </p>

                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 space-y-4"
                      >
                        <div className="text-5xl">🎉</div>
                        <h3 className="font-display text-xl font-semibold text-espresso-900">
                          Message Sent!
                        </h3>
                        <p className="text-ink-muted font-body text-sm">
                          Thank you for reaching out. We&apos;ll get back to
                          you as soon as possible.
                        </p>
                        <button
                          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                          className="btn-luxury-outline mt-2"
                        >
                          Send Another
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                              Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              onFocus={() => setFocusedField("name")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="Your full name"
                              required
                              className={inputClass("name")}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              onFocus={() => setFocusedField("email")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="you@example.com"
                              required
                              className={inputClass("email")}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                            Phone (optional)
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("phone")}
                            onBlur={() => setFocusedField(null)}
                            placeholder="+91 00000 00000"
                            className={inputClass("phone")}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest block mb-1.5">
                            Message
                          </label>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("message")}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Tell us about your order or query..."
                            rows={5}
                            required
                            className={inputClass("message") + " resize-none"}
                          />
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ scale: submitting ? 1 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={submitting}
                          className="btn-luxury w-full justify-center gap-2 mt-2"
                        >
                          {submitting ? (
                            <>
                              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <FiLoader size={16} />
                              </motion.span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiSend size={16} />
                              Send Message
                            </>
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
