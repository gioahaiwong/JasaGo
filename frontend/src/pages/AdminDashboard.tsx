import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  DollarSign,
  Wrench,
  Clock,
} from "lucide-react";

type Payment = {
  id: number;
  order_id: number;
  amount: number;
  status: string;
  proof_url: string;
  notes: string;
  created_at: string;
};

type Order = {
  id: number;
  service_title: string;
  client_name: string;
  provider_name: string;
  status: string;
  payment_status: string;
  requested_date: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "payments" | "orders" | "users"
  >("dashboard");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        alert("Admin access only!");
        navigate("/home");
        return;
      }
      fetchDashboardData();
    } catch {
      navigate("/login");
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        api.get("/api/payments/pending"),
        api.get("/api/admin/stats"),
      ]);
      setPendingPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/orders/admin/orders");
      setRecentOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/users/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeMenu === "payments") {
      fetchDashboardData();
    } else if (activeMenu === "orders") {
      fetchRecentOrders();
    } else if (activeMenu === "users") {
      fetchUsers();
    } else {
      fetchDashboardData();
    }
  };

  const verifyPayment = async (paymentId: number) => {
    if (!window.confirm("Verify this payment?")) return;
    try {
      await api.put(`/api/payments/verify/${paymentId}`, {});
      alert("Payment verified!");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to verify");
    }
  };

  const rejectPayment = async (paymentId: number) => {
    if (!window.confirm("Reject this payment?")) return;
    try {
      await api.put(`/api/payments/reject/${paymentId}`, {});
      alert("Payment rejected!");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    window.location.replace("/login");
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "blue",
    },
    {
      label: "Total Services",
      value: stats.totalServices,
      icon: Wrench,
      color: "green",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "yellow",
    },
    {
      label: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-50 border-r border-gray-200">
        <div className="px-6 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            JasaGo Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dashboard & Control Panel
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button
            onClick={() => {
              setActiveMenu("dashboard");
              fetchDashboardData();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "dashboard"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => {
              setActiveMenu("payments");
              fetchDashboardData();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "payments"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Payments</span>
            {pendingPayments.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingPayments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveMenu("orders");
              fetchRecentOrders();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "orders"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </button>
          <button
            onClick={() => {
              setActiveMenu("users");
              fetchUsers();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "users"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {activeMenu === "dashboard" && "Dashboard"}
              {activeMenu === "payments" && "Payments"}
              {activeMenu === "orders" && "Orders"}
              {activeMenu === "users" && "Users"}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeMenu === "dashboard" && "Overview of your marketplace"}
              {activeMenu === "payments" &&
                "Manage pending payment verifications"}
              {activeMenu === "orders" && "Recent customer orders"}
              {activeMenu === "users" && "All registered users"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Dashboard View */}
        {activeMenu === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border-l-4"
                  style={{
                    borderLeftColor: `var(--tw-border-${stat.color}-500)`,
                  }}
                >
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-${stat.color}-100 text-${stat.color}-700 flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Pending Payments
                </h3>
                {pendingPayments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending payments.</p>
                ) : (
                  <ul className="space-y-3">
                    {pendingPayments.slice(0, 5).map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <span className="text-sm">
                          #{p.id} – Rp {p.amount.toLocaleString()}
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                  Recent Orders
                </h3>
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {recentOrders.slice(0, 5).map((o) => (
                      <li
                        key={o.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <span className="text-sm">
                          #{o.id} – {o.service_title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            o.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {/* Payments View */}
        {activeMenu === "payments" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No pending payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          #{payment.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          Order #{payment.order_id}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Amount:{" "}
                        <span className="font-medium">
                          Rp {payment.amount.toLocaleString()}
                        </span>
                      </p>
                      {payment.proof_url && (
                        <a
                          href={payment.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View Proof
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => verifyPayment(payment.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Verify
                      </button>
                      <button
                        onClick={() => rejectPayment(payment.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders View */}
        {activeMenu === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-gray-600">ID</th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Service
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">Client</th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Provider
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium text-gray-800">
                        #{order.id}
                      </td>
                      <td className="py-3 text-gray-700">
                        {order.service_title}
                      </td>
                      <td className="py-3 text-gray-700">
                        {order.client_name}
                      </td>
                      <td className="py-3 text-gray-700">
                        {order.provider_name}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "accepted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users View */}
        {activeMenu === "users" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-gray-600">ID</th>
                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                    <th className="pb-3 font-semibold text-gray-600">Email</th>
                    <th className="pb-3 font-semibold text-gray-600">Role</th>
                    <th className="pb-3 font-semibold text-gray-600">
                      Registered
                    </th>
                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium text-gray-800">
                        #{user.id}
                      </td>
                      <td className="py-3 text-gray-700">{user.name}</td>
                      <td className="py-3 text-gray-700">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "provider"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
