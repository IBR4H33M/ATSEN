import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";

export default function AccessControl() {
  const { idOrName } = useParams();
  const { user } = useAuth();
  const [superadmin, setSuperadmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, [idOrName]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/institutions/${encodeURIComponent(idOrName)}/access-control`);
      setSuperadmin(res.data.superadmin || null);
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error(err);
      setErr("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setErr("");
    if (!email) return setErr("Email is required");
    if (!superadmin?.email) return setErr("Superadmin not found");
    setAdding(true);
    try {
      await api.post(`/institutions/${encodeURIComponent(idOrName)}/access-control`, { email, name });
      setEmail("");
      setName("");
      fetchAdmins();
    } catch (err) {
      setErr(err.response?.data?.message || "Failed to add admin");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Access Control</h1>
        <p className="text-base-content/70">List and add institution admin accounts</p>
      </div>

      <div className="card bg-base-100 border border-base-300 p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Admin Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full" placeholder="admin@example.com" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered w-full" placeholder="Admin Name" />
        </div>
        {err && <div className="alert alert-error mb-4">{err}</div>}
        <div className="flex gap-2">
          <button onClick={handleAdd} className="btn btn-primary" disabled={adding}>{adding ? 'Adding...' : 'Add Admin'}</button>
          <Link to={`/${encodeURIComponent(idOrName)}/dashboard`} className="btn btn-ghost">Back</Link>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Superadmin</h2>
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : superadmin ? (
          <div className="p-3 bg-primary/10 rounded">
            <div className="font-medium">{superadmin.email}</div>
            <div className="text-sm text-base-content/60">Institution Owner</div>
          </div>
        ) : (
          <div className="text-center py-6">No superadmin found</div>
        )}
      </div>

      <div className="card bg-base-100 border border-base-300 p-6">
        <h2 className="text-lg font-semibold mb-4">Additional Admins</h2>
        {loading ? (
          <div className="text-center py-6">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-6">No additional admins</div>
        ) : (
          <ul className="space-y-3">
            {admins.map((a) => (
              <li key={a.email} className="flex items-center justify-between p-3 bg-base-200 rounded">
                <div>
                  <div className="font-medium">{a.name || a.email}</div>
                  <div className="text-sm text-base-content/60">{a.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
