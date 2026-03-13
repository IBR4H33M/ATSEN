// frontend/src/pages/institution/InstitutionRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Users,
  GraduationCap,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import api from "../../lib/axios.js";

export default function InstitutionRooms() {
  const { idOrName } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { roomId, roomName }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!idOrName) return;

    api.get(`/institutions/${encodeURIComponent(idOrName)}/rooms`)
      .then((response) => {
        console.log("=== ROOMS DATA ===");
        console.log("Rooms received:", response.data);
        response.data.forEach((room, index) => {
          console.log(`Room ${index}:`, {
            id: room._id,
            name: room.room_name,
            idLength: room._id?.length,
          });
        });
        setRooms(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading rooms:", err);
        setErrMsg(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [idOrName]);

  const handleDeleteClick = (roomId, roomName) => {
    setDeleteConfirm({ roomId, roomName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await api.delete(`/institutions/${encodeURIComponent(idOrName)}/rooms/${deleteConfirm.roomId}`);

      // Remove the deleted room from the rooms state
      setRooms((prevRooms) =>
        prevRooms.filter((room) => room._id !== deleteConfirm.roomId)
      );

      // Close confirmation dialog
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting room:", error);
      setErrMsg(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">Loading rooms...</div>
      </div>
    );
  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{errMsg}</div>
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
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              Rooms
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage your institution's rooms and courses
            </p>
          </div>
        </div>

        <Link
          to={`/${encodeURIComponent(idOrName)}/add-room`}
          className="btn btn-primary px-6 py-3 font-medium group"
        >
          <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Add Room
        </Link>
      </div>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-20 h-20 text-base-content/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-base-content/70 mb-2">
            No rooms found
          </h3>
          <p className="text-base-content/60 mb-6">
            Start by creating rooms for your institution.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-room`}
            className="btn btn-primary inline-flex items-center px-6 py-3 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create First Room
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const studentCount = Array.isArray(room.students)
              ? room.students.length
              : 0;
            const instructorCount = Array.isArray(room.instructors)
              ? room.instructors.length
              : 0;

            const formattedTime = room.createdAt
              ? new Date(room.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";

            return (
              <div
                key={room._id}
                className="card bg-base-100 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-blue-300 group p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-base-content group-hover:text-blue-700 mb-2 leading-tight">
                      {room.room_name}
                    </h3>

                    {room.description && (
                      <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-base-content/70 mb-2">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-base-content/40" />
                        <span>
                          {studentCount} student{studentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-base-content/40" />
                        <span>
                          {instructorCount} instructor
                          {instructorCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-base-content/60">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created: {formattedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-base-300">
                  <Link
                    to={`/${encodeURIComponent(idOrName)}/rooms/${
                      room._id
                    }/edit`}
                    className="btn btn-sm btn-outline btn-info flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(room._id, room.room_name)}
                    className="btn btn-sm btn-error flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card bg-base-100 p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-error mb-4">
              Confirm Delete
            </h2>
            <p className="text-base-content/70 mb-6">
              Are you sure you want to delete the room "{deleteConfirm.roomName}
              "? This action will remove the room from all students and
              instructors, and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btn btn-error"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
