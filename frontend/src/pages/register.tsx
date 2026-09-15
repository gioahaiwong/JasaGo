import { useState } from "react";
import api from "../axiosConfig";
import { Link } from "react-router-dom";
import "./register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("All Fields REQUIRED");
      return;
    }
    setisLoading(true);
    setError("");
    try {
      await api.post("/api/users/register", {
        name,
        email,
        password,
        role,
      });
      await api.post("/api/users/login", {
        email,
        password,
      });

      // 3. Ambil user info dari /me
      const meResponse = await api.get("/api/users/me");
      const user = meResponse.data;

      // 4. Simpan user info di localStorage (hanya untuk display, BUKAN token)
      localStorage.setItem("user", JSON.stringify(user));

      window.location.replace("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Token Failed!");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">REGISTER AND JOIN US !</h1>
        {error && <div className="errorbox">{error}</div>}
        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="role-button-group">
          <button
            type="button"
            className={`role-btn ${role === "client" ? "client-active" : ""}`}
            onClick={() => setRole("client")}
          >
            As Client
          </button>
          <button
            type="button"
            className={`role-btn ${role === "provider" ? "provider-active" : ""}`}
            onClick={() => setRole("provider")}
          >
            As Provider
          </button>
        </div>
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="register-button"
        >
          {isLoading ? "Registering......" : "Register"}
        </button>
        <p className="login-link">
          Already Have Account ? <Link to="/login">Just Login!</Link>
        </p>
      </div>
    </div>
  );
}
