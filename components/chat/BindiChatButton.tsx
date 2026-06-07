"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, CupSoda, X } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

const STORAGE_KEY = "bindi-chat-open";

export default function BindiChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOpen(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggleOpen = () => {
    setIsOpen((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const close = () => {
    setIsOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "false");
  };

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>{isOpen && <ChatPanel onClose={close} />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6"
      >
        <Tooltip content={isOpen ? "Close bakery assistant" : "Open bakery assistant"}>
          <motion.button
            type="button"
            aria-label={isOpen ? "Close Bindi bakery assistant" : "Open Bindi bakery assistant"}
            onClick={toggleOpen}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="group relative grid h-14 w-14 place-items-center rounded-full bg-espresso-900 text-cream shadow-luxury ring-1 ring-gold/30 sm:h-16 sm:w-16"
          >
            <span className="absolute inset-1 rounded-full border border-cream/15" />
            <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-blush-rose text-white shadow-card">
              <CupSoda className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.92 : 1 }}
              transition={{ duration: 0.22 }}
              className="relative z-10"
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.span>
            {!isOpen && (
              <span className="absolute inset-0 -z-10 rounded-full bg-blush-rose/25 motion-safe:animate-ping" />
            )}
          </motion.button>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}
