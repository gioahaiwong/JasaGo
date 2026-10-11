import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "./Navbar";
import {
  Calendar,
  User,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
} from "lucide-react";

const STATUS = {
  pending: {
    class: "bg-yellow-100 text-yellow-800",
    text: "Pending",
    icon: "⏳",
  },
  accepted: {
    class: "bg-blue-100 text-blue-800",
    text: "Accepted",
    icon: "✅",
  },
  completed: {
    class: "bg-green-100 text-green-800",
    text: "Completed",
    icon: "👌",
  },
  cancelled: {
    class: "bg-red-100 text-red-800",
    text: "Cancelled",
    icon: "❌",
  },
};

type Order = {
  id: number;
  service_id: number;
  service_title: string;
  provider_id: number;
  provider_name: string;
  client_id: number;
  client_name: string;
  client_address: string;
  status: keyof typeof STATUS;
  payment_status: "paid" | "unpaid" | "pending";
  requested_date: string;
  created_at: string;
  price: number;
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
      setUserId(user.id);
    } catch {
      navigate("/login");
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!window.confirm(`Mark this order as ${newStatus}?`)) return;
    setUpdating(true);
    try {
      await api.put(`/api/orders/${id}/status`, { status: newStatus });
      alert(`Order ${newStatus}!`);
      fetchOrder(); // refresh
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setUpdating(true);
    try {
      await api.put(`/api/orders/${id}/cancel`, {});
      alert("Order cancelled!");
      fetchOrder();
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

  const isProvider = userRole === "provider" && userId === order?.provider_id;
  const isClient = userRole === "client" && userId === order?.client_id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The order you're looking for doesn't exist."}
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

  const status = STATUS[order.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-200 to-blue-100 ">
      <Navbar />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          {isClient && (
            <button
              onClick={() => navigate("/my-orders")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          )}
          {isProvider && (
            <button
              onClick={() => navigate("/incoming-orders")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Order List
            </button>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Card */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  Order #{order.id}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.class}`}
                >
                  {status.icon} {status.text}
                </span>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">{order.service_title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-purple-700">
                    Rp {order.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span>{order.requested_date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">
                    Ordered on {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>
                    <span className="font-medium">Client:</span>{" "}
                    {order.client_name || `User #${order.client_id}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-400" />
                  <span>
                    <span className="font-medium">Provider:</span>{" "}
                    {order.provider_name || `User #${order.provider_id}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-black" />
                  <span>
                    <span className="font-medium">Address:</span>{" "}
                    {order.client_address || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Status:
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.payment_status === "paid" ? "✅ Paid" : "⏳ Unpaid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit space-y-4 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Actions
              </h3>

              {isProvider && order.status === "pending" && (
                <div className="space-y-2">
                  <button
                    onClick={() => updateStatus("accepted")}
                    disabled={updating}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Order
                  </button>
                  <button
                    onClick={() => updateStatus("cancelled")}
                    disabled={updating}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject Order
                  </button>
                </div>
              )}

              {isProvider && order.status === "accepted" && (
                <button
                  onClick={() => updateStatus("completed")}
                  disabled={updating}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Complete Order
                </button>
              )}

              {isClient && order.status === "pending" && (
                <button
                  onClick={cancelOrder}
                  disabled={updating}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Cancel Order
                </button>
              )}

              {isClient &&
                order.status === "completed" &&
                order.payment_status !== "paid" && (
                  <button
                    onClick={() => navigate(`/payment/${order.id}`)}
                    className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                  >
                    💳 Make Payment
                  </button>
                )}

              {isClient && order.payment_status === "paid" && (
                <button
                  onClick={() => navigate(`/create-review/${order.id}`)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                >
                  ⭐ Write Review
                </button>
              )}

              {!isProvider && !isClient && (
                <p className="text-sm text-gray-500 text-center">
                  You are not authorized to perform actions.
                </p>
              )}

              {updating && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
