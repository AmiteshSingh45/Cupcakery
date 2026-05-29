'use client';

import { motion } from 'framer-motion';
import ProductCardInChat from './ProductCardInChat';
import { useState } from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.type === 'user';

  const messageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const bubbleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
    >
      <motion.div
        variants={bubbleVariants}
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Timestamp */}
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-pink-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp?.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </motion.div>

      {/* Product Cards */}
      {message.products && message.products.length > 0 && !isUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 space-y-2 w-full"
        >
          {message.products.map((product) => (
            <ProductCardInChat key={product._id} product={product} />
          ))}
        </motion.div>
      )}

      {/* Quick Reply Suggestions */}
      {message.suggestions && message.suggestions.length > 0 && !isUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 space-y-2 w-full"
        >
          {message.suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className="block w-full text-left px-3 py-2 bg-pink-50 border border-pink-200 rounded-lg text-sm text-pink-700 hover:bg-pink-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
