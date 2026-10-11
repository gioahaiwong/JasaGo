import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { Wrench, PlusCircle, Edit, Trash2 } from "lucide-react";
import Navbar from "./Navbar";

type Service = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  is_active: number;
  created_at: string;
};

export default function MyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
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
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/services/my-services");
      setServices(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to load your services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      await api.delete(`/api/services/${id}`);
      setServices(services.filter((s) => s.id !== id));
      alert("Service deleted!");
    } catch (err) {
      alert("Failed to delete service");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading your services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ">
      <Navbar />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-9">
            <h1 className="text-3xl font-bold text-gray-800">My Services</h1>
            <div className="flex items-center gap-3">
              <Link
                to="/create-service"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
              >
                <PlusCircle className="w-5 h-5" />
                Add Service
              </Link>
              <button
                className="py-3 px-6 bg-purple-600 text-white hover:bg-purple-800  font-medium rounded-lg transition"
                onClick={() => navigate("/home")}
              >
                Back to Home
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
              {error}
            </div>
          )}

          {services.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">
                No services yet
              </h2>
              <p className="text-gray-500 mt-2">
                Start offering your services by adding one.
              </p>
              <Link
                to="/create-service"
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
              >
                Add Your First Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {service.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        service.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    {service.category}
                  </p>
                  <p className="text-lg font-bold text-purple-700 mt-2">
                    Rp {service.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {service.location || "Online"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/edit-service/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
