'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const OPTIONS = [
  { label: '🍰 Recommend Desserts', flow: 'recommend', icon: '🍰' },
  { label: '🎂 Birthday Planning', flow: 'birthday', icon: '🎂', initialState: { step: 1 } },
  { label: '💝 Gift Suggestions', flow: 'gifts', icon: '💝' },
  { label: '🍫 Comfort Desserts', flow: 'comfort', icon: '🍫' },
  { label: '🎉 Party Planning', flow: 'party', icon: '🎉', initialState: { step: 1, guestCount: 0 } },
  { label: '✨ Cake Design', flow: 'design', icon: '✨' },
  { label: '🔍 Search Products', flow: 'search', icon: '🔍' },
  { label: '⭐ Best Sellers', flow: 'bestsellers', icon: '⭐' },
  { label: '🔥 Trending Desserts', flow: 'trending', icon: '🔥' },
];

export default function FirstScreen({ onOptionSelect }) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    whileHover: {
      scale: 1.05,
      y: -5,
      boxShadow: '0 10px 30px rgba(236, 72, 153, 0.2)',
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100"
      >
        <p className="text-gray-800 font-semibold text-sm">
          🍰 What can I help you with today?
        </p>
        <p className="text-gray-600 text-xs mt-1">
          I'm here to guide you to the perfect dessert!
        </p>
      </motion.div>

      {/* Option Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option, idx) => (
          <motion.button
            key={idx}
            variants={itemVariants}
            whileHover="whileHover"
            onClick={() => onOptionSelect(option)}
            className="p-3 rounded-xl bg-white border-2 border-gray-100 hover:border-pink-300 transition-all text-left group cursor-pointer"
          >
            <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
              {option.label}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Bottom Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-gray-500 mt-4 px-2"
      >
        Or just describe what you're looking for! 💬
      </motion.p>
    </motion.div>
  );
}
