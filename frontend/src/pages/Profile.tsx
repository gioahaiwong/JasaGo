import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../axiosConfig";
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/users/me");
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Ambil inisial untuk avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-200 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }} // mulai transparan + agak turun
        animate={{ opacity: 1, y: 0 }} // fade in + geser ke atas
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform  hover:scale-[1.02] duration-300"
      >
        {/* Header dengan gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
          <div className="inline-block bg-white/20 rounded-full p-1 backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-purple-700">
                {getInitials(user.name)}
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">{user.name}</h2>
          <p className="text-purple-100 text-sm capitalize">{user.role}</p>
        </div>

        {/* Informasi Profile */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-800 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="text-gray-800 font-medium">#{user.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Account Status</p>
              <p className="text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="px-6 pb-6 flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-red-700 text-white font-medium transition duration-200 flex items-center justify-center gap-2 shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
