import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, FileText, User, Edit, Save, X } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";

const T_QuizDetail = () => {
  const { id, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingStudent, setGradingStudent] = useState(null);
  const [gradingData, setGradingData] = useState({
    marks: "",
    teacherFeedback: "",
  });

  console.log("T_QuizDetail component loaded");
  console.log("T_QuizDetail params:", { id, assessmentId });

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
      fetchQuizGrades();
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

  const fetchQuizGrades = async () => {
    try {
      console.log("Fetching quiz grades for assessment ID:", assessmentId);
      const response = await api.get(`/quiz-grades/${assessmentId}/grades`);
      console.log("Quiz grades response:", response.data);
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching quiz grades:", error);
      setError(`Failed to fetch quiz grades: ${error.message}`);
      toast.error("Failed to fetch quiz grades");
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
      case "quiz":
        return "Quiz";
      default:
        return type;
    }
  };

  const getMaxMarks = () => {
    return 15; // Fixed for quiz
  };

  const handleStartGrading = (studentData) => {
    setGradingStudent(studentData.student._id);
    setGradingData({
      marks: studentData.marks || "",
      teacherFeedback: studentData.teacherFeedback || "",
    });
  };

  const handleCancelGrading = () => {
    setGradingStudent(null);
    setGradingData({ marks: "", teacherFeedback: "" });
  };

  const handleGradeQuiz = async (studentId) => {
    try {
      const maxMarks = getMaxMarks();

      if (
        !gradingData.marks ||
        gradingData.marks < 0 ||
        gradingData.marks > maxMarks
      ) {
        toast.error(`Marks must be between 0 and ${maxMarks}`);
        return;
      }

      // Check if student already has a grade (for update vs create)
      const existingGrade = grades.find(
        (g) => g.student._id === studentId && g._id
      );

      let response;
      if (existingGrade) {
        // Update existing grade
        response = await api.put(`/quiz-grades/grade/${existingGrade._id}`, {
          marks: parseFloat(gradingData.marks),
          teacherFeedback: gradingData.teacherFeedback,
        });
      } else {
        // Create new grade
        response = await api.post(
          `/quiz-grades/${assessmentId}/grade/${studentId}`,
          {
            marks: parseFloat(gradingData.marks),
            teacherFeedback: gradingData.teacherFeedback,
          }
        );
      }

      toast.success("Quiz graded successfully!");
      setGradingStudent(null);
      setGradingData({ marks: "", teacherFeedback: "" });
      fetchQuizGrades(); // Refresh grades
    } catch (error) {
      console.error("Error grading quiz:", error);
      toast.error("Failed to grade quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading quiz details...</p>
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
                        <span>Date: {formatDate(assessment.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{grades.length} students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Grades */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Student Grades</h2>

              {grades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base-content/60">
                    No students enrolled in this room
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grades.map((gradeData, index) => (
                    <div
                      key={gradeData.student._id || index}
                      className="border border-base-300 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              <span className="text-lg font-bold">
                                {gradeData.student?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold">
                                {gradeData.student?.name || "Unknown Student"}
                              </h3>
                              {gradeData.isGraded && (
                                <div className="badge badge-success">
                                  {gradeData.marks}/{getMaxMarks()}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-base-content/60">
                              {gradeData.student?.email || "No email"}
                            </p>
                            {gradeData.isGraded && (
                              <div className="flex items-center gap-1 text-sm text-base-content/60 mt-1">
                                <span>
                                  Graded on {formatDate(gradeData.gradedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {gradingStudent === gradeData.student._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleGradeQuiz(gradeData.student._id)
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
                              onClick={() => handleStartGrading(gradeData)}
                              className="btn btn-primary btn-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {gradeData.isGraded ? "Edit Grade" : "Grade"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grading Interface */}
                      {gradingStudent === gradeData.student._id && (
                        <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                          <h4 className="font-semibold mb-3">Grade Quiz</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text">
                                  Marks (out of {getMaxMarks()})
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={getMaxMarks()}
                                step="0.5"
                                className="input input-bordered w-full"
                                value={gradingData.marks}
                                onChange={(e) =>
                                  setGradingData((prev) => ({
                                    ...prev,
                                    marks: e.target.value,
                                  }))
                                }
                                placeholder={`Enter marks (0-${getMaxMarks()})`}
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
                      {gradeData.isGraded &&
                        gradingStudent !== gradeData.student._id && (
                          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-success">
                                Graded
                              </h4>
                              <div className="text-sm text-base-content/60">
                                Graded on {formatDate(gradeData.gradedAt)}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Score:
                                </p>
                                <div className="text-lg font-bold text-success">
                                  {gradeData.marks}/{getMaxMarks()}
                                </div>
                                <div className="text-sm text-base-content/60 mt-1">
                                  {(
                                    (gradeData.marks / getMaxMarks()) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </div>
                              </div>
                              {gradeData.teacherFeedback && (
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    Teacher Feedback:
                                  </p>
                                  <p className="text-sm">
                                    {gradeData.teacherFeedback}
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

export default T_QuizDetail;
