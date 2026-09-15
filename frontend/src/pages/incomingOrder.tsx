import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { ShoppingBag, Clock, User, DollarSign, MapPin } from "lucide-react";

type Order = {
  id: number;
  service_title: string;
  client_name: string;
  client_address: string;
  status: string;
  payment_status: string;
  requested_date: string;
  price: number;
};

export default function IncomingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "provider") {
        navigate("/home");
        return;
      }
    } catch {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/orders/provider/orders");
      setOrders(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to load incoming orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          📦 Incoming Orders
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              No incoming orders
            </h2>
            <p className="text-gray-500 mt-2">
              Orders from clients will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {order.service_title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "accepted"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    <span>{order.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      Rp {order.price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{order.requested_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Payment:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">
                      {order.client_address || "Not provided"}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="mt-4 block w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="block mt-[14px] mx-auto mb-0 py-2 px-6 bg-purple-600 text-white rounded-lg transition-colors duration-1000 cursor-pointer hover:bg-black hover:text-white"
        onClick={() => navigate("/home")}
      >
        Back To Home
      </button>
    </div>
  );
}
