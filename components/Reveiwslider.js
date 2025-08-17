"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/v1/reviews/approved")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched reviews:", data);
        setReviews(data);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-center sechead">Customer Reviews</h2><br />
      
      {reviews.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          className="bg-pink-100 p-6 rounded-lg shadow-md"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={`${review._id}-${index}`} className="text-center text-gray-800">
              <p className="text-lg italic">&quot;{review.review_text}&quot;</p>
              <p className="mt-2 font-semibold">- {review.user_id?.name || "Anonymous"}</p>
              <p className="mt-1 text-yellow-500">⭐ {review.rating} / 5</p>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center text-gray-800">No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewSlider;
