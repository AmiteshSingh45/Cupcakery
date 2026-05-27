"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiX, FiExternalLink } from "react-icons/fi";

const whatsappNumber = "918340497237";
const message = "Hello, I want to place an order!";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(whatsappLink)}&size=160&margin=1`;

const WhatsAppQR = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Popup Card ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="bg-white/95 backdrop-blur-xl border border-cream-deep rounded-3xl shadow-luxury p-5 w-52"
            style={{ transformOrigin: "bottom right" }}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-espresso-900/6 flex items-center justify-center text-ink-muted hover:bg-espresso-900/12 transition-all"
            >
              <FiX size={13} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <FaWhatsapp size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-body font-semibold text-espresso-900 leading-none">
                  Order via WhatsApp
                </p>
                <p className="text-[10px] text-ink-muted font-body mt-0.5">Scan QR or tap link</p>
              </div>
            </div>

            {/* QR Code */}
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <div className="rounded-2xl overflow-hidden border border-cream-deep bg-cream p-1 hover:border-green-400 transition-colors">
                <Image
                  src={qrCodeUrl}
                  alt="WhatsApp QR Code"
                  width={160}
                  height={160}
                  className="w-full rounded-xl"
                  unoptimized
                />
              </div>
            </Link>

            {/* Direct link */}
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-body font-semibold transition-colors"
            >
              <FiExternalLink size={12} />
              Open in WhatsApp
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Float Button ─────────────────────────────────────────────────── */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="wa-pulse w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-luxury transition-colors"
        aria-label="Open WhatsApp"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <FiX size={24} />
            </motion.span>
          ) : (
            <motion.span key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <FaWhatsapp size={26} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default WhatsAppQR;
