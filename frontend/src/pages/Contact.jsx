import { useState } from "react";
import { Mail, Send, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../lib/axios";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/contact/messages", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSuccess("Message sent successfully. Our team will get back to you.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-2 text-sm text-base-content/70 hover:bg-base-100 hover:text-base-content transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mt-6 rounded-xl border border-base-300 bg-base-100 p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-base-content">Contact Us</h1>
          <p className="mt-2 text-base-content/70">
            Need help or want to report an issue? Reach out directly or send us a message below.
          </p>

          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-primary mb-2">Send an email to the Support team</p>
            <a
              href="mailto:support@atsen.app"
              className="inline-flex items-center gap-2 text-base-content hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              support@atsen.app
            </a>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-base-content">Send a Message</h2>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="label">
                <span className="label-text text-base-content/80">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base-content/80">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base-content/80">Message</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="textarea textarea-bordered w-full min-h-[140px] bg-base-200"
                placeholder="Write your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-base-300 pt-6">
            <h2 className="text-xl font-semibold text-base-content">Contact the Dev Team</h2>
            <div className="mt-3 space-y-2 text-base-content/80">
              <p>
                <a href="mailto:fuad@atsen.app" className="link link-hover">fuad@atsen.app</a>
              </p>
              <p>
                <a href="mailto:ibraheem@atsen.app" className="link link-hover">ibraheem@atsen.app</a>
              </p>
              <p>
                <a href="mailto:jishnu@atsen.app" className="link link-hover">jishnu@atsen.app</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
