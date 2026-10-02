import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../axiosConfig";
import "./CreateService.css";

export default function CreateService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const CATEGORIES = [
    { value: "AC Service", label: "AC Service", icon: "❄️" },
    { value: "Electrician", label: "Electrician", icon: "⚡" },
    { value: "Plumbing", label: "Plumbing", icon: "🚰" },
    { value: "Cleaning", label: "Cleaning", icon: "🧹" },
    { value: "Carpentry", label: "Carpentry", icon: "🪚" },
    { value: "Painting", label: "Painting", icon: "🎨" },
    { value: "Moving", label: "Moving", icon: "🚚" },
  ];
  const [suggestedPrice, setSuggestedPrice] = useState<{
    predicted_price: number | null;
    min_price: number | null;
    max_price: number | null;
    based_on: number;
    message: string;
  } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const handlePrice = async () => {
    if (!formData.category || !formData.location) {
      setError("Category and location must be filled!");
      return;
    }
    setLoadingPrice(true);
    setError("");
    try {
      const response = await api.post("/api/services/predict-price", {
        category: formData.category,
        location: formData.location,
        title: formData.title || "",
      });
      setSuggestedPrice(response.data);
      if (response.data.predicted_price) {
        setFormData((prev) => ({
          ...prev,
          price: String(response.data.predicted_price),
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to predict price!");
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validasi dengan return
    if (
      !formData.title ||
      !formData.price ||
      !formData.category ||
      !formData.location
    ) {
      setError("All fields are required!");
      return; // ← PENTING!
    }

    setIsLoading(true);
    setError("");

    try {
      // Debug

      const response = await api.post("/api/services/register-service", {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        location: formData.location,
      });

      console.log("Response:", response.data);
      alert("Service created successfully!");
      navigate("/home");
    } catch (err: any) {
      console.log("Error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to create service!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-service-container">
      <div className="create-service-card">
        <h1 className="create-service-title">Create Your New Service</h1>
        {error && <div className="errorbox">{error}</div>}

        <div className="button-group">
          <input
            type="text"
            name="title"
            placeholder="Service Title"
            value={formData.title}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="button-group">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            <option value="">--Select Category</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="button-group">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handlePrice}
            disabled={loadingPrice || !formData.category || !formData.location}
            className="mt-2 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loadingPrice ? "Menghitung..." : "💡 Suggest Price"}
          </button>
        </div>
        {suggestedPrice && suggestedPrice.predicted_price && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4 text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              💰 Saran Harga: Rp{" "}
              {suggestedPrice.predicted_price.toLocaleString()}
            </p>
            <p className="text-blue-700">
              Range wajar: Rp {suggestedPrice.min_price?.toLocaleString()} – Rp{" "}
              {suggestedPrice.max_price?.toLocaleString()}
            </p>
            <p className="text-blue-500 text-xs mt-1">
              {suggestedPrice.message}
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              * Harga saran bersifat rekomendasi. Anda tetap bisa menentukan
              harga sendiri.
            </p>
          </div>
        )}

        {suggestedPrice && !suggestedPrice.predicted_price && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4 text-sm">
            <p className="text-yellow-800">⚠️ {suggestedPrice.message}</p>
          </div>
        )}

        <button
          className="create-service-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Service"}
        </button>
        <button
          className="cancel-button"
          onClick={() => navigate("/home")}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
