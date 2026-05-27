"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiLoader } from "react-icons/fi";
import { BACKEND } from "@/lib/api";

const ReviewForm = () => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const user_id = localStorage.getItem("user_id");
    const user_name = localStorage.getItem("user_name");

    if (!user_id || user_id.length !== 24) {
      setMessage("Please log in to leave a review.");
      setIsSuccess(false);
      setIsSubmitting(false);
      return;
    }

    const reviewData = {
      review_text: reviewText,
      rating: Number(rating),
      user_id,
      user_name,
    };

    try {
      const response = await fetch(
        `${BACKEND}/api/v1/reviews/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Review submitted! It'll appear after approval. Thank you 🎉");
        setReviewText("");
        setRating(0);
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-cream-deep shadow-card p-6 space-y-5"
    >
      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest">
          Your Rating
        </label>
        <div className="flex gap-2">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const filled = starValue <= (hover || rating);
            return (
              <motion.button
                key={index}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={filled ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(starValue)}
                className="focus:outline-none"
                aria-label={`Rate ${starValue} stars`}
              >
                <FaStar
                  size={30}
                  className={`transition-colors duration-200 ${
                    filled ? "text-gold" : "text-cream-deep"
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-ink-muted font-body"
          >
            {["", "Poor 😞", "Fair 😐", "Good 🙂", "Great 😊", "Amazing! 🤩"][rating]}
          </motion.p>
        )}
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-body font-semibold text-ink-muted uppercase tracking-widest">
          Your Review
        </label>
        <div className={`relative rounded-2xl border transition-all duration-300 ${
          focused ? "border-gold ring-2 ring-gold/20" : "border-cream-deep"
        }`}>
          <textarea
            className="w-full px-4 py-3.5 rounded-2xl bg-transparent text-espresso-900 font-body text-sm resize-none focus:outline-none placeholder-ink-muted/50"
            placeholder="Tell us about your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={4}
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || rating === 0}
        className="btn-luxury w-full justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <FiLoader size={16} />
            </motion.span>
            Submitting...
          </>
        ) : (
          <>
            <FiSend size={16} />
            Submit Review
          </>
        )}
      </motion.button>

      {/* Feedback message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl px-4 py-3 text-sm font-body text-center ${
              isSuccess
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blush-light text-blush-rose border border-blush"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default ReviewForm;
