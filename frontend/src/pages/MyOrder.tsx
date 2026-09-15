import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axiosConfig";
import { ShoppingBag, Clock, User, DollarSign, Calendar } from "lucide-react";

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
  provider_id: number;
  service_id: number;
  client_id: number;
  status: keyof typeof STATUS;
  payment_status: "paid" | "unpaid" | "pending";
  requested_date: string;
  created_at: string;
  price: number;
  service_title?: string;
  provider_name?: string;
};

export default function MyOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState("all");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const ambil = await api.get("/api/orders/client/orders");
      setOrders(ambil.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("There is a problem in fetching the orders.....");
      console.error("Error in fetching order data!", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (active === "all") return true;
    return order.status === active;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 text-sm">
              Track all your service requests
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            ← Back to Home
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-2 mb-6 flex flex-wrap gap-1 border border-white/30">
          {["all", "pending", "accepted", "completed", "cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  active === tab
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {tab === "all" ? "All" : tab}
              </button>
            ),
          )}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              No orders found
            </h2>
            <p className="text-gray-500 mt-2">
              {active === "all"
                ? "You haven't placed any orders yet."
                : `No ${active} orders.`}
            </p>
            <Link
              to="/services"
              className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
            >
              Browse Services →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const status = STATUS[order.status];
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 hover:border-purple-200"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      #{order.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}
                    >
                      {status.icon} {status.text}
                    </span>
                  </div>

                  {/* Body */}
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {order.service_title || `Service #${order.service_id}`}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500" />
                      <span>
                        {order.provider_name ||
                          `Provider #${order.provider_id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{order.requested_date || "Date not set"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-purple-700">
                        Rp {order.price?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/orders/${order.id}`}
                      className="block w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
