"use client";
import { useEffect, useState } from "react";
import AdminMenu from "../../../../components/Adminmenu";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://cupcakery-backend.onrender.com/api/v1/reviews/admin/reviews")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        return res.json();
      })
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      const response = await fetch(
        `https://cupcakery-backend.onrender.com/api/v1/reviews/admin/reviews/approve/${reviewId}`,
        { method: "PUT" }
      );
      if (response.ok) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId ? { ...review, status: "approved" } : review
          )
        );
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleFeature = async (reviewId) => {
    try {
      const response = await fetch(
        `https://cupcakery-backend.onrender.com/api/v1/reviews/admin/reviews/feature/${reviewId}`,
        { method: "PUT" }
      );
      if (response.ok) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId ? { ...review, is_featured: true } : review
          )
        );
      }
    } catch (error) {
      console.error("Error featuring review:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-md p-6">
        <AdminMenu />
      </aside>

      {/* Main Content */}
      <div className="w-3/4 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin - Manage Reviews</h2>

        {loading ? (
          <p className="text-gray-600">Loading reviews...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white p-5 rounded-lg shadow-md border border-gray-200 transition duration-300 hover:shadow-lg"
              >
                <p className="font-semibold text-lg text-gray-900">
                  {review.user_name || "Anonymous"}
                </p>
                <p className="text-gray-700 mt-1">{review.review_text}</p>
                <p className="text-gray-800 font-medium mt-2">⭐ {review.rating} / 5</p>
                <p
                  className={`text-sm font-medium mt-1 ${
                    review.status === "approved" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  Status: {review.status}
                </p>

                <div className="mt-4 flex gap-3">
                  {review.status === "pending" && (
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition shadow-md"
                      onClick={() => handleApprove(review._id)}
                    >
                      Approve
                    </button>
                  )}
                  {!review.is_featured && review.status === "approved" && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition shadow-md"
                      onClick={() => handleFeature(review._id)}
                    >
                      Feature
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
