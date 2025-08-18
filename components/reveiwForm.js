"use client";
import { useState } from "react";
import { FaStar } from "react-icons/fa";

const ReviewForm = () => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const user_id = localStorage.getItem("user_id");
    const user_name = localStorage.getItem("user_name");

    if (!user_id || user_id.length !== 24) {
      setMessage("Invalid user ID. Please log in.");
      return;
    }

    const reviewData = {
      review_text: reviewText,
      rating: Number(rating),
      user_id,
      user_name,
    };

    console.log("Submitting Review Data:", reviewData);

    try {
      const response = await fetch("https://cupcakery-backend.onrender.com/api/v1/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (response.ok) {
        setMessage("Review submitted successfully!");
        setReviewText("");
        setRating(0);
      } else {
        setMessage(data.error || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-pink-100 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-gray-800 text-xl font-semibold mb-4 text-center">Leave a Review</h2>

      <textarea
        className="w-full p-3 border border-gray-300 bg-white text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder="Write your review..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        required
      ></textarea>

      {/* ⭐ Star Rating System */}
      <div className="flex justify-center mt-3 mb-4">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <FaStar
              key={index}
              className={`cursor-pointer transition-colors duration-200 ${
                starValue <= (hover || rating) ? "text-yellow-500" : "text-gray-400"
              }`}
              size={28}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(starValue)}
            />
          );
        })}
      </div>

      <button
        type="submit"
        className="bg-pink-500 text-white p-3 rounded w-full hover:bg-pink-400 transition"
      >
        Submit Review
      </button>

      {message && <p className="mt-3 text-center text-green-600 font-medium">{message}</p>}
    </form>
  );
};

export default ReviewForm;
