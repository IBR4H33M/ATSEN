import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Settings,
  Save,
  Edit3,
  ChevronLeft,
  Building,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios.js";

export default function InstitutionSettings() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    phone: "",
    address: "",
    description: "",
  });
  const [edit, setEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const editableFields = ["phone", "address", "description"];

  useEffect(() => {
    if (!idOrName) return;
    api.get(`/institutions/${encodeURIComponent(idOrName)}/dashboard`)
      .then((response) => {
        setFields({
          phone: response.data.phone || "",
          address: response.data.address || "",
          description: response.data.description || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setErrMsg("Failed to load institution data.");
        setLoading(false);
      });
  }, [idOrName]);

  const handleEdit = (key) => setEdit((e) => ({ ...e, [key]: true }));
  const handleChange = (key, value) =>
    setFields((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    api.patch(`/institutions/${encodeURIComponent(idOrName)}/settings`, fields)
      .then(() => {
        setEdit({});
        toast.success("Institution settings updated successfully!");
      })
      .catch(() => {
        setErrMsg("Failed to update institution settings.");
        toast.error("Failed to update settings");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCancel = () => {
    setEdit({});
    // Reset fields to original values by refetching
    if (!idOrName) return;
    api.get(`/institutions/${encodeURIComponent(idOrName)}/dashboard`)
      .then((response) => {
        setFields({
          phone: response.data.phone || "",
          address: response.data.address || "",
          description: response.data.description || "",
        });
      })
      .catch(() => {
        setErrMsg("Failed to reload institution data.");
      });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading settings...
        </div>
      </div>
    );

  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{errMsg}</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}`}
          className="btn btn-ghost btn-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <Settings className="h-8 w-8 text-base-content/60" />
            Institution Settings
          </h1>
          <p className="text-base-content/70 mt-1">
            Manage your institution's profile and information
          </p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 p-6">
        <div className="space-y-6">
          {/* Phone */}
          <div className="flex items-start justify-between p-4 bg-base-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-base-content/60" />
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Phone Number
                </label>
                {edit.phone ? (
                  <input
                    type="text"
                    value={fields.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-base-content">
                    {fields.phone || "Not set"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("phone")}
              className="btn btn-ghost btn-sm"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Address */}
          <div className="flex items-start justify-between p-4 bg-base-200 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <MapPin className="h-5 w-5 text-base-content/60 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-base-content mb-1">
                  Address
                </label>
                {edit.address ? (
                  <textarea
                    value={fields.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter institution address"
                  />
                ) : (
                  <p className="text-base-content">
                    {fields.address || "Not set"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("address")}
              className="btn btn-ghost btn-sm"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <div className="flex items-start justify-between p-4 bg-base-200 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-5 w-5 text-base-content/60 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-base-content mb-1">
                  Description
                </label>
                {edit.description ? (
                  <textarea
                    value={fields.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter institution description"
                  />
                ) : (
                  <p className="text-base-content">
                    {fields.description || "Not set"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit("description")}
              className="btn btn-ghost btn-sm"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {Object.keys(edit).length > 0 && (
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-base-300">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
