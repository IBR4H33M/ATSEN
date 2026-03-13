import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    kind: { type: String, enum: ["poll", "qna", "evaluation"], default: "poll" },
    options: [
      {
        id: { type: String },
        label: { type: String },
      },
    ],
    customQuestions: [
      {
        type: { type: String, enum: ["slider", "multiple_choice", "text"] },
        question: { type: String },
        min: { type: Number },
        max: { type: Number },
        options: [{ type: String }],
      },
    ],
    targetInstructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
    targetInstructorName: { type: String },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    institutionSlug: { type: String },
    createdFor: { type: String, enum: ["institution", "room", "global"], default: "institution" },
    targetRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const formResponseSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "FormEntry", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String },
    optionId: { type: String },
    textAnswer: { type: String },
    targetInstructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
    satisfactionLevel: { type: Number, min: 1, max: 10 },
    contentDeliveryRating: { type: Number, min: 1, max: 10 },
    recommendations: { type: String },
    customResponses: [
      {
        questionIndex: { type: Number },
        questionType: { type: String },
        value: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

export const FormResponse = mongoose.models.FormResponse || mongoose.model("FormResponse", formResponseSchema);

const FormEntry = mongoose.models.FormEntry || mongoose.model("FormEntry", formSchema);

export default FormEntry;
