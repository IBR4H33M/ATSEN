// frontend/src/pages/institution/AddStudent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Search,
  UserPlus,
  ChevronLeft,
  X,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

export default function AddStudent() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  // search + selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) load all students from your global collection
  useEffect(() => {
    api.get("/students")
      .then((res) => {
        setAllStudents(res.data);
      })
      .catch((err) => {
        console.error("Fetch all students failed:", err);
        setError("Could not load students.");
      });
  }, []);

  // 2) filter by email as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }
    setFiltered(
      allStudents.filter(
        (stu) =>
          stu.email.toLowerCase().includes(q) ||
          stu.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allStudents]);

  // 3) submit handler: POST to your institution's add-student endpoint
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        `/institutions/${encodeURIComponent(idOrName)}/add-student`,
        {
          studentId: selectedStudent._id,
        }
      );

      toast.success("Student added successfully!");
      // on success, go back to the student list
      navigate(`/${encodeURIComponent(idOrName)}/students`);
    } catch (err) {
      console.error("Add student failed:", err);
      setError("Could not add student to institution.");
      toast.error("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/students`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-green-500" />
            Add Student
          </h1>
          <p className="text-base-content/70 mt-1">
            Search and add a student to your institution
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
              Search for Student
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type="text"
                placeholder="Type student's name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedStudent(null);
                  setError("");
                }}
                className="block w-full pl-10 pr-3 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-base-200 text-base-content placeholder:text-base-content/40"
                autoComplete="off"
              />

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map((stu) => (
                      <div
                        key={stu._id}
                        onClick={() => {
                          setSelectedStudent(stu);
                          setSearchQuery("");
                          setError("");
                        }}
                        className={`p-4 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedStudent?._id === stu._id ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {stu.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {stu.email}
                        </div>
                        {stu.studentId && (
                          <div className="text-xs text-base-content/60">
                            ID: {stu.studentId}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-base-content/60">
                      No students found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Student Display */}
          {selectedStudent && (
            <div className="mb-6 p-4 rounded-lg border border-success/30 bg-success/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-success">
                    Selected Student
                  </h3>
                  <p className="text-base-content">{selectedStudent.name}</p>
                  <p className="text-sm text-base-content/70">
                    {selectedStudent.email}
                  </p>
                  {selectedStudent.studentId && (
                    <p className="text-sm text-base-content/70">
                      Student ID: {selectedStudent.studentId}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded p-1 text-success/70 hover:bg-success/10 hover:text-success transition-colors"
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
              disabled={!selectedStudent || loading}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
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
              to={`/${encodeURIComponent(idOrName)}/students`}
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
