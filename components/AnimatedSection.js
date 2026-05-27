"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * AnimatedSection — wraps any children with a scroll-triggered
 * Framer Motion entrance animation. Reusable across all pages.
 *
 * @param {string}  variant   - "fade-up" | "fade-in" | "slide-right" | "slide-left" | "scale-in"
 * @param {number}  delay     - stagger delay in seconds (default 0)
 * @param {number}  threshold - how much of element must be visible (0–1, default 0.15)
 * @param {string}  className - additional Tailwind classes
 */

const variants = {
  "fade-up": {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-right": {
    hidden:  { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-left": {
    hidden:  { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-in": {
    hidden:  { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function AnimatedSection({
  children,
  variant = "fade-up",
  delay = 0,
  threshold = 0.15,
  duration = 0.7,
  className = "",
  once = true,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: threshold });

  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[variant] ?? variants["fade-up"]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </MotionTag>
  );
}
