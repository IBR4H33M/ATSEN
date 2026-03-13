import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, FileText, Upload, X, Check } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";

const S_AssignmentDetail = () => {
  const { id, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    file: null,
    comments: "",
    studentName: "",
    studentEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessmentDetails();
    fetchMySubmission();
    fetchCurrentStudent();
  }, [assessmentId]);

  const fetchCurrentStudent = async () => {
    try {
      const response = await api.get("/submissions/current-student");
      setSubmissionData((prev) => ({
        ...prev,
        studentName: response.data.name || "Unknown Student",
        studentEmail: response.data.email || "No Email",
      }));
    } catch (error) {
      console.error("Error fetching student info:", error);
      setSubmissionData((prev) => ({
        ...prev,
        studentName: "Loading...",
        studentEmail: "Loading...",
      }));
    }
  };

  const fetchAssessmentDetails = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      setAssessment(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to fetch assessment details");
    }
  };

  const fetchMySubmission = async () => {
    try {
      const response = await api.get(
        `/submissions/${assessmentId}/my-submission`
      );
      setSubmission(response.data);
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submissionData.file) {
      toast.error("Please select a PDF file");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", submissionData.file);
      formData.append("comments", submissionData.comments);

      const response = await api.post(
        `/submissions/${assessmentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSubmission(response.data);
      setShowSubmissionForm(false);
      setSubmissionData({
        file: null,
        comments: "",
        studentName: "",
        studentEmail: "",
      });
      toast.success("Assignment submitted successfully!");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
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

  const isOverdue = () => {
    return new Date() > new Date(assessment.date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-8">
        <p>Assessment not found</p>
        <Link
          to={`/student/room/${id}/assessment`}
          className="btn btn-primary mt-4"
        >
          Back to Assessments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to={`/student/room/${id}/assessment`}
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
                      {isOverdue() && (
                        <span className="badge badge-error">Overdue</span>
                      )}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Your Submission</h2>

              {submission ? (
                <div className="space-y-4">
                  <div className="alert alert-success">
                    <Check className="h-5 w-5" />
                    <span>
                      Submitted on {formatDate(submission.submittedAt)}
                    </span>
                  </div>

                  {/* Grading Information */}
                  {submission.isGraded && (
                    <div className="card bg-success/10 border border-success/20">
                      <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-success">
                            Graded
                          </h3>
                          <div className="text-sm text-base-content/60">
                            Graded on {formatDate(submission.gradedAt)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Your Score:
                            </p>
                            <div className="text-3xl font-bold text-success">
                              {submission.marks}/
                              {submission.maxMarks ||
                                getMaxMarks(assessment.assessmentType)}
                            </div>
                            <div className="text-sm text-base-content/60 mt-1">
                              {(
                                (submission.marks /
                                  (submission.maxMarks ||
                                    getMaxMarks(assessment.assessmentType))) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          </div>

                          {submission.teacherFeedback && (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                Teacher Feedback:
                              </p>
                              <div className="bg-base-100 p-3 rounded border">
                                <p className="text-sm whitespace-pre-wrap">
                                  {submission.teacherFeedback}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-base-300 rounded-lg p-4">
                    {submission.fileName && (
                      <div className="mb-3">
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
                          className="btn btn-primary btn-sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Download {submission.fileName}
                        </button>
                      </div>
                    )}

                    {submission.comments && (
                      <div>
                        <p className="font-medium mb-2">Your Comments:</p>
                        <p className="text-base-content/70">
                          {submission.comments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="alert alert-warning">
                    <Calendar className="h-5 w-5" />
                    <span>Not submitted yet</span>
                  </div>

                  {!showSubmissionForm ? (
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="btn btn-primary"
                      disabled={isOverdue()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit {getTypeLabel(assessment.assessmentType)}
                    </button>
                  ) : (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            Submit Your Work
                          </h3>
                          <button
                            onClick={() => setShowSubmissionForm(false)}
                            className="btn btn-ghost btn-sm btn-circle"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="alert alert-info mb-4">
                            <div>
                              <div className="font-semibold">
                                Submitting as:
                              </div>
                              <div>
                                {submissionData.studentName || "Loading..."}(
                                {submissionData.studentEmail || "Loading..."})
                              </div>
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Upload PDF File *
                              </span>
                            </label>
                            <input
                              type="file"
                              accept=".pdf"
                              className="file-input file-input-bordered"
                              onChange={(e) =>
                                setSubmissionData({
                                  ...submissionData,
                                  file: e.target.files[0],
                                })
                              }
                              required
                            />
                            {submissionData.file && (
                              <div className="text-sm text-base-content/60 mt-1">
                                Selected: {submissionData.file.name}
                              </div>
                            )}
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Comments (Optional)
                              </span>
                            </label>
                            <textarea
                              placeholder="Add any comments about your submission..."
                              className="textarea textarea-bordered h-24"
                              value={submissionData.comments}
                              onChange={(e) =>
                                setSubmissionData({
                                  ...submissionData,
                                  comments: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <div className="loading loading-spinner loading-sm"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Submit
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSubmissionForm(false)}
                              className="btn btn-ghost"
                              disabled={submitting}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_AssignmentDetail;
