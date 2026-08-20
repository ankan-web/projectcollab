import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import SkillInput from "../../components/ui/SkillInput";
import { useAuthStore } from "../../store/authStore";
import { getAllNeeds, createNeed, deleteNeed } from "../../services/needService";
import { getOrCreateChat } from "../../services/chatService";

const NEED_TYPES = [
  { value: "teammate", label: "Looking for Teammate" },
  { value: "cofounder", label: "Looking for Co-founder" },
  { value: "mentor", label: "Looking for Mentor" },
  { value: "hackathon", label: "Hackathon Team" },
  { value: "feedback", label: "Seeking Feedback" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = {
  type: "teammate",
  title: "",
  description: "",
  lookingFor: "",
  techStack: [],
  link: "",
};

export default function NeedBoard() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNeedId, setDeletingNeedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadNeeds = async () => {
    const data = await getAllNeeds();
    setNeeds(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNeeds();
  }, []);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Add a short title so people know what you need.";
    if (!form.description.trim()) next.description = "Describe the project or the help you're looking for.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createNeed(user.uid, profile, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setErrors({});
      toast.success("Opportunity posted");
      loadNeeds();
    } catch (err) {
      console.error("Error creating need:", err);
      toast.error("We couldn't post this opportunity. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingNeedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteNeed(deletingNeedId);
      setShowDeleteModal(false);
      setNeeds((prev) => prev.filter((n) => n.id !== deletingNeedId));
      toast.success("Post deleted");
    } catch (err) {
      console.error("Error deleting need:", err);
      toast.error("We couldn't delete this post. Try again.");
    } finally {
      setDeleting(false);
      setDeletingNeedId(null);
    }
  };

  const handleConnect = async (need) => {
    if (!user?.uid) {
      toast("Log in first to connect with someone.", { icon: "ℹ️" });
      return;
    }
    try {
      await getOrCreateChat(user.uid, need.authorId, profile);
      navigate(`/chat?chatWith=${need.authorId}`);
    } catch (err) {
      console.error("Error connecting:", err);
      toast.error("We couldn't start a chat. Try again.");
    }
  };

  const filteredNeeds = filterType
    ? needs.filter((n) => n.type === filterType)
    : needs;

  return (
    <div className="needs-page">
      <style>{`
        .needs-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
          color: #EAEAEA;
        }
        .needs-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1060px;
          margin: 0 auto;
          padding: clamp(40px, 7vw, 72px) 24px 96px;
        }
        .needs-head { margin-bottom: 36px; }
        .needs-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          padding: 8px 14px;
          margin-bottom: 24px;
        }
        .needs-kicker .x { color: #E61919; }
        .needs-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(30px, 5.5vw, 48px);
          line-height: 0.98;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 14px;
        }
        .needs-title .red { color: #E61919; }
        .needs-sub {
          font-size: 13px;
          color: rgba(234,234,234,0.55);
          line-height: 1.7;
          max-width: 56ch;
          margin: 0;
        }
        .needs-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .post-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 26px;
          background: #E61919;
          color: #fff;
          border: 1px solid #E61919;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
        }
        .post-btn:hover { background: #FF2A2A; }
        .post-btn:active { transform: scale(0.98); }
        .post-btn:focus-visible { outline: 2px solid #E61919; outline-offset: 3px; }
        .post-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .needs-count {
          font-size: 11px;
          color: rgba(234,234,234,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
        }
        .needs-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 36px;
        }
        .filter-pill {
          padding: 8px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.45);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }
        .filter-pill:hover { color: rgba(234,234,234,0.85); border-color: rgba(234,234,234,0.4); }
        .filter-pill.selected { background: #E61919; border-color: #E61919; color: #fff; }
        .filter-pill:focus-visible { outline: 2px solid #E61919; outline-offset: 2px; }
        .needs-grid {
          display: grid;
          grid-auto-flow: dense;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
        }
        .needs-grid .bento-item:first-child { grid-column: 1 / -1; }
        .bento-item { min-width: 0; background: #0A0A0A; }
        .need-card {
          background: #0E0E0E;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          transition: background 0.15s;
        }
        .need-card:hover { background: #101010; }
        .need-card.wide { padding: 28px 30px; }
        .need-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .need-type {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 11px;
          background: rgba(230,25,25,0.08);
          border: 1px solid rgba(230,25,25,0.4);
          color: #FF6B6B;
        }
        .need-type-dot {
          width: 5px;
          height: 5px;
          background: #E61919;
        }
        .need-delete {
          background: none;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.3);
          cursor: pointer;
          padding: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .need-delete:hover { background: rgba(230,25,25,0.12); color: #FF6B6B; border-color: rgba(230,25,25,0.5); }
        .need-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 16px;
          font-weight: 400;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
          text-wrap: balance;
        }
        .need-card.wide .need-title { font-size: 20px; }
        .need-desc {
          font-size: 12px;
          color: rgba(234,234,234,0.5);
          line-height: 1.7;
          margin: 0;
          max-width: 62ch;
          text-wrap: pretty;
        }
        .need-looking {
          font-size: 12px;
          color: rgba(234,234,234,0.6);
          margin: 0;
          line-height: 1.6;
        }
        .need-looking strong { color: #E61919; font-weight: 700; }
        .need-tech { display: flex; flex-wrap: wrap; gap: 6px; }
        .tech-chip {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.5);
        }
        .need-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: auto;
          padding-top: 4px;
        }
        .need-author { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .need-avatar {
          width: 28px;
          height: 28px;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #E61919;
          overflow: hidden;
          flex-shrink: 0;
        }
        .need-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .need-author-name {
          font-size: 11px;
          color: rgba(234,234,234,0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .need-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .need-connect {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          padding: 9px 18px;
          background: #E61919;
          border: 1px solid #E61919;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: background 0.15s;
        }
        .need-connect:hover { background: #FF2A2A; }
        .need-connect:active { transform: scale(0.97); }
        .need-connect:focus-visible { outline: 2px solid #E61919; outline-offset: 2px; }
        .need-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.55);
          text-decoration: none;
          padding: 9px 14px;
          border: 1px solid #2A2A2A;
          background: transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .need-link:hover { color: #EAEAEA; border-color: rgba(234,234,234,0.5); }
        .feed-state {
          text-align: center;
          padding: 64px 24px;
          color: rgba(234,234,234,0.45);
          border: 1px dashed #2A2A2A;
          background: #0E0E0E;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .feed-state h3 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: 22px;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .feed-state p { margin: 0 0 22px; line-height: 1.6; }
        .feed-state .feed-cta {
          display: inline-flex;
          padding: 12px 24px;
          background: #E61919;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid #E61919;
          cursor: pointer;
          transition: background 0.15s;
        }
        .feed-state .feed-cta:hover { background: #FF2A2A; }
        .feed-state .feed-cta:active { transform: scale(0.97); }
        .skeleton-card {
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          min-height: 180px;
        }
        .skeleton-card.wide { min-height: 260px; }
        .select-wrap { position: relative; }
        .select-wrap::after {
          content: "";
          position: absolute;
          right: 16px;
          top: 50%;
          width: 8px;
          height: 8px;
          border-right: 1.5px solid rgba(234,234,234,0.5);
          border-bottom: 1.5px solid rgba(234,234,234,0.5);
          transform: translateY(-65%) rotate(45deg);
          pointer-events: none;
        }
        .form-select {
          cursor: pointer;
          appearance: none;
          padding-right: 40px;
          background: #111111;
        }
        .form-select option { background: #111111; color: #EAEAEA; padding: 10px; }
        @media (max-width: 768px) {
          .needs-shell { padding: 32px 16px 72px; }
          .needs-grid { grid-template-columns: 1fr; }
          .needs-grid .bento-item:first-child { grid-column: auto; }
          .need-card { padding: 20px; }
          .need-card.wide { padding: 22px; }
        }
      `}</style>

      <Navbar />

      <main className="needs-shell">
        <div className="needs-head">
          <div className="needs-kicker">
            <span className="x">[</span> The board <span className="x">]</span>
          </div>
          <h1 className="needs-title">
            Opportunities, <span className="red">posted live.</span>
          </h1>
          <p className="needs-sub">
            {">"} Find teammates, mentors, and feedback for whatever you're building next. Post what you need, in your own words.
          </p>
        </div>

        <div className="needs-actions">
          <div className="needs-filters" style={{ margin: 0 }}>
            <button
              className={`filter-pill ${!filterType ? "selected" : ""}`}
              onClick={() => setFilterType("")}
            >
              All
            </button>
            {NEED_TYPES.map((t) => (
              <button
                key={t.value}
                className={`filter-pill ${filterType === t.value ? "selected" : ""}`}
                onClick={() => setFilterType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="needs-count">{filteredNeeds.length} open</span>
            <button className="post-btn" onClick={() => setShowForm(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post a need
            </button>
          </div>
        </div>

        {loading ? (
          <div className="needs-grid" aria-hidden="true">
            <div className="skeleton-card wide" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : filteredNeeds.length === 0 ? (
          <div className="feed-state">
            <h3>{needs.length === 0 ? "Nothing posted yet" : "No posts match that filter"}</h3>
            <p>
              {needs.length === 0
                ? "Be the first to put a need on the board and find someone to build with."
                : "Try a different filter, or post something new."}
            </p>
            {needs.length === 0 && (
              <button className="feed-cta" onClick={() => setShowForm(true)}>
                Post the first need
              </button>
            )}
          </div>
        ) : (
          <div className="needs-grid">
            {filteredNeeds.map((need, i) => (
              <div key={need.id} className="bento-item">
                <div className={`need-card ${i === 0 ? "wide" : ""}`}>
                  <div className="need-header">
                    <span className="need-type">
                      <span className="need-type-dot" />
                      {NEED_TYPES.find((t) => t.value === need.type)?.label}
                    </span>
                    {need.authorId === user?.uid && (
                      <button className="need-delete" onClick={() => handleDelete(need.id)} title="Delete post">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <h3 className="need-title">{need.title}</h3>
                  <p className="need-desc">{need.description}</p>

                  {need.lookingFor && (
                    <p className="need-looking">
                      Looking for: <strong>{need.lookingFor}</strong>
                    </p>
                  )}

                  {need.techStack?.length > 0 && (
                    <div className="need-tech">
                      {need.techStack.map((tech) => (
                        <span key={tech} className="tech-chip">{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="need-footer">
                    <div className="need-author">
                      <div className="need-avatar">
                        {need.authorPhoto ? (
                          <img src={need.authorPhoto} alt={`${need.authorName}'s avatar`} />
                        ) : (
                          need.authorName?.[0]?.toUpperCase()
                        )}
                      </div>
                      <span className="need-author-name">
                        {need.authorName}
                        {need.authorCollege && ` · ${need.authorCollege}`}
                      </span>
                    </div>
                    <div className="need-actions">
                      {need.authorId !== user?.uid && (
                        <button className="need-connect" onClick={() => handleConnect(need)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Connect
                        </button>
                      )}
                      {need.link && (
                        <a href={need.link} target="_blank" rel="noreferrer" className="need-link">
                          View details
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 12px" }}>
              [ TRANSMIT / POST A NEED ]
            </p>
            <h2 className="modal-title">Post a need</h2>
            <p className="modal-sub">Tell the board what you're looking for. Keep it short and specific.</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="need-type">Type</label>
                <div className="select-wrap">
                  <select
                    id="need-type"
                    className="field form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {NEED_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="need-title">Title</label>
                <input
                  id="need-title"
                  className={`field ${errors.title ? "error" : ""}`}
                  value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: "" }); }}
                  placeholder="e.g., Looking for a React developer for a hackathon"
                  aria-invalid={!!errors.title}
                />
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="need-desc">Description</label>
                <textarea
                  id="need-desc"
                  className={`field ${errors.description ? "error" : ""}`}
                  style={{ minHeight: 100 }}
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: "" }); }}
                  placeholder="Describe the project or the help you need..."
                  aria-invalid={!!errors.description}
                />
                {errors.description && <p className="field-error">{errors.description}</p>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="need-looking">Looking for <span style={{ color: "rgba(234,234,234,0.4)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="need-looking"
                  className="field"
                  value={form.lookingFor}
                  onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                  placeholder="e.g., A designer and a backend developer"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Tech stack <span style={{ color: "rgba(234,234,234,0.4)", fontWeight: 400 }}>(optional)</span></label>
                <SkillInput
                  value={form.techStack}
                  onChange={(techStack) => setForm({ ...form, techStack })}
                  max={8}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label" htmlFor="need-link">Link <span style={{ color: "rgba(234,234,234,0.4)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="need-link"
                  className="field"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="Link to a repo, doc, or more details"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setErrors({}); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-red" disabled={submitting}>
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
            </div>
            <h3 className="modal-title">Delete post</h3>
            <p className="confirm-message">
              This post will be removed from the board. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}