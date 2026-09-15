import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../axiosConfig";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PasswordReset() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // === MODE: Forgot Password (tanpa token) ===
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post("/api/users/forgot-password", { email });
      setMessage(response.data.message);
      // Jika ada token, tampilkan link reset
      if (response.data.resetUrl) {
        setMessage(
          `${response.data.message}\n\nReset link (copy & paste ke browser):\n${response.data.resetUrl}`,
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // === MODE: Reset Password (dengan token) ===
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post(`/api/users/reset-password/${token}`, {
        newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Jika ada token di URL → mode reset password
  const isResetMode = !!token; //!!token artinya mengubah token menjadi boolean, kalau ada token maka true, kalau tidak ada maka false. Jadi kalau ada token di URL, maka mode reset password akan aktif, kalau tidak ada maka mode forgot password akan aktif.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isResetMode ? "Reset Password" : "Forgot Password"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isResetMode
            ? "Enter your new password below."
            : "Enter your email address and we'll send you a reset link."}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <form onSubmit={isResetMode ? handleReset : handleForgot}>
          {!isResetMode ? (
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-4"
            />
          ) : (
            <>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-4"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-4"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isResetMode ? "Reset Password" : "Send Reset Link"}
          </button>
        </form>

        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-purple-600 hover:underline mt-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
