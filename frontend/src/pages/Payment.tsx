import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle,
  Loader2,
} from "lucide-react";

type Order = {
  id: number;
  service_title: string;
  price: number;
  provider_name: string;
  requested_date?: string;
};

export default function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID. Redirecting...");
      setTimeout(() => navigate("/my-orders"), 2000);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;
    setSubmit(true);
    try {
      await api.post("/api/payments/create", {
        order_id: order.id,
        amount: order.price,
        payment_method: "bank_transfer",
      });
      alert("Payment created. Please upload the payment proof!");
      navigate(`/payment-proof/${orderId}`);
    } catch (err: any) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("Payment sudah dibuat")
      ) {
        alert("Payment sudah ada. Silakan upload bukti pembayaran.");
        navigate(`/payment-proof/${orderId}`);
      } else {
        alert(err.response?.data?.message || "Payment failed");
      }
    } finally {
      setSubmit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-4">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-100 to-blue-200 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-orders")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/30">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Payment</h1>
          </div>

          {/* Order Details */}
          <div className="bg-purple-50/50 rounded-xl p-5 mb-6 space-y-3 border border-purple-100/50">
            <div className="flex items-center gap-3 text-gray-700">
              <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>
                <span className="font-medium">Provider:</span>{" "}
                {order.provider_name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Building className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>
                <span className="font-medium">Service:</span>{" "}
                {order.service_title}
              </span>
            </div>
            {order.requested_date && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span>
                  <span className="font-medium">Date:</span>{" "}
                  {order.requested_date}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700 border-t border-purple-100/50 pt-3 mt-1">
              <DollarSign className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-xl font-bold text-purple-700">
                Rp {order.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bank Transfer Instructions */}
          <div className="bg-blue-50/60 rounded-xl p-5 mb-6 border border-blue-100/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Bank Transfer Instructions
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <span className="font-medium">BCA:</span> 1234567890 a.n. JasaGo
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Mandiri:</span> 1415673832 a.n.
                JasaGo
              </p>
              <p className="text-xs text-gray-500 mt-2">
                * Transfer sesuai total harga. Upload bukti transfer setelah
                melakukan pembayaran.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePayment}
              disabled={submit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-md"
            >
              {submit ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Payment
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
    </div>
  );
}
