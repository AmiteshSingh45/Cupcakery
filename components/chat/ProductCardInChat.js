'use client';

import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ProductCardInChat({ product }) {
  const [showPreview, setShowPreview] = useState(false);

  const cardVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    whileHover: { scale: 1.02, boxShadow: '0 10px 30px rgba(236, 72, 153, 0.15)' },
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      // Add to cart logic
      toast.success(`${product.name} added to cart! 🍰`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const ratingPercentage = (product.rating / 5) * 100;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-pink-300 transition-all"
    >
      {/* Product Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden group cursor-pointer">
        <img
          src={product.image || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
          ₹{product.price}
        </div>
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Product Name */}
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
          {product.name}
        </h4>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className="w-3 h-3"
                fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                color={i < Math.round(product.rating) ? '#f97316' : '#d1d5db'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {product.rating.toFixed(1)} ({product.reviews || 0})
          </span>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1"
          >
            <FiShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 border-2 border-pink-500 text-pink-500 py-2 rounded-lg font-semibold text-sm hover:bg-pink-50 transition-all flex items-center justify-center gap-1"
          >
            <FiEye className="w-4 h-4" />
            Preview
          </Link>
        </div>

        {/* Why This Pick */}
        {product.whyPick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-2 bg-pink-50 rounded-lg border border-pink-100"
          >
            <p className="text-xs text-gray-700">
              <span className="font-semibold">💡 Why this pick: </span>
              {product.whyPick}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
