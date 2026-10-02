import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig";
import { ArrowLeft, Star, Loader2 } from "lucide-react";

type Order = {
  id: number;
  service_title: string;
  provider_name: string;
  status: string;
};

export default function CreateReview() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [submit, setSubmit] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("Invalid order ID.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      const orderData = response.data;
      if (orderData.status !== "completed") {
        setError("You can only review completed orders.");
      }
      setOrder(orderData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert("Please write a review comment");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmit(true);
    try {
      await api.post("/api/review/make-review", {
        orders_id: Number(orderId),
        rating: rating,
        comment: comment,
      });
      alert("Review submitted successfully!");
      navigate("/my-orders");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/my-orders")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The order you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/my-orders")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-100 to-blue-200 py-8 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/30">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-2 -ml-2 text-gray-600 hover:text-purple-600 transition rounded-full hover:bg-purple-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Write a Review</h1>
        </div>

        {/* Order Info */}
        <div className="bg-purple-50/70 rounded-xl p-4 mb-6 space-y-1 text-sm border border-purple-100/50">
          <p className="text-gray-700">
            <span className="font-medium">Service:</span> {order.service_title}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Provider:</span> {order.provider_name}
          </p>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl transition-all duration-200 ${
                  star <= rating
                    ? "text-yellow-400 scale-110"
                    : "text-gray-300 hover:text-yellow-200 hover:scale-105"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="text-xs text-gray-400 mt-1">Tap a star to rate</p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Comment *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this service..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white/80 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={submit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-md"
          >
            {submit ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Star className="w-5 h-5 fill-current" />
                Submit Review
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition"
            disabled={submit}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
