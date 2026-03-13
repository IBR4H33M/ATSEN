// frontend/src/pages/institution/AddInstructor.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Search, UserPlus, ChevronLeft, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

export default function AddInstructor() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  // search + selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [allInstructors, setAllInstructors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) load all instructors from your global collection
  useEffect(() => {
    api.get("/instructors")
      .then((res) => {
        setAllInstructors(res.data);
      })
      .catch((err) => {
        console.error("Fetch all instructors failed:", err);
        setError("Could not load instructors.");
      });
  }, []);

  // 2) filter by email as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFiltered([]);
    setFiltered(
      allInstructors.filter(
        (ins) =>
          ins.email.toLowerCase().includes(q) ||
          ins.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allInstructors]);

  // 3) submit handler: POST to your institution's add-instructor endpoint
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedInstructor) {
      setError("Please select an instructor first.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        `/institutions/${encodeURIComponent(idOrName)}/add-instructor`,
        {
          instructorId: selectedInstructor._id,
        }
      );

      toast.success("Instructor added successfully!");
      // on success, go back to the instructor list
      navigate(`/${encodeURIComponent(idOrName)}/instructors`);
    } catch (err) {
      console.error("Add instructor failed:", err);
      setError("Could not add instructor to institution.");
      toast.error("Failed to add instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/instructors`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-purple-500" />
            Add Instructor
          </h1>
          <p className="text-base-content/70 mt-1">
            Search and add an instructor to your institution
          </p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleAdd}>
          {/* Search Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Search for Instructor
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type="text"
                placeholder="Type instructor's name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedInstructor(null);
                  setError("");
                }}
                className="block w-full pl-10 pr-3 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-base-200 text-base-content placeholder:text-base-content/40"
                autoComplete="off"
              />

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map((ins) => (
                      <div
                        key={ins._id}
                        onClick={() => {
                          setSelectedInstructor(ins);
                          setSearchQuery("");
                          setError("");
                        }}
                        className={`p-4 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedInstructor?._id === ins._id
                            ? "bg-purple-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {ins.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {ins.email}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-base-content/60">
                      No instructors found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Instructor Display */}
          {selectedInstructor && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary">
                    Selected Instructor
                  </h3>
                  <p className="text-base-content">{selectedInstructor.name}</p>
                  <p className="text-sm text-base-content/70">
                    {selectedInstructor.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstructor(null)}
                  className="rounded p-1 text-primary/70 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!selectedInstructor || loading}
              className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add to Institution"
              )}
            </button>

            <Link
              to={`/${encodeURIComponent(idOrName)}/instructors`}
              className="px-6 py-3 border border-base-300 text-base-content/70 rounded-lg hover:bg-base-200 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
