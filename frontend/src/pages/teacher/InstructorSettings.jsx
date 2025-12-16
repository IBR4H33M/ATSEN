import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function InstructorSettings() {
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // TODO: Implement API call
    setTimeout(() => {
      setSuccess("Settings updated successfully!");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Account Settings</h1>
          <p className="text-base-content/70">Update your account information</p>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
            {success && <div className="alert alert-success mb-4"><span>{success}</span></div>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Name</span></label>
                  <input type="text" name="name" className="input input-bordered w-full" value={form.name} onChange={handleChange} placeholder="Enter your name" />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Email</span></label>
                  <input type="email" name="email" className="input input-bordered w-full" value={form.email} onChange={handleChange} placeholder="Enter your email" />
                </div>

                <div className="divider">Change Password</div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Current Password</span></label>
                  <div className="relative">
                    <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" className="input input-bordered w-full pr-10" value={form.currentPassword} onChange={handleChange} placeholder="Enter current password" />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff className="h-5 w-5 text-base-content/40" /> : <Eye className="h-5 w-5 text-base-content/40" />}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">New Password</span></label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} name="newPassword" className="input input-bordered w-full pr-10" value={form.newPassword} onChange={handleChange} placeholder="Enter new password" />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-base-content/40" /> : <Eye className="h-5 w-5 text-base-content/40" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate("/teacher/dashboard")}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
