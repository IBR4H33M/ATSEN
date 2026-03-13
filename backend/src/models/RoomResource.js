import mongoose from "mongoose";

const roomResourceSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["youtube", "slides", "text", "pdf", "doc", "sheet", "link"],
      required: true,
    },
    url: { type: String },
    content: { type: String },
    order: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: false,
      default: undefined,
    },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: false },
  },
  { timestamps: true }
);

const RoomResource = mongoose.models.RoomResource || mongoose.model("RoomResource", roomResourceSchema);

export default RoomResource;
