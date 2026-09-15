import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import {
  Calendar,
  MapPin,
  User,
  Wrench,
  DollarSign,
  ArrowLeft,
} from "lucide-react";

type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  location: string;
  provider_id: number;
  provider_name: string;
  is_active: number;
};

export default function ServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestDate, setRequestDate] = useState("");
  const [error, setError] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  const [clientAddress, setClientAddress] = useState("");

  const fetchService = async () => {
    try {
      const response = await api.get(`/api/services/${id}`);
      setService(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to load service data");
      console.error("Failed to fetch the service data !", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  const handleOrder = async () => {
    if (!requestDate || !clientAddress) {
      setError(
        "Please select a date AND make the Address for your service request!",
      );
      return;
    }
    setOrderLoading(true);
    setError("");
    try {
      const response = await api.post("/api/orders/make-order", {
        service_id: Number(service?.id),
        provider_id: service?.provider_id,
        requested_date: requestDate,
        client_address: clientAddress,
      });
      const orderId = response.data.id;
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to place the order. Please try again.",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Service Request Not Completed
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The service you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-100 to-blue-200 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 space-y-6 border border-white/30">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  {service.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {service.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-purple-600 font-medium mt-1">
                {service.category}
              </p>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <span className="text-xl font-bold text-purple-700">
                  Rp {service.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-500" />
                <span>{service.location || "Online"}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-500" />
                <span>Provider: {service.provider_name}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Service ID:</span> #{service.id}
              </p>
            </div>
          </div>

          {/* Booking Card */}
          {/* {isClient && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 h-fit space-y-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Book This Service
              </h3>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white/80"
                  value={requestDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setRequestDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleOrder}
                disabled={orderLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {orderLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Take Order"
                )}
              </button>
            </div>
          )} */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Address *
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white/80"
              rows={2}
              placeholder="Enter your full address (street, building, etc.)"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              required
            />
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 h-fit space-y-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Book This Service
            </h3>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white/80"
                value={requestDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRequestDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleOrder}
              disabled={orderLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {orderLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Take Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
