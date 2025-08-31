// frontend/src/pages/institution/AddRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Home } from "lucide-react";
import SectionManager from "../../components/SectionManager.jsx";

export default function AddRoom() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  // form state
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);

  // sections state
  const [sections, setSections] = useState([
    {
      sectionNumber: 1,
      classTimings: [{ day: "", startTime: "", endTime: "" }],
      instructors: [],
    },
  ]);

  // load all instructors for this institution
  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => res.json())
      .then(setInstructors)
      .catch((err) => console.error("Fetch instructors:", err));
  }, [idOrName]);

  // live‐filter instructor list
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFiltered([]);
    setFiltered(instructors.filter((t) => t.name.toLowerCase().includes(q)));
  }, [searchQuery, instructors]);

  // Handle section selection for instructor assignment
  const handleSectionToggle = (sectionNumber) => {
    setSelectedSections((prev) =>
      prev.includes(sectionNumber)
        ? prev.filter((s) => s !== sectionNumber)
        : [...prev, sectionNumber]
    );
  };

  // Handle instructor assignment to sections
  const assignInstructorToSections = () => {
    if (!selectedInstructor || selectedSections.length === 0) {
      alert("Please select an instructor and at least one section.");
      return;
    }

    // Update sections with instructor assignment
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (selectedSections.includes(section.sectionNumber)) {
          const instructorExists = section.instructors?.some(
            (inst) => inst._id === selectedInstructor._id
          );
          if (!instructorExists) {
            return {
              ...section,
              instructors: [...(section.instructors || []), selectedInstructor],
            };
          }
        }
        return section;
      })
    );

    // Reset selections
    setSelectedInstructor(null);
    setSelectedSections([]);
    setSearchQuery("");
  };

  // Remove instructor from a specific section
  const removeInstructorFromSection = (sectionNumber, instructorId) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.sectionNumber === sectionNumber) {
          return {
            ...section,
            instructors: section.instructors.filter(
              (inst) => inst._id !== instructorId
            ),
          };
        }
        return section;
      })
    );
  };

  // validate sections before submission
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

  // submit handler
  const handleCreate = async (e) => {
    e.preventDefault();

    // Validate sections
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
      instructors: (section.instructors || []).map(
        (instructor) => instructor._id
      ),
    }));

    const payload = {
      room_name: roomName,
      description,
      instructors: [],
      institution: idOrName,
      sections: filteredSections,
    };

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create room");
      }
      // redirect back to your dashboard or rooms list
      navigate(`/${encodeURIComponent(idOrName)}/dashboard`);
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/dashboard`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-500" />
            Add New Room
          </h1>
          <p className="text-base-content/70 mt-1">
            Create a new room with sections and class timings
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Room Information Card */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Room Information
          </h2>

          {/* Room Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Room Name *</span>
            </label>
            <input
              type="text"
              placeholder="Enter room name..."
              className="input input-bordered"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Description *</span>
            </label>
            <textarea
              placeholder="Enter room description..."
              className="textarea textarea-bordered h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Class Sections Configuration Card */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Class Sections
          </h2>
          <SectionManager sections={sections} onSectionsChange={setSections} />
        </div>

        {/* Instructor Assignment Card */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Assign Instructors to Sections
          </h2>

          {/* Instructor Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Select Instructor</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type instructor's name..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedInstructor(null);
                }}
                autoComplete="off"
              />

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map((tutor) => (
                      <div
                        key={tutor._id}
                        onClick={() => {
                          setSelectedInstructor(tutor);
                          setSearchQuery("");
                        }}
                        className={`p-4 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedInstructor?._id === tutor._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {tutor.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {tutor.email}
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
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Selected Instructor
                  </h3>
                  <p className="text-blue-700">{selectedInstructor.name}</p>
                  <p className="text-sm text-blue-600">
                    {selectedInstructor.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstructor(null)}
                  className="btn btn-ghost btn-sm btn-circle text-blue-400 hover:text-blue-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Section Selection */}
          {selectedInstructor && sections.length > 0 && (
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">
                  Assign to Sections
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sections.map((section) => (
                  <label key={section.sectionNumber} className="cursor-pointer">
                    <div
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        selectedSections.includes(section.sectionNumber)
                          ? "border-blue-500 bg-blue-50"
                          : "border-base-300 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={selectedSections.includes(
                            section.sectionNumber
                          )}
                          onChange={() =>
                            handleSectionToggle(section.sectionNumber)
                          }
                        />
                        <span className="font-medium">
                          Section {section.sectionNumber}
                        </span>
                      </div>
                      <div className="text-sm text-base-content/70 mt-1">
                        {section.classTimings.length} class timing(s)
                      </div>
                      {section.instructors &&
                        section.instructors.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Instructors:{" "}
                            {section.instructors
                              .map((inst) => inst.name)
                              .join(", ")}
                          </div>
                        )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Button */}
          {selectedInstructor && selectedSections.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={assignInstructorToSections}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign to Selected Sections
              </button>
            </div>
          )}

          {/* Current Assignments Display */}
          {sections.some(
            (section) => section.instructors && section.instructors.length > 0
          ) && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-base-content mb-3">
                Current Assignments
              </h3>
              <div className="space-y-2">
                {sections.map(
                  (section) =>
                    section.instructors &&
                    section.instructors.length > 0 && (
                      <div
                        key={section.sectionNumber}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="font-medium text-green-800 mb-2">
                          Section {section.sectionNumber}
                        </div>
                        <div className="space-y-1">
                          {section.instructors.map((instructor) => (
                            <div
                              key={instructor._id}
                              className="flex items-center justify-between bg-white p-2 rounded border"
                            >
                              <div>
                                <span className="text-sm font-medium text-green-700">
                                  {instructor.name}
                                </span>
                                <span className="text-xs text-green-600 ml-2">
                                  ({instructor.email})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeInstructorFromSection(
                                    section.sectionNumber,
                                    instructor._id
                                  )
                                }
                                className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
                                title="Remove instructor from this section"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn btn-primary px-6 py-3 font-medium"
          >
            <Home className="h-5 w-5 mr-2" />
            Create Room
          </button>

          <Link
            to={`/${encodeURIComponent(idOrName)}/dashboard`}
            className="btn btn-outline px-6 py-3 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
