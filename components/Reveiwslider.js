"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { BACKEND } from "@/lib/api";

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) =>
        i < rating ? (
          <FaStar key={i} size={13} className="text-gold" />
        ) : (
          <FaRegStar key={i} size={13} className="text-cream-deep" />
        )
      )}
    </div>
  );
}

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/api/v1/reviews/approved`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-40 flex-1 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-12">
        <FiMessageCircle size={40} className="mx-auto text-cream-deep mb-3" />
        <p className="text-ink-muted font-body text-sm">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      breakpoints={{
        640:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      loop={reviews.length >= 3}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000, pauseOnMouseEnter: true }}
      className="pb-12"
    >
      {reviews.map((review, index) => {
        const initials = (review.user_id?.name || review.user_name || "A")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <SwiperSlide key={`${review._id}-${index}`}>
            <div className="glass-card p-6 h-full flex flex-col gap-4 border border-cream-deep hover:shadow-card-hover hover:-translate-y-1 transition-all duration-400">
              {/* Quote mark */}
              <span className="font-display text-5xl text-gold/30 leading-none -mb-2 select-none">
                &ldquo;
              </span>

              {/* Review text */}
              <p className="text-ink font-body text-sm leading-relaxed flex-1 italic">
                {review.review_text}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-cream-deep/60">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-espresso-700 text-sm font-body font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-espresso-900 font-body font-semibold text-sm leading-none">
                      {review.user_id?.name || review.user_name || "Anonymous"}
                    </p>
                    <p className="text-ink-muted text-[10px] font-body mt-0.5 uppercase tracking-wider">
                      Verified Customer
                    </p>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default ReviewSlider;
