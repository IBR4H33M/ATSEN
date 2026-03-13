// frontend/src/pages/institution/InstructorList.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Users, Mail, Phone, Trash2, UserPlus, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function InstructorList() {
  const { idOrName } = useParams();
  const [insts, setInsts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const handleRemoveInstructor = async (instructorId) => {
    if (!confirm("Are you sure you want to remove this instructor?")) return;

    try {
      const res = await fetch(
        `/api/institutions/${encodeURIComponent(
          idOrName
        )}/remove-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructorId }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setInsts((prev) => prev.filter((i) => i._id !== instructorId));
      toast.success("Instructor removed successfully");
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setErrMsg("Could not remove instructor.");
      toast.error("Failed to remove instructor");
    }
  };

  useEffect(() => {
    fetch(
      `/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setInsts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load instructors.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading instructors...
        </div>
      </div>
    );
  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-error py-10">{errMsg}</div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to={`/${encodeURIComponent(idOrName)}`}
            className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              Instructors
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage your institution's instructors
            </p>
          </div>
        </div>

        <Link
          to={`/${encodeURIComponent(idOrName)}/add-instructor`}
          className="btn btn-secondary flex items-center px-6 py-3 font-medium group"
        >
          <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Add Instructor
        </Link>
      </div>

      {/* Instructors List */}
      {insts.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-20 h-20 text-base-content/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-base-content/70 mb-2">
            No instructors found
          </h3>
          <p className="text-base-content/60 mb-6">
            Start by adding instructors to your institution.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-instructor`}
            className="btn btn-secondary inline-flex items-center px-6 py-3 font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add First Instructor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insts.map((instructor) => (
            <div
              key={instructor._id}
              className="card bg-base-100 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-purple-300 group p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-base-content group-hover:text-purple-700 mb-2">
                    {instructor.name}
                  </h3>

                  {instructor.email && (
                    <div className="flex items-center text-sm text-base-content/70 mb-2">
                      <Mail className="h-4 w-4 mr-2 text-base-content/40" />
                      <span>{instructor.email}</span>
                    </div>
                  )}

                  {instructor.phone && (
                    <div className="flex items-center text-sm text-base-content/70 mb-2">
                      <Phone className="h-4 w-4 mr-2 text-base-content/40" />
                      <span>{instructor.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveInstructor(instructor._id)}
                  className="p-2 text-error hover:text-error/80 hover:bg-error/10 rounded-lg transition-colors"
                  title="Remove instructor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-base-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/60">Instructor</span>
                  <span className="badge badge-secondary text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
