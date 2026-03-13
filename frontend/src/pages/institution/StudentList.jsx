// frontend/src/pages/institution/StudentList.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Phone,
  Trash2,
  UserPlus,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentList() {
  const { idOrName } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student?")) return;

    try {
      const res = await fetch(
        `/api/institutions/${encodeURIComponent(
          idOrName
        )}/remove-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      // Remove student from local state
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
      toast.success("Student removed successfully");
    } catch (err) {
      console.error("Remove student failed:", err);
      setError("Could not remove student.");
      toast.error("Failed to remove student");
    }
  };

  useEffect(() => {
    if (!idOrName) return;

    fetch(
      `/api/institutions/${encodeURIComponent(
        idOrName
      )}/students`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setStudents(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch students failed:", err);
        setError("Failed to load students.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading students...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{error}</div>
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
              <GraduationCap className="h-8 w-8 text-green-500" />
              Students
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage your institution's students
            </p>
          </div>
        </div>

        <Link
          to={`/${encodeURIComponent(idOrName)}/add-student`}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium group"
        >
          <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Add Student
        </Link>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-20 h-20 text-base-content/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-base-content/70 mb-2">
            No students found
          </h3>
          <p className="text-base-content/60 mb-6">
            Start by adding students to your institution.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-student`}
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add First Student
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="card bg-base-100 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-green-300 group p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-base-content group-hover:text-green-700 mb-2">
                    {student.name}
                  </h3>

                  {student.email && (
                    <div className="flex items-center text-sm text-base-content/70 mb-2">
                      <Mail className="h-4 w-4 mr-2 text-base-content/40" />
                      <span>{student.email}</span>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center text-sm text-base-content/70 mb-2">
                      <Phone className="h-4 w-4 mr-2 text-base-content/40" />
                      <span>{student.phone}</span>
                    </div>
                  )}

                  {student.studentId && (
                    <div className="text-sm text-base-content/70 mb-2">
                      <span className="font-medium">Student ID:</span>{" "}
                      {student.studentId}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove student"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-base-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/60">Student</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
