import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { Star, Calendar, User, Wrench, ArrowLeft, Loader2 } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  client_name: string;
  sentiment?: string;
  sentiment_score?: number;
  service_title: string;
  service_id: number;
  order_id: number;
};

export default function SeeReview() {
  const navigate = useNavigate();
  const [review, setReview] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(" ");
  const [filterService, setFilterService] = useState<number | "all">("all"); // ini artinya untuk menampilkan khusus pada suatu service_id atau menampilkan semua review, pada dasarnya ditampilkan semua sih

  const services = Array.from(new Set(review?.map((r) => r.service_id))).map(
    (id) => ({
      id,
      title:
        review.find((r) => r.service_id === id)?.service_title ||
        `Service ${id}`,
    }),
  );

  const filterReview =
    filterService === "all"
      ? review
      : review.filter((r) => r.service_id === filterService);

  useEffect(() => {
    fetchReview();
  }, []);
  const fetchReview = async () => {
    try {
      const response = await api.get("/api/review/providers/reviews");
      setReview(response.data);
    } catch (err: any) {
      if (err.response?.status == 401) {
        navigate("/home");
        return;
      }
      setError("Error in loading the review!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📝 My Service Reviews
            </h1>
            <p className="text-gray-500 text-sm">
              See what clients say about your services
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Filter */}
        {review.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Filter by Service:
            </span>
            <select
              value={filterService}
              onChange={(e) =>
                setFilterService(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500 ml-auto">
              {filterReview.length} review
              {filterReview.length !== 1 && "s"}
              {/*Ini artinya kalau ada satu review saja, maka tulisannya review, kalau lebih menjadi reviews*/}
            </span>
          </div>
        )}

        {/* Reviews Grid */}
        {filterReview.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              No reviews yet
            </h2>
            <p className="text-gray-500 mt-2">
              {review.length === 0
                ? "You haven't received any reviews from clients."
                : "No reviews match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filterReview.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-800">
                      {review.client_name}
                    </span>
                    {review.sentiment && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          review.sentiment.includes("Positif")
                            ? "bg-green-100 text-green-700"
                            : review.sentiment.includes("Negatif")
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {review.sentiment}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 italic">
                  "{review.comment}"
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    {review.service_title}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Order #{review.order_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
