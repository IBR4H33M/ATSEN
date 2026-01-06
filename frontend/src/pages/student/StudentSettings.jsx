import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/axios";

export default function StudentSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [institutions, setInstitutions] = useState([]);
  const [defaultInstitution, setDefaultInstitution] = useState(
    localStorage.getItem('selectedInstitutionId') || ''
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/students/${user._id}`);
        if (res.data.institutions) {
          setInstitutions(res.data.institutions);
          // Set first institution as default if none selected
          if (!defaultInstitution && res.data.institutions.length > 0) {
            const firstInstId = res.data.institutions[0]._id || res.data.institutions[0];
            setDefaultInstitution(firstInstId);
            localStorage.setItem('selectedInstitutionId', firstInstId);
          }
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
      }
    };
    fetchInstitutions();
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Save default institution
    localStorage.setItem('selectedInstitutionId', defaultInstitution);
    window.dispatchEvent(new Event('institutionChanged'));

    // TODO: Implement API call for other settings
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

                {institutions.length > 0 && (
                  <>
                    <div className="divider">Institution Preferences</div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Default Institution
                        </span>
                      </label>
                      <select
                        value={defaultInstitution}
                        onChange={(e) => setDefaultInstitution(e.target.value)}
                        className="select select-bordered w-full"
                      >
                        {institutions.map((inst) => (
                          <option key={inst._id || inst} value={inst._id || inst}>
                            {inst.name || 'Institution'}
                          </option>
                        ))}
                      </select>
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          This institution will be selected by default when you log in
                        </span>
                      </label>
                    </div>
                  </>
                )}

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
                <button type="button" className="btn btn-ghost" onClick={() => navigate("/student/dashboard")}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
