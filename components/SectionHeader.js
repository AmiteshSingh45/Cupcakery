"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * SectionHeader — reusable premium section heading
 * Props:
 *   label     {string}  — small ALL-CAPS label above title
 *   title     {node}    — main heading (can include JSX for gradient spans)
 *   subtitle  {string}  — optional paragraph below title
 *   center    {boolean} — center-align (default: true)
 *   light     {boolean} — cream text variant for dark backgrounds
 *   className {string}  — wrapper class overrides
 */
export default function SectionHeader({
  label,
  title,
  subtitle,
  center = true,
  light = false,
  className = "",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const textAlign = center ? "text-center" : "text-left";
  const subtitleAlign = center ? "mx-auto" : "";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`${textAlign} ${className}`}
    >
      {label && (
        <span
          className={`inline-block text-xs font-body font-semibold tracking-[0.22em] uppercase mb-3 ${
            light ? "text-gold-light" : "text-gold"
          }`}
        >
          {label}
        </span>
      )}

      {title && (
        <h2
          className={`font-display text-section font-semibold leading-tight ${
            light ? "text-cream" : "text-espresso-900"
          }`}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={`font-body text-base sm:text-lg leading-relaxed mt-3 max-w-2xl ${subtitleAlign} ${
            light ? "text-cream/60" : "text-ink-muted"
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className={`mt-4 h-0.5 w-12 bg-gradient-to-r from-gold to-gold-light rounded-full origin-left ${
          center ? "mx-auto" : ""
        }`}
      />
    </motion.div>
  );
}
