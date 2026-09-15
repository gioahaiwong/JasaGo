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
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
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
