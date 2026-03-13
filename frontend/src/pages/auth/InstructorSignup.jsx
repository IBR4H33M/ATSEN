// src/pages/auth/InstructorSignup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";

export default function InstructorSignup() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/instructors/register", form);
      setSuccess(
        "Instructor registration successful! Please log in with your credentials."
      );
      setForm({});

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
              <h2 className="text-2xl font-semibold text-base-content mb-2">
                Instructor Registration
              </h2>
              <p className="text-base-content/70">Create your instructor account</p>
            </div>

          {error && (
            <div className="alert alert-error mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              label="Full Name"
              value={form.name || ""}
              onChange={handleChange}
            />
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
              className="btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg"
            >
              Register as Instructor
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Want to register as a student?{" "}
              <Link
                to="/auth/signup/student"
                className="text-primary hover:text-primary/80 font-medium hover:underline"
              >
                Click here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary/80 font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/auth/signup"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              &lt; Back to role selection
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
