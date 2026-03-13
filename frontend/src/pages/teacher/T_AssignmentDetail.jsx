import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  FileText,
  User,
  Download,
  Clock,
  Edit,
  Save,
  X,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";

const T_AssignmentDetail = () => {
  const { id, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({
    marks: "",
    teacherFeedback: "",
  });

  console.log("T_AssignmentDetail component loaded");
  console.log("T_AssignmentDetail params:", { id, assessmentId });

  // Early return for debugging
  if (!id || !assessmentId) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4 text-error">Missing required parameters</p>
          <p className="text-sm mb-4">
            Room ID: {id || "missing"}, Assessment ID:{" "}
            {assessmentId || "missing"}
          </p>
          <Link to="/teacher/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentDetails();
      fetchSubmissions();
    } else {
      setError("No assessment ID provided");
      setLoading(false);
    }
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      console.log("Fetching assessment details for ID:", assessmentId);
      const response = await api.get(`/assessments/${assessmentId}`);
      console.log("Assessment response:", response.data);
      setAssessment(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError(`Failed to fetch assessment: ${error.message}`);
      toast.error("Failed to fetch assessment details");
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      console.log("Fetching submissions for assessment ID:", assessmentId);
      const response = await api.get(
        `/submissions/${assessmentId}/submissions`
      );
      console.log("Submissions response:", response.data);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(`Failed to fetch submissions: ${error.message}`);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "assignment":
        return "Assignment";
      case "project":
        return "Project";
      default:
        return type;
    }
  };

  const getMaxMarks = (assessmentType) => {
    return assessmentType === "assignment"
      ? 10
      : assessmentType === "project"
      ? 15
      : 10;
  };

  const handleStartGrading = (submission) => {
    setGradingSubmission(submission._id);
    setGradingData({
      marks: submission.marks || "",
      teacherFeedback: submission.teacherFeedback || "",
    });
  };

  const handleCancelGrading = () => {
    setGradingSubmission(null);
    setGradingData({ marks: "", teacherFeedback: "" });
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      const maxMarks = getMaxMarks(assessment.assessmentType);

      if (
        !gradingData.marks ||
        gradingData.marks < 0 ||
        gradingData.marks > maxMarks
      ) {
        toast.error(`Marks must be between 0 and ${maxMarks}`);
        return;
      }

      const endpoint = submissions.find((s) => s._id === submissionId)?.isGraded
        ? `/submissions/grade/${submissionId}`
        : `/submissions/grade/${submissionId}`;

      const method = submissions.find((s) => s._id === submissionId)?.isGraded
        ? "put"
        : "post";

      await api[method](endpoint, {
        marks: parseFloat(gradingData.marks),
        teacherFeedback: gradingData.teacherFeedback,
      });

      toast.success("Submission graded successfully!");
      setGradingSubmission(null);
      setGradingData({ marks: "", teacherFeedback: "" });
      fetchSubmissions(); // Refresh submissions
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4 text-error">{error}</p>
          <Link
            to={`/teacher/room/${id}/assessment`}
            className="btn btn-primary"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Assessment not found</p>
          <Link
            to={`/teacher/room/${id}/assessment`}
            className="btn btn-primary"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to={`/teacher/room/${id}/assessment`}
              className="btn btn-ghost btn-sm mb-4"
            >
              &lt; Back to Assessments
            </Link>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="badge badge-primary">
                        {getTypeLabel(assessment.assessmentType)}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">
                      {assessment.title}
                    </h1>
                    <p className="text-base-content/70 mb-4 whitespace-pre-wrap">
                      {assessment.description}
                    </p>

                    {assessment.topics && assessment.topics.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium mb-2">Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {assessment.topics.map((topic, index) => (
                            <span key={index} className="badge badge-outline">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-base-content/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assessment.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{submissions.length} submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Student Submissions</h2>

              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-base-content/70 mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-base-content/50">
                    Students haven't submitted their work yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="border border-base-300 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span className="text-sm">
                                {submission.student?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold">
                                {submission.student?.name || "Unknown Student"}
                              </h3>
                              {submission.isGraded && (
                                <div className="badge badge-success">
                                  {submission.marks}/
                                  {getMaxMarks(assessment.assessmentType)}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-base-content/60">
                              {submission.student?.email || "No email"}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-base-content/60 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Submitted {formatDate(submission.submittedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {submission.fileName && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await api.get(
                                    `/submissions/download/${submission._id}`,
                                    {
                                      responseType: "blob",
                                    }
                                  );
                                  const blob = new Blob([response.data]);
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = submission.fileName;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error("Download error:", error);
                                  toast.error("Download failed");
                                }
                              }}
                              className="btn btn-outline btn-sm"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          )}

                          {gradingSubmission === submission._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleGradeSubmission(submission._id)
                                }
                                className="btn btn-success btn-sm"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelGrading}
                                className="btn btn-error btn-sm"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartGrading(submission)}
                              className="btn btn-primary btn-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {submission.isGraded ? "Edit Grade" : "Grade"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Student Comments */}
                      {submission.comments && (
                        <div className="mt-3 p-3 bg-base-200 rounded">
                          <p className="text-sm font-medium mb-1">
                            Student Comments:
                          </p>
                          <p className="text-sm">{submission.comments}</p>
                        </div>
                      )}

                      {/* Grading Interface */}
                      {gradingSubmission === submission._id && (
                        <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                          <h4 className="font-semibold mb-3">
                            Grade Submission
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text">
                                  Marks (out of{" "}
                                  {getMaxMarks(assessment.assessmentType)})
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={getMaxMarks(assessment.assessmentType)}
                                step="0.5"
                                className="input input-bordered w-full"
                                value={gradingData.marks}
                                onChange={(e) =>
                                  setGradingData((prev) => ({
                                    ...prev,
                                    marks: e.target.value,
                                  }))
                                }
                                placeholder={`Enter marks (0-${getMaxMarks(
                                  assessment.assessmentType
                                )})`}
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">
                                  Teacher Feedback
                                </span>
                              </label>
                              <textarea
                                className="textarea textarea-bordered w-full"
                                rows="3"
                                value={gradingData.teacherFeedback}
                                onChange={(e) =>
                                  setGradingData((prev) => ({
                                    ...prev,
                                    teacherFeedback: e.target.value,
                                  }))
                                }
                                placeholder="Enter your feedback for the student..."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display existing grade and feedback */}
                      {submission.isGraded &&
                        gradingSubmission !== submission._id && (
                          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-success">
                                Graded
                              </h4>
                              <div className="text-sm text-base-content/60">
                                Graded on {formatDate(submission.gradedAt)}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Score:
                                </p>
                                <div className="text-lg font-bold text-success">
                                  {submission.marks}/
                                  {submission.maxMarks ||
                                    getMaxMarks(assessment.assessmentType)}
                                </div>
                              </div>
                              {submission.teacherFeedback && (
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    Teacher Feedback:
                                  </p>
                                  <p className="text-sm">
                                    {submission.teacherFeedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T_AssignmentDetail;
