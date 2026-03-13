import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { BarChart3, CheckCircle2, ClipboardList, MessageSquare, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/axios.js";

const KIND_META = {
  poll: { label: "Poll", icon: BarChart3, badge: "badge-primary" },
  qna: { label: "Q&A", icon: MessageSquare, badge: "badge-secondary" },
  evaluation: { label: "Evaluation", icon: Star, badge: "badge-accent" },
};

const DEFAULT_CREATE = {
  title: "",
  description: "",
  kind: "poll",
  optionsText: "",
  createdFor: "institution",
  targetRoomId: "",
  targetInstructorId: "",
};

function Modal({ open, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">{children}</div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default function FormsHub({ hideNavbar = false }) {
  const { user } = useAuth();
  const { idOrName, id } = useParams();
  const location = useLocation();

  const userId = user?._id || user?.id;
  const isStudent = user?.role === "student";
  const isInstitution = user?.role === "institution";
  const isInstructor = user?.role === "instructor";
  const canCreate = isInstitution || isInstructor;

  const isRoomContext = Boolean(id && location.pathname.includes("/room/"));
  const roomId = isRoomContext ? id : "";

  const inferredInstitutionSlug = useMemo(() => {
    if (idOrName && !isRoomContext) return idOrName;
    if (user?.role === "institution" && user?.slug) return user.slug;
    const firstInstitution = user?.institutions?.[0];
    if (typeof firstInstitution === "object" && firstInstitution?.slug) {
      return firstInstitution.slug;
    }
    return "";
  }, [idOrName, isRoomContext, user]);

  const [forms, setForms] = useState([]);
  const [activeFormId, setActiveFormId] = useState("");
  const [formDetail, setFormDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState(DEFAULT_CREATE);
  const [rooms, setRooms] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState(5);
  const [contentDeliveryRating, setContentDeliveryRating] = useState(5);
  const [recommendations, setRecommendations] = useState("");

  const buildListParams = useCallback(() => {
    const params = new URLSearchParams();
    if (roomId) params.append("roomId", roomId);
    if (inferredInstitutionSlug) params.append("institutionSlug", inferredInstitutionSlug);
    return params;
  }, [roomId, inferredInstitutionSlug]);

  const loadForms = useCallback(async (selectNewest = false) => {
    try {
      setLoadingList(true);
      const response = await api.get(`/forms?${buildListParams().toString()}`);
      const list = Array.isArray(response.data) ? response.data : [];
      setForms(list);

      if (list.length === 0) {
        setActiveFormId("");
        setFormDetail(null);
      } else if (selectNewest || !activeFormId || !list.some((f) => f._id === activeFormId)) {
        setActiveFormId(list[0]._id);
      }
    } catch (error) {
      console.error("Failed to load forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setLoadingList(false);
    }
  }, [activeFormId, buildListParams]);

  const loadFormDetail = useCallback(async (formId) => {
    if (!formId) {
      setFormDetail(null);
      return;
    }

    try {
      setLoadingDetail(true);
      const response = await api.get(`/forms/${formId}`);
      setFormDetail(response.data);
    } catch (error) {
      console.error("Failed to load form detail:", error);
      toast.error("Failed to load form details");
      setFormDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadForms(true);
  }, [user, loadForms]);

  useEffect(() => {
    loadFormDetail(activeFormId);
  }, [activeFormId, loadFormDetail]);

  useEffect(() => {
    const loadCreateContext = async () => {
      if (!canCreate || !inferredInstitutionSlug) return;
      try {
        const [roomsRes, instructorRes] = await Promise.all([
          api.get(`/institutions/${encodeURIComponent(inferredInstitutionSlug)}/rooms`),
          api.get(`/institutions/${encodeURIComponent(inferredInstitutionSlug)}/instructors`),
        ]);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setInstructors(Array.isArray(instructorRes.data) ? instructorRes.data : []);
      } catch (error) {
        console.error("Failed to load form creation context:", error);
      }
    };

    loadCreateContext();
  }, [canCreate, inferredInstitutionSlug]);

  const hasResponded = useMemo(() => {
    if (!isStudent || !formDetail || !userId) return false;
    return (formDetail.responses || []).some((r) => String(r.studentId?._id || r.studentId) === String(userId));
  }, [formDetail, isStudent, userId]);

  const createForm = async (event) => {
    event.preventDefault();
    if (!createData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const options =
      createData.kind === "poll"
        ? createData.optionsText
            .split("\n")
            .map((line, i) => ({ id: String(i + 1), label: line.trim() }))
            .filter((o) => o.label)
        : [];

    if (createData.kind === "poll" && options.length < 2) {
      toast.error("Poll must have at least two options");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/forms", {
        title: createData.title.trim(),
        description: createData.description.trim(),
        kind: createData.kind,
        options,
        createdFor: createData.createdFor,
        targetRoomId: createData.createdFor === "room" ? createData.targetRoomId || roomId : undefined,
        targetInstructorId: createData.kind === "evaluation" ? createData.targetInstructorId || undefined : undefined,
        institutionSlug: inferredInstitutionSlug,
        createdBy: userId,
      });

      toast.success("Form created");
      setShowCreateModal(false);
      setCreateData(DEFAULT_CREATE);
      await loadForms(true);
    } catch (error) {
      console.error("Create form failed:", error);
      toast.error(error.response?.data?.message || "Failed to create form");
    } finally {
      setSubmitting(false);
    }
  };

  const submitResponse = async () => {
    if (!formDetail || !userId || !isStudent) return;

    const kind = formDetail.poll.kind;
    if (kind === "poll" && !selectedOptionId) {
      toast.error("Pick an option");
      return;
    }
    if (kind === "qna" && !textAnswer.trim()) {
      toast.error("Write an answer");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/forms/${formDetail.poll._id}/vote`, {
        studentId: userId,
        studentName: user?.name || "Student",
        optionId: selectedOptionId || undefined,
        textAnswer: textAnswer.trim() || undefined,
        targetInstructorId: formDetail.poll.targetInstructorId?._id || undefined,
        satisfactionLevel,
        contentDeliveryRating,
        recommendations: recommendations.trim() || undefined,
      });

      toast.success("Response submitted");
      setSelectedOptionId("");
      setTextAnswer("");
      setRecommendations("");
      setSatisfactionLevel(5);
      setContentDeliveryRating(5);
      await loadFormDetail(formDetail.poll._id);
      await loadForms();
    } catch (error) {
      console.error("Submit response failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteForm = async (formId) => {
    if (!isInstitution) return;
    const ok = window.confirm("Delete this form and all responses?");
    if (!ok) return;

    try {
      await api.delete(`/forms/${formId}`);
      toast.success("Form deleted");
      await loadForms(true);
    } catch (error) {
      console.error("Delete form failed:", error);
      toast.error("Failed to delete form");
    }
  };

  const renderStudentInput = () => {
    if (!isStudent || !formDetail) return null;

    if (hasResponded) {
      return (
        <div className="alert alert-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>You already responded to this form.</span>
        </div>
      );
    }

    const kind = formDetail.poll.kind;

    if (kind === "poll") {
      return (
        <div className="space-y-3">
          {formDetail.poll.options.map((option) => (
            <label key={option.id} className="flex items-center gap-3 rounded-xl border border-base-300 p-3 hover:bg-base-200 cursor-pointer">
              <input
                type="radio"
                className="radio radio-primary"
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (kind === "qna") {
      return (
        <textarea
          className="textarea textarea-bordered w-full min-h-28"
          placeholder="Write your answer"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
        />
      );
    }

    return (
      <div className="space-y-4">
        <label className="form-control">
          <span className="label-text mb-1">Overall satisfaction: {satisfactionLevel}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={satisfactionLevel}
            onChange={(e) => setSatisfactionLevel(Number(e.target.value))}
            className="range range-primary"
          />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Content delivery: {contentDeliveryRating}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={contentDeliveryRating}
            onChange={(e) => setContentDeliveryRating(Number(e.target.value))}
            className="range range-secondary"
          />
        </label>
        <textarea
          className="textarea textarea-bordered w-full min-h-24"
          placeholder="Optional recommendation"
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
        />
      </div>
    );
  };

  const renderCreatorSummary = () => {
    if (!(isInstitution || isInstructor) || !formDetail) return null;

    const responses = formDetail.responses || [];
    const total = responses.length;

    if (formDetail.poll.kind === "poll") {
      return (
        <div className="space-y-2">
          {formDetail.poll.options.map((option) => {
            const count = responses.filter((r) => r.optionId === option.id).length;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{option.label}</span>
                  <span className="text-base-content/70">{count} ({pct}%)</span>
                </div>
                <progress className="progress progress-primary w-full" value={pct} max={100} />
              </div>
            );
          })}
        </div>
      );
    }

    if (formDetail.poll.kind === "qna") {
      return (
        <div className="space-y-2 max-h-72 overflow-auto pr-1">
          {total === 0 ? <p className="text-sm text-base-content/60">No responses yet.</p> : null}
          {responses.map((r) => (
            <div key={r._id} className="rounded-lg border border-base-300 p-3 bg-base-100">
              <div className="text-xs text-base-content/60 mb-1">{r.studentName || "Student"}</div>
              <p className="text-sm">{r.textAnswer || "-"}</p>
            </div>
          ))}
        </div>
      );
    }

    const avgSatisfaction = total
      ? (responses.reduce((sum, r) => sum + (r.satisfactionLevel || 0), 0) / total).toFixed(1)
      : "0.0";
    const avgDelivery = total
      ? (responses.reduce((sum, r) => sum + (r.contentDeliveryRating || 0), 0) / total).toFixed(1)
      : "0.0";

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-base-300 bg-base-100 p-4">
          <div className="text-sm text-base-content/60">Avg Satisfaction</div>
          <div className="text-2xl font-semibold">{avgSatisfaction}</div>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-100 p-4">
          <div className="text-sm text-base-content/60">Avg Delivery</div>
          <div className="text-2xl font-semibold">{avgDelivery}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {!hideNavbar ? <Navbar /> : null}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-primary" />
              Forms Hub
            </h1>
            <p className="text-sm text-base-content/70 mt-1">Minimal, focused forms and response workflow.</p>
          </div>
          {canCreate ? (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              New Form
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="card bg-base-100 border border-base-300 lg:col-span-1">
            <div className="card-body p-4">
              <h2 className="font-semibold mb-2">Forms</h2>
              {loadingList ? <div className="loading loading-spinner text-primary" /> : null}
              {!loadingList && forms.length === 0 ? (
                <p className="text-sm text-base-content/60">No forms available.</p>
              ) : null}
              <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                {forms.map((form) => {
                  const meta = KIND_META[form.kind] || KIND_META.poll;
                  const Icon = meta.icon;
                  const active = activeFormId === form._id;
                  return (
                    <button
                      key={form._id}
                      className={`w-full text-left rounded-xl border p-3 transition ${
                        active ? "border-primary bg-primary/10" : "border-base-300 hover:bg-base-200"
                      }`}
                      onClick={() => setActiveFormId(form._id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{form.title}</div>
                          <div className="text-xs text-base-content/60 mt-1">{new Date(form.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon className="h-4 w-4" />
                          <span className={`badge badge-sm ${meta.badge}`}>{meta.label}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 lg:col-span-2">
            <div className="card-body p-5">
              {!activeFormId ? (
                <div className="h-64 flex items-center justify-center text-base-content/60">Select a form to continue.</div>
              ) : loadingDetail ? (
                <div className="h-64 flex items-center justify-center"><span className="loading loading-spinner text-primary" /></div>
              ) : formDetail ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{formDetail.poll.title}</h3>
                        <span className={`badge ${(KIND_META[formDetail.poll.kind] || KIND_META.poll).badge}`}>
                          {(KIND_META[formDetail.poll.kind] || KIND_META.poll).label}
                        </span>
                      </div>
                      {formDetail.poll.description ? <p className="text-sm text-base-content/70 mt-2">{formDetail.poll.description}</p> : null}
                    </div>
                    {isInstitution ? (
                      <button className="btn btn-error btn-outline btn-sm" onClick={() => deleteForm(formDetail.poll._id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-base-300 p-4 bg-base-200/40">
                    {renderStudentInput()}
                    {isStudent && !hasResponded ? (
                      <button className="btn btn-primary mt-4" disabled={submitting} onClick={submitResponse}>
                        {submitting ? "Submitting..." : "Submit Response"}
                      </button>
                    ) : null}
                  </div>

                  {(isInstitution || isInstructor) ? (
                    <div className="rounded-xl border border-base-300 p-4 bg-base-200/40">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Response Insights</h4>
                        <span className="text-sm text-base-content/70">{(formDetail.responses || []).length} responses</span>
                      </div>
                      {renderCreatorSummary()}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-base-content/60">Unable to load form details.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h3 className="font-semibold text-lg mb-4">Create New Form</h3>
        <form className="space-y-4" onSubmit={createForm}>
          <label className="form-control">
            <span className="label-text mb-1">Title</span>
            <input
              className="input input-bordered"
              value={createData.title}
              onChange={(e) => setCreateData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Enter a clear title"
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Description</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={createData.description}
              onChange={(e) => setCreateData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional context"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label-text mb-1">Form Type</span>
              <select
                className="select select-bordered"
                value={createData.kind}
                onChange={(e) => setCreateData((p) => ({ ...p, kind: e.target.value }))}
              >
                <option value="poll">Poll</option>
                <option value="qna">Q&A</option>
                <option value="evaluation">Evaluation</option>
              </select>
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Scope</span>
              <select
                className="select select-bordered"
                value={createData.createdFor}
                onChange={(e) => setCreateData((p) => ({ ...p, createdFor: e.target.value }))}
              >
                <option value="institution">Institution</option>
                <option value="room">Room</option>
              </select>
            </label>
          </div>

          {createData.createdFor === "room" ? (
            <label className="form-control">
              <span className="label-text mb-1">Target Room</span>
              <select
                className="select select-bordered"
                value={createData.targetRoomId}
                onChange={(e) => setCreateData((p) => ({ ...p, targetRoomId: e.target.value }))}
                required
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>{room.room_name}</option>
                ))}
              </select>
            </label>
          ) : null}

          {createData.kind === "evaluation" ? (
            <label className="form-control">
              <span className="label-text mb-1">Target Instructor (optional)</span>
              <select
                className="select select-bordered"
                value={createData.targetInstructorId}
                onChange={(e) => setCreateData((p) => ({ ...p, targetInstructorId: e.target.value }))}
              >
                <option value="">All instructors</option>
                {instructors.map((ins) => (
                  <option key={ins._id} value={ins._id}>{ins.name} ({ins.email})</option>
                ))}
              </select>
            </label>
          ) : null}

          {createData.kind === "poll" ? (
            <label className="form-control">
              <span className="label-text mb-1">Options (one per line)</span>
              <textarea
                className="textarea textarea-bordered min-h-24"
                value={createData.optionsText}
                onChange={(e) => setCreateData((p) => ({ ...p, optionsText: e.target.value }))}
                placeholder={"Option A\nOption B\nOption C"}
              />
            </label>
          ) : null}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
