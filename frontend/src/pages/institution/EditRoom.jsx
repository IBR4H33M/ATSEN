// frontend/src/pages/institution/EditRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Search,
  User,
  Mail,
  Calendar,
  Edit,
} from "lucide-react";
import api from "../../lib/axios";
import SectionManager from "../../components/SectionManager.jsx";

export default function EditRoom() {
  const { idOrName, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [instructorResults, setInstructorResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Section selection states for assignment
  const [selectedStudentSections, setSelectedStudentSections] = useState([]);
  const [selectedInstructorSections, setSelectedInstructorSections] = useState(
    []
  );

  // States for editing existing user sections
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingInstructorId, setEditingInstructorId] = useState(null);
  const [editStudentSections, setEditStudentSections] = useState([]);
  const [editInstructorSections, setEditInstructorSections] = useState([]);

  // Room editing states
  const [editedRoomName, setEditedRoomName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  // Section editing states
  const [sections, setSections] = useState([]);
  const [isEditingSections, setIsEditingSections] = useState(false);
  const [savingSections, setSavingSections] = useState(false);

  // Function to refresh room data
  const refreshRoomData = () => {
    if (!idOrName || !roomId) return;

    api.get(`/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}`)
      .then((res) => {
        setRoom(res.data);
        setSections(res.data.sections || []);
      })
      .then((json) => {
        setRoom(json);
        setEditedRoomName(json.room_name || "");
        setEditedDescription(json.description || "");
        setSections(json.sections || []);
      })
      .catch((err) => {
        console.error("Refresh room failed:", err);
        setError("Could not refresh room details.");
      });
  };

  useEffect(() => {
    if (!idOrName || !roomId) return;

    console.log("=== FRONTEND ROOM FETCH ===");
    console.log("Fetching room:", roomId);
    console.log("idOrName:", idOrName);
    console.log("roomId:", roomId);

    api.get(`/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}`)
      .then((res) => {
        console.log("Response status:", res.status);
        console.log("Room data:", res.data);
        setRoom(res.data);
        setSections(res.data.sections || []);
        setEditedRoomName(res.data.room_name || "");
        setEditedDescription(res.data.description || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch room failed:", err);
        setError("Could not load room details.");
        setLoading(false);
      });
  }, [idOrName, roomId]);

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student from the room?"))
      return;

    try {
      const res = await api.post(
        `/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}/remove-student`,
        { studentId }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setRoom((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));
    } catch (err) {
      console.error("Remove student failed:", err);
      setError("Could not remove student from room.");
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (
      !confirm("Are you sure you want to remove this instructor from the room?")
    )
      return;

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/remove-instructor`,
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

      setRoom((prev) => ({
        ...prev,
        instructors: prev.instructors.filter((i) => i._id !== instructorId),
      }));
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setError("Could not remove instructor from room.");
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setStudentResults([]);
      return;
    }

    try {
      const res = await api.get(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/search-students?search=${encodeURIComponent(query)}`
      );
      setStudentResults((res.data || []).slice(0, 5));
    } catch (err) {
      console.error("Search students failed:", err);
    }
  };

  const searchInstructors = async (query) => {
    if (!query.trim()) {
      setInstructorResults([]);
      return;
    }

    try {
      const res = await api.get(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/search-instructors?search=${encodeURIComponent(
          query
        )}`
      );
      setInstructorResults((res.data || []).slice(0, 5));
    } catch (err) {
      console.error("Search instructors failed:", err);
    }
  };

  // Section selection handlers
  const handleStudentSectionToggle = (sectionNumber) => {
    setSelectedStudentSections(
      (prev) =>
        prev.includes(sectionNumber)
          ? prev.filter((s) => s !== sectionNumber)
          : [sectionNumber] // Students can only be in one section
    );
  };

  const handleInstructorSectionToggle = (sectionNumber) => {
    setSelectedInstructorSections(
      (prev) =>
        prev.includes(sectionNumber)
          ? prev.filter((s) => s !== sectionNumber)
          : [...prev, sectionNumber] // Instructors can be in multiple sections
    );
  };

  // Assign student to selected section
  const assignStudentToSection = async () => {
    if (!selectedStudent || selectedStudentSections.length === 0) {
      alert("Please select a student and a section.");
      return;
    }

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/assign-student-section`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudent._id,
            sectionNumber: selectedStudentSections[0],
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      alert("Student assigned to section successfully!");
      setSelectedStudent(null);
      setSelectedStudentSections([]);
      setStudentEmail("");
      setStudentResults([]);
      refreshRoomData();
    } catch (err) {
      console.error("Assign student to section failed:", err);
      alert("Error: " + err.message);
    }
  };

  // Assign instructor to selected sections
  const assignInstructorToSections = async () => {
    if (!selectedInstructor || selectedInstructorSections.length === 0) {
      alert("Please select an instructor and at least one section.");
      return;
    }

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/assign-instructor-sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: selectedInstructor._id,
            sectionNumbers: selectedInstructorSections,
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      alert("Instructor assigned to sections successfully!");
      setSelectedInstructor(null);
      setSelectedInstructorSections([]);
      setInstructorEmail("");
      setInstructorResults([]);
      refreshRoomData();
    } catch (err) {
      console.error("Assign instructor to sections failed:", err);
      alert("Error: " + err.message);
    }
  };

  // Functions for editing existing user sections
  const handleEditStudentSections = (student) => {
    setEditingStudentId(student._id);
    setEditStudentSections(
      student.assignedSections?.map((s) => s.sectionNumber) || []
    );
  };

  const handleEditInstructorSections = (instructor) => {
    setEditingInstructorId(instructor._id);
    setEditInstructorSections(
      instructor.assignedSections?.map((s) => s.sectionNumber) || []
    );
  };

  const handleEditStudentSectionToggle = (sectionNumber) => {
    setEditStudentSections([sectionNumber]); // Students can only be in one section
  };

  const handleEditInstructorSectionToggle = (sectionNumber) => {
    setEditInstructorSections(
      (prev) =>
        prev.includes(sectionNumber)
          ? prev.filter((s) => s !== sectionNumber)
          : [...prev, sectionNumber] // Instructors can be in multiple sections
    );
  };

  const saveStudentSectionEdit = async () => {
    if (editStudentSections.length === 0) {
      alert("Please select a section for the student.");
      return;
    }

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/assign-student-section`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: editingStudentId,
            sectionNumber: editStudentSections[0],
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      alert("Student section updated successfully!");
      setEditingStudentId(null);
      setEditStudentSections([]);
      refreshRoomData();
    } catch (err) {
      console.error("Update student section failed:", err);
      alert("Error: " + err.message);
    }
  };

  const saveInstructorSectionEdit = async () => {
    if (editInstructorSections.length === 0) {
      alert("Please select at least one section for the instructor.");
      return;
    }

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/assign-instructor-sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: editingInstructorId,
            sectionNumbers: editInstructorSections,
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      alert("Instructor sections updated successfully!");
      setEditingInstructorId(null);
      setEditInstructorSections([]);
      refreshRoomData();
    } catch (err) {
      console.error("Update instructor sections failed:", err);
      alert("Error: " + err.message);
    }
  };

  const cancelSectionEdit = () => {
    setEditingStudentId(null);
    setEditingInstructorId(null);
    setEditStudentSections([]);
    setEditInstructorSections([]);
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedStudent.email }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setSelectedStudent(null);
      setStudentEmail("");
      setStudentResults([]);
      setSelectedStudentSections([]);
      window.location.reload();
    } catch (err) {
      console.error("Add student failed:", err);
      setError("Could not add student to room.");
    }
  };

  const handleAddInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/add-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedInstructor.email }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setSelectedInstructor(null);
      setInstructorEmail("");
      setInstructorResults([]);
      setSelectedInstructorSections([]);
      window.location.reload();
    } catch (err) {
      console.error("Add instructor failed:", err);
      setError("Could not add instructor to room.");
    }
  };

  // Room editing functions
  const handleSaveRoomInfo = async () => {
    if (!editedRoomName.trim() || !editedDescription.trim()) {
      alert("Room name and description are required");
      return;
    }

    setSavingRoom(true);
    try {
      const res = await fetch(
        `/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_name: editedRoomName,
            description: editedDescription,
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      const updatedRoom = await res.json();
      setRoom(updatedRoom);
      setIsEditingRoom(false);
      alert("Room information updated successfully!");
    } catch (err) {
      console.error("Update room failed:", err);
      alert("Could not update room information.");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedRoomName(room.room_name || "");
    setEditedDescription(room.description || "");
    setIsEditingRoom(false);
  };

  // Section editing functions
  const validateSections = () => {
    for (let section of sections) {
      // Check if section has at least one class timing
      if (!section.classTimings || section.classTimings.length === 0) {
        return false;
      }

      // Check if at least the first class timing is complete
      const firstTiming = section.classTimings[0];
      if (!firstTiming.day || !firstTiming.startTime || !firstTiming.endTime) {
        return false;
      }

      // Check other timings for completeness (only if they have any field filled)
      for (let i = 1; i < section.classTimings.length; i++) {
        const timing = section.classTimings[i];
        const hasAnyField = timing.day || timing.startTime || timing.endTime;
        if (
          hasAnyField &&
          (!timing.day || !timing.startTime || !timing.endTime)
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveSections = async () => {
    if (!validateSections()) {
      alert(
        "Please fill in at least one complete class timing for each section. If you start filling additional class timings, please complete all fields."
      );
      return;
    }

    // Filter out incomplete class timings before sending to backend
    const filteredSections = sections.map((section) => ({
      ...section,
      classTimings: section.classTimings.filter(
        (timing) => timing.day && timing.startTime && timing.endTime
      ),
    }));

    setSavingSections(true);
    try {
      const res = await fetch(
        `/rooms/${roomId}/sections`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: filteredSections }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setIsEditingSections(false);
      refreshRoomData();
      alert("Sections updated successfully!");
    } catch (err) {
      console.error("Update sections failed:", err);
      alert("Could not update sections: " + err.message);
    } finally {
      setSavingSections(false);
    }
  };

  const handleCancelSectionEdit = () => {
    setSections(room.sections || []);
    setIsEditingSections(false);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading room details...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{error}</div>
      </div>
    );
  if (!room)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-base-content/70 py-10">
          Room not found
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Edit Room: {room.room_name}
          </h1>
          <p className="text-base-content/70 mt-1">
            Manage room information, students and instructors
          </p>
        </div>
      </div>

      {/* Room Information Section */}
      <div className="card bg-base-100 border border-base-300 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Room Information
          </h2>
          {!isEditingRoom && (
            <button
              onClick={() => setIsEditingRoom(true)}
              className="btn btn-primary btn-sm"
            >
              Edit Info
            </button>
          )}
        </div>

        {isEditingRoom ? (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Room Name</span>
              </label>
              <input
                type="text"
                value={editedRoomName}
                onChange={(e) => setEditedRoomName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="textarea textarea-bordered w-full h-24"
                placeholder="Enter room description"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="btn btn-ghost"
                disabled={savingRoom}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoomInfo}
                className="btn btn-primary"
                disabled={savingRoom}
              >
                {savingRoom ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">Room Name</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content">{room.room_name}</p>
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Created Date</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content">
                  {new Date(room.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Section */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-base-content">
              Students ({room.students?.length || 0})
            </h2>
          </div>
          {/* Add Student */}
          <div className="card bg-base-200 p-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search student by email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="Search student by email"
                  value={studentEmail}
                  onChange={(e) => {
                    setStudentEmail(e.target.value);
                    searchStudents(e.target.value);
                    setSelectedStudent(null);
                    setSelectedStudentSections([]);
                  }}
                  className="input input-bordered w-full pl-10 bg-base-100"
                />

                {/* Search Results */}
                {studentResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {studentResults.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setStudentEmail(student.email);
                          setStudentResults([]);
                          setSelectedStudentSections([]);
                        }}
                        className={`p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedStudent?._id === student._id
                            ? "bg-green-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {student.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {student.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Student Display and Section Selection */}
            {selectedStudent && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-800">
                    Selected: <strong>{selectedStudent.name}</strong> (
                    {selectedStudent.email})
                  </span>
                </div>

                {/* Section Selection for Student */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Assign to Section (Required)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.sections?.map((section) => (
                      <label
                        key={section.sectionNumber}
                        className="cursor-pointer"
                      >
                        <div
                          className={`p-3 border-2 rounded-lg transition-colors ${
                            selectedStudentSections.includes(
                              section.sectionNumber
                            )
                              ? "border-green-500 bg-green-50"
                              : "border-base-300 hover:border-green-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="studentSection"
                              className="radio radio-primary"
                              checked={selectedStudentSections.includes(
                                section.sectionNumber
                              )}
                              onChange={() =>
                                handleStudentSectionToggle(
                                  section.sectionNumber
                                )
                              }
                            />
                            <span className="font-medium">
                              Section {section.sectionNumber}
                            </span>
                          </div>
                          <div className="text-sm text-base-content/70 mt-1">
                            {section.classTimings?.length || 0} class timing(s)
                          </div>
                          {section.students && section.students.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {section.students.length} student(s) enrolled
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedStudentSections.length === 0 && (
                    <div className="text-sm text-orange-600 mt-2">
                      Please select a section to assign the student.
                    </div>
                  )}
                </div>

                {/* Assignment Button for Student */}
                <div className="flex justify-end">
                  <button
                    onClick={assignStudentToSection}
                    disabled={selectedStudentSections.length === 0}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student to Section
                  </button>
                </div>
              </div>
            )}
          </div>{" "}
          {room.students?.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/60">
                No students assigned to this room.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {room.students.map((student) => (
                <div
                  key={student._id}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span className="text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Mail className="h-3 w-3" />
                          <span>{student.email}</span>
                        </div>
                        {student.assignedSections &&
                          student.assignedSections.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Section(s):{" "}
                                {student.assignedSections
                                  .map((s) => s.sectionNumber)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStudentSections(student)}
                        className="btn btn-primary btn-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student._id)}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Student Section Edit Interface */}
                  {editingStudentId === student._id && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-3">
                        Edit Section Assignment for {student.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {room.sections?.map((section) => (
                          <label
                            key={section.sectionNumber}
                            className="cursor-pointer"
                          >
                            <div
                              className={`p-3 border-2 rounded-lg transition-colors ${
                                editStudentSections.includes(
                                  section.sectionNumber
                                )
                                  ? "border-green-500 bg-green-100"
                                  : "border-gray-300 hover:border-green-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`editStudentSection_${student._id}`}
                                  className="radio radio-primary"
                                  checked={editStudentSections.includes(
                                    section.sectionNumber
                                  )}
                                  onChange={() =>
                                    handleEditStudentSectionToggle(
                                      section.sectionNumber
                                    )
                                  }
                                />
                                <span className="font-medium">
                                  Section {section.sectionNumber}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {section.classTimings?.length || 0} class
                                timing(s)
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveStudentSectionEdit}
                          disabled={editStudentSections.length === 0}
                          className="btn btn-success btn-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelSectionEdit}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructors Section */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-base-content">
              Instructors ({room.instructors?.length || 0})
            </h2>
          </div>
          {/* Add Instructor */}
          <div className="card bg-base-200 p-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search instructor by email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="Search instructor by email"
                  value={instructorEmail}
                  onChange={(e) => {
                    setInstructorEmail(e.target.value);
                    searchInstructors(e.target.value);
                    setSelectedInstructor(null);
                    setSelectedInstructorSections([]);
                  }}
                  className="input input-bordered w-full pl-10 bg-base-100"
                />

                {/* Search Results */}
                {instructorResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {instructorResults.map((instructor) => (
                      <div
                        key={instructor._id}
                        onClick={() => {
                          setSelectedInstructor(instructor);
                          setInstructorEmail(instructor.email);
                          setInstructorResults([]);
                          setSelectedInstructorSections([]);
                        }}
                        className={`p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedInstructor?._id === instructor._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {instructor.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {instructor.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Instructor Display and Section Selection */}
            {selectedInstructor && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-800">
                    Selected: <strong>{selectedInstructor.name}</strong> (
                    {selectedInstructor.email})
                  </span>
                </div>

                {/* Section Selection for Instructor */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Assign to Sections (Required - multiple allowed)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.sections?.map((section) => (
                      <label
                        key={section.sectionNumber}
                        className="cursor-pointer"
                      >
                        <div
                          className={`p-3 border-2 rounded-lg transition-colors ${
                            selectedInstructorSections.includes(
                              section.sectionNumber
                            )
                              ? "border-blue-500 bg-blue-50"
                              : "border-base-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary"
                              checked={selectedInstructorSections.includes(
                                section.sectionNumber
                              )}
                              onChange={() =>
                                handleInstructorSectionToggle(
                                  section.sectionNumber
                                )
                              }
                            />
                            <span className="font-medium">
                              Section {section.sectionNumber}
                            </span>
                          </div>
                          <div className="text-sm text-base-content/70 mt-1">
                            {section.classTimings?.length || 0} class timing(s)
                          </div>
                          {section.instructors &&
                            section.instructors.length > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                {section.instructors.length} instructor(s)
                                assigned
                              </div>
                            )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedInstructorSections.length === 0 && (
                    <div className="text-sm text-orange-600 mt-2">
                      Please select at least one section to assign the
                      instructor.
                    </div>
                  )}
                </div>

                {/* Assignment Button for Instructor */}
                <div className="flex justify-end">
                  <button
                    onClick={assignInstructorToSections}
                    disabled={selectedInstructorSections.length === 0}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructor to Sections
                  </button>
                </div>
              </div>
            )}
          </div>{" "}
          {room.instructors?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/60">
                No instructors assigned to this room.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {room.instructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-secondary text-secondary-content rounded-full w-10">
                          <span className="text-sm">
                            {instructor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {instructor.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Mail className="h-3 w-3" />
                          <span>{instructor.email}</span>
                        </div>
                        {instructor.assignedSections &&
                          instructor.assignedSections.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Section(s):{" "}
                                {instructor.assignedSections
                                  .map((s) => s.sectionNumber)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditInstructorSections(instructor)}
                        className="btn btn-primary btn-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveInstructor(instructor._id)}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Instructor Section Edit Interface */}
                  {editingInstructorId === instructor._id && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3">
                        Edit Section Assignments for {instructor.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {room.sections?.map((section) => (
                          <label
                            key={section.sectionNumber}
                            className="cursor-pointer"
                          >
                            <div
                              className={`p-3 border-2 rounded-lg transition-colors ${
                                editInstructorSections.includes(
                                  section.sectionNumber
                                )
                                  ? "border-blue-500 bg-blue-100"
                                  : "border-gray-300 hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-primary"
                                  checked={editInstructorSections.includes(
                                    section.sectionNumber
                                  )}
                                  onChange={() =>
                                    handleEditInstructorSectionToggle(
                                      section.sectionNumber
                                    )
                                  }
                                />
                                <span className="font-medium">
                                  Section {section.sectionNumber}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {section.classTimings?.length || 0} class
                                timing(s)
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveInstructorSectionEdit}
                          disabled={editInstructorSections.length === 0}
                          className="btn btn-success btn-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelSectionEdit}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Configuration */}
      <div className="card bg-base-100 shadow-md mt-8">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Section Configuration
            </h2>
            {!isEditingSections && (
              <button
                onClick={() => setIsEditingSections(true)}
                className="btn btn-primary btn-sm"
              >
                Edit Sections
              </button>
            )}
          </div>

          {isEditingSections ? (
            <div className="space-y-4">
              <p className="text-base-content/70">
                Configure sections and class timings for this room.
              </p>

              <SectionManager
                sections={sections}
                onSectionsChange={setSections}
              />

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleSaveSections}
                  disabled={savingSections}
                  className="btn btn-primary"
                >
                  {savingSections ? "Saving..." : "Save Sections"}
                </button>
                <button
                  onClick={handleCancelSectionEdit}
                  disabled={savingSections}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-base-content/70">
                Current section configuration for this room.
              </p>

              {room?.sections && room.sections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {room.sections.map((section) => (
                    <div
                      key={section.sectionNumber}
                      className="card bg-base-50 border border-base-200 p-4"
                    >
                      <h4 className="font-semibold text-primary mb-2">
                        Section {section.sectionNumber}
                      </h4>
                      <div className="space-y-1">
                        {section.classTimings?.map((timing, index) => (
                          <div
                            key={index}
                            className="text-sm text-base-content/70"
                          >
                            {timing.day} {timing.startTime} - {timing.endTime}
                          </div>
                        ))}
                        {(!section.classTimings ||
                          section.classTimings.length === 0) && (
                          <div className="text-sm text-red-500">
                            No class timings configured
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  No sections configured for this room.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
