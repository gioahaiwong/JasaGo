import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { ArrowLeft, Save, Trash2, X } from "lucide-react";

type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  location: string;
  provider_id: number;
  provider_name: string;
};
type formData = {
  title: string;
  category: string;
  price: number;
  location: string;
};

const CATEGORIES = [
  { value: "AC Service", label: "❄️ AC Service" },
  { value: "Electrician", label: "⚡ Electrician" },
  { value: "Plumbing", label: "🚰 Plumbing" },
  { value: "Cleaning", label: "🧹 Cleaning" },
  { value: "Carpentry", label: "🪚 Carpentry" },
  { value: "Painting", label: "🎨 Painting" },
  { value: "Moving", label: "🚚 Moving" },
];

export default function EditService() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submit, setSubmit] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formdata, setFormData] = useState<formData>({
    title: "",
    category: "",
    price: 0,
    location: "",
  });

  const fetchService = async () => {
    try {
      const response = await api.get(`/api/services/${id}`);
      setService(response.data);
      setFormData({
        title: response.data.title || "",
        category: response.data.category || "",
        price: response.data.price || 0,
        location: response.data.location || "",
      });
    } catch (error) {
      setError("Failed to load service data");
      console.error("Failed to fetch the service data !", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formdata.title ||
      !formdata.category ||
      !formdata.price ||
      !formdata.location
    ) {
      setError("All fields are required!");
      return;
    }

    if (formdata.price <= 0) {
      setError("Price must be greater than 0!");
      return;
    }

    setSubmit(true);
    setError("");

    try {
      await api.put(`/api/services/${id}`, {
        title: formdata.title,
        category: formdata.category,
        price: Number(formdata.price),
        location: formdata.location,
      });
      alert("Service updated successfully!");
      navigate("/my-services");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update service");
      console.error("Error in Submit Data!", err);
    } finally {
      setSubmit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    try {
      await api.delete(`/api/services/${id}`);
      alert("Service deleted successfully!");
      navigate("/my-services");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete service!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Service not found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The service doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/my-services")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-services")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Services
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit Service
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formdata.title}
                onChange={handleChange}
                disabled={submit}
                placeholder="Service title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formdata.price}
                onChange={handleChange}
                disabled={submit}
                placeholder="Price"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formdata.location}
                onChange={handleChange}
                disabled={submit}
                placeholder="Location (e.g., Jakarta, Online)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formdata.category}
                onChange={handleChange}
                disabled={submit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100 bg-white"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition disabled:opacity-50"
                disabled={submit}
              >
                <Save className="w-5 h-5" />
                {submit ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-services")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition"
                disabled={submit}
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>

          {/* Delete Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              type="button"
              disabled={submit}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              Delete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
