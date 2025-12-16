import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/admin/login", form);
      // Clear all existing sessions
      localStorage.clear();
      // Set new admin session
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.devAdmin));
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-base-content">Admin Login</h2>
                <p className="text-base-content/70 mt-2">
                  Sign in to access the admin dashboard
                </p>
              </div>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered w-full"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="input input-bordered w-full pr-10"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-base-content/40" />
                        ) : (
                          <Eye className="h-5 w-5 text-base-content/40" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full mt-6 ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/auth/login" className="link link-primary text-sm">
                  ← Back to General Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
