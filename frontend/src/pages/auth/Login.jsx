// src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useAuthNavigation } from "../../hooks/useAuthNavigation.js";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Login() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  usePageTitle("Login - Access Your Educational Account");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();
  const { navigateAfterAuth } = useAuthNavigation();

  // If ProtectedRoute redirected us here, it will stash the original path in `location.state.from`
  const fromPath = location.state?.from;

  // Redirect already authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      let defaultPath;
      if (user.role === "institution") {
        defaultPath = `/${user.slug}/dashboard`;
      } else if (user.role === "instructor") {
        defaultPath = "/teacher/dashboard";
      } else {
        defaultPath = "/student/dashboard";
      }
      navigate(defaultPath, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = form;

    try {
      // Use the universal login endpoint
      const { data } = await api.post("/auth/login", { email, password });
      
      // Extract the role and user data from response
      let role, userData;
      
      if (data.institution) {
        role = "institution";
        userData = { role, ...data.institution };
      } else if (data.instructor) {
        role = "instructor"; 
        userData = { role, ...data.instructor };
      } else if (data.student) {
        role = "student";
        userData = { role, ...data.student };
      } else {
        throw new Error("Invalid response format");
      }

      // Use AuthContext login and wait for it to complete
      await login(data.token, userData);

      // Determine default path after login
      let defaultPath;
      if (role === "institution") {
        defaultPath = `/${data.institution.slug}/dashboard`;
      } else if (role === "instructor") {
        defaultPath = "/teacher/dashboard";
      } else {
        defaultPath = "/student/dashboard";
      }

      // If someone was trying to hit a protected URL, use that; otherwise use our default
      const redirectTo = fromPath || defaultPath;

      // Use our auth-aware navigation with a fallback
      navigateAfterAuth(redirectTo);

      // Additional fallback: force navigation after a short delay if first attempt fails
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem("user") || "null");
        if (currentUser && window.location.pathname === "/auth/login") {
          window.location.href = redirectTo;
        }
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <img 
          src="/BlueHomeAbstract.jpg" 
          alt="Background" 
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div
          className="flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          <div className="max-w-md w-full bg-base-100/95 backdrop-blur-sm shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-base-content mb-2">
                Login to your ATSEN account
              </h1>
            </div>

          {error && (
            <div className="alert alert-error mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
            />
            <Input
              name="password"
              label="Password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg disabled:loading"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="text-primary hover:text-primary/80 font-medium hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              &lt; Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// Extracted Input component
function Input({ name, label, type = "text", onChange, value = "" }) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="input input-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
