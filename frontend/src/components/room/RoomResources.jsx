import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Link2, Pencil, Plus, Trash2, Video } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

const DEFAULT_FORM = {
  title: "",
  type: "link",
  url: "",
  content: "",
};

function ResourceModal({ open, data, onClose, onChange, onSubmit, submitting, editing }) {
  if (!open) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-semibold text-lg mb-4">{editing ? "Edit Resource" : "Add Resource"}</h3>
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="form-control">
            <span className="label-text mb-1">Title</span>
            <input className="input input-bordered" value={data.title} onChange={(e) => onChange("title", e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Type</span>
            <select className="select select-bordered" value={data.type} onChange={(e) => onChange("type", e.target.value)}>
              <option value="link">Link</option>
              <option value="youtube">YouTube</option>
              <option value="pdf">PDF</option>
              <option value="doc">Document</option>
              <option value="slides">Slides</option>
              <option value="sheet">Sheet</option>
              <option value="text">Text Note</option>
            </select>
          </label>
          {data.type === "text" ? (
            <label className="form-control">
              <span className="label-text mb-1">Content</span>
              <textarea className="textarea textarea-bordered min-h-24" value={data.content} onChange={(e) => onChange("content", e.target.value)} />
            </label>
          ) : (
            <label className="form-control">
              <span className="label-text mb-1">URL</span>
              <input className="input input-bordered" value={data.url} onChange={(e) => onChange("url", e.target.value)} required />
            </label>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default function RoomResources({ roomId, user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editing, setEditing] = useState(null);

  const canManage = user?.role === "instructor";

  const grouped = useMemo(() => {
    return {
      videos: resources.filter((r) => r.type === "youtube"),
      docs: resources.filter((r) => r.type !== "youtube"),
    };
  }, [resources]);

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/room-resources/room/${roomId}`);
      setResources(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) loadResources();
  }, [roomId, loadResources]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) return;

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        type: form.type,
        url: form.url.trim() || undefined,
        content: form.content.trim() || undefined,
      };

      if (editing?._id) {
        await api.put(`/room-resources/${editing._id}`, payload);
        toast.success("Resource updated");
      } else {
        await api.post(`/room-resources/room/${roomId}`, payload);
        toast.success("Resource added");
      }

      setOpenModal(false);
      setForm(DEFAULT_FORM);
      setEditing(null);
      await loadResources();
    } catch (error) {
      console.error("Resource save failed:", error);
      toast.error(error.response?.data?.message || "Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const startAdd = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setOpenModal(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      type: item.type || "link",
      url: item.url || "",
      content: item.content || "",
    });
    setOpenModal(true);
  };

  const remove = async (itemId) => {
    if (!canManage) return;
    if (!window.confirm("Delete this resource?")) return;

    try {
      await api.delete(`/room-resources/${itemId}`);
      setResources((prev) => prev.filter((r) => r._id !== itemId));
      toast.success("Resource deleted");
    } catch (error) {
      console.error("Resource delete failed:", error);
      toast.error("Failed to delete resource");
    }
  };

  const iconFor = (type) => (type === "youtube" ? <Video className="h-4 w-4 text-error" /> : <FileText className="h-4 w-4 text-primary" />);

  const renderGroup = (title, items) => (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="badge badge-neutral badge-sm">{items.length}</span>
        </div>
        {items.length === 0 ? <p className="text-sm text-base-content/60">No resources yet.</p> : null}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-base-300 p-3 hover:bg-base-200 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {iconFor(item.type)}
                    <h4 className="font-medium truncate">{item.title}</h4>
                  </div>
                  {item.url ? (
                    <a className="text-sm text-primary inline-flex items-center gap-1 mt-1 break-all" href={item.url} target="_blank" rel="noreferrer">
                      <Link2 className="h-3 w-3" />
                      {item.url}
                    </a>
                  ) : (
                    <p className="text-sm text-base-content/70 mt-1 whitespace-pre-wrap">{item.content || "-"}</p>
                  )}
                </div>
                {canManage ? (
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => startEdit(item)}><Pencil className="h-3 w-3" /></button>
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(item._id)}><Trash2 className="h-3 w-3" /></button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) {
    return <div className="py-8 text-center"><span className="loading loading-spinner text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Room Resources</h2>
          <p className="text-sm text-base-content/70">Curated links and documents for this room.</p>
        </div>
        {canManage ? (
          <button className="btn btn-primary" onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderGroup("Videos", grouped.videos)}
        {renderGroup("Documents and Links", grouped.docs)}
      </div>

      <ResourceModal
        open={openModal}
        editing={!!editing}
        data={form}
        submitting={submitting}
        onClose={() => setOpenModal(false)}
        onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
