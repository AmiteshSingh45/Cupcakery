'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import ChatPanel from './ChatPanel';

export default function BindiChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const buttonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.4 } },
    hover: { scale: 1.1, boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' },
    tap: { scale: 0.95 }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 2, repeat: Infinity, repeatType: 'loop' }
    }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        className="fixed bottom-8 right-8 z-40"
      >
        {/* Pulse Background */}
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-40 blur-lg pointer-events-none"
          style={{ width: '70px', height: '70px', left: '-5px', top: '-5px' }}
        />

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 group"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMessageCircle className="w-6 h-6" />
            )}
          </motion.div>

          {/* Premium Border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            whileHover="visible"
            className="absolute bottom-20 right-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
          >
            Need dessert help? 🍰
            <div className="absolute bottom-0 right-4 w-2 h-2 bg-gray-900 rotate-45 transform translate-y-1" />
          </motion.div>
        )}
      </motion.div>

      {/* Chat Panel */}
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
