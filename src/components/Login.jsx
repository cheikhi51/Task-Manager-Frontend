import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
function Login({ setAuthToken }) {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("password");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      // 🔐 Store JWT
      localStorage.setItem("jwtToken", data.token);
      setAuthToken(data.token);

      navigate("/UserDashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to manage your projects</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-wrapper">
            <input
              type={inputType}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              required
            />

            <span
              type="button"
              onClick={() =>
                setInputType(inputType === "password" ? "text" : "password")
              }
              className="show-password"
            >
              {inputType === "password" ? <GoEye /> : <GoEyeClosed />}
            </span>
          </div>



          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
