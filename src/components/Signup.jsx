import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";

import api from "../api/axios"; 

function Signup() {
  const navigate = useNavigate();
  const [inputType1, setInputType1] = useState("password");
  const [inputType2, setInputType2] = useState("password");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 🔗 Spring Boot endpoint (adjust URL if needed)
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      navigate("/login");
    } catch (err) {
      setError("Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p className="subtitle">Start managing your projects efficiently</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
                        type={inputType1}
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
                          setInputType1(inputType1 === "password" ? "text" : "password")
                        }
                        className="show-password"
                      >
                        {inputType1 === "password" ? <GoEye /> : <GoEyeClosed />}
                      </span>
                    </div>

                    <div className="password-wrapper">
                                <input
                                  type={inputType2}
                                  name="confirmPassword"
                                  placeholder="Confirm password"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  className="password-input"
                                  required
                                />
                    
                                <span
                                  type="button"
                                  onClick={() =>
                                    setInputType2(inputType2 === "password" ? "text" : "password")
                                  }
                                  className="show-password"
                                >
                                  {inputType2 === "password" ? <GoEye /> : <GoEyeClosed />}
                                </span>
                              </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
