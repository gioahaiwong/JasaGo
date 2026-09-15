import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../axiosConfig";
import "./login.css";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setError("Email and Password Required!");
      return;
    }
    setisLoading(true);
    setError("");
    try {
      const response = await api.post("/api/users/login", { email, password });
      console.log("Successfully Login : ", response.data);
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Password or Email Incorrect!");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">LOGIN</h1>
        {error && <div className="errorbox">{error}</div>}
        <input
          className="isi-placeholder"
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="isi-placeholder"
          type="password"
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && login()}
        />
        <button className="login-button" onClick={login}>
          {isLoading ? "Loading...." : "Login"}
        </button>
        <p>
          Don't Have Account Yet ? <Link to="/register">Register Now!</Link>
        </p>
        <Link
          to="/password-reset"
          className="text-sm text-purple-600 hover:underline block mt-2"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
