import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, FileText, Check } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";

const S_QuizDetail = () => {
  const { id, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [quizGrade, setQuizGrade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentDetails();
    fetchMyQuizGrade();
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      setAssessment(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to fetch assessment details");
    }
  };

  const fetchMyQuizGrade = async () => {
    try {
      const response = await api.get(`/quiz-grades/${assessmentId}/my-grade`);
      setQuizGrade(response.data);
    } catch (error) {
      console.error("Error fetching quiz grade:", error);
      // Don't show error toast for 404 - just means not graded yet
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch quiz grade");
      }
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Status */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Your Grade</h2>

              {quizGrade ? (
                <div className="space-y-4">
                  {quizGrade.isGraded ? (
                    <>
                      <div className="alert alert-success">
                        <Check className="h-5 w-5" />
                        <span>Graded on {formatDate(quizGrade.gradedAt)}</span>
                      </div>

                      {/* Grading Information */}
                      <div className="card bg-success/10 border border-success/20">
                        <div className="card-body">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-success">
                              Your Score
                            </h3>
                            <div className="text-sm text-base-content/60">
                              Graded on {formatDate(quizGrade.gradedAt)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm font-medium mb-2">Score:</p>
                              <div className="text-3xl font-bold text-success">
                                {quizGrade.marks}/
                                {quizGrade.maxMarks || getMaxMarks()}
                              </div>
                              <div className="text-sm text-base-content/60 mt-1">
                                {(
                                  (quizGrade.marks /
                                    (quizGrade.maxMarks || getMaxMarks())) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>

                            {quizGrade.teacherFeedback && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Teacher Feedback:
                                </p>
                                <div className="bg-base-100 p-3 rounded border">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {quizGrade.teacherFeedback}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-warning">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Quiz grade not available yet</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-info">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Quiz grade not available yet</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Information */}
          <div className="card bg-base-100 shadow-lg mt-6">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Quiz Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Quiz Title:</p>
                  <p className="text-base">{assessment.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date:</p>
                  <p className="text-base">{formatDate(assessment.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Maximum Marks:</p>
                  <p className="text-base">{getMaxMarks()} marks</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Type:</p>
                  <p className="text-base">
                    {getTypeLabel(assessment.assessmentType)}
                  </p>
                </div>
              </div>

              {assessment.description && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Description:</p>
                  <div className="bg-base-200 p-3 rounded">
                    <p className="text-sm whitespace-pre-wrap">
                      {assessment.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_QuizDetail;
