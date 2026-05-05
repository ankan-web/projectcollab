import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function NeedBoard() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "teammate",
    title: "",
    description: "",
    lookingFor: "",
    techStack: [],
    link: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNeedId, setDeletingNeedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    const data = await getAllNeeds();
    setNeeds(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);
    try {
      await createNeed(user.uid, profile, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setShowForm(false);
      setForm({
        type: "teammate",
        title: "",
        description: "",
        lookingFor: "",
        techStack: [],
        link: "",
      });
      loadNeeds();
    } catch (err) {
      console.error("Error creating need:", err);
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
    } catch (err) {
      console.error("Error deleting need:", err);
    } finally {
      setDeleting(false);
      setDeletingNeedId(null);
    }
  };

  const filteredNeeds = filterType
    ? needs.filter((n) => n.type === filterType)
    : needs;

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .needs-shell { max-width: 800px; margin: 0 auto; padding: 32px 24px 64px; }
        .needs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .needs-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin: 0; }
        .needs-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .filter-pill {
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
          border: 0.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.15s;
        }
        .filter-pill:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
        .filter-pill.selected { background: rgba(99,255,180,0.1); border-color: rgba(99,255,180,0.35); color: #63ffb4; }
        .needs-grid { display: flex; flex-direction: column; gap: 16px; }
        .need-card {
          background: #111113; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 20px;
        }
        .need-card:hover { border-color: rgba(255,255,255,0.15); }
        .need-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .need-type {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
          padding: 4px 10px; border-radius: 12px;
          background: rgba(99,255,180,0.1); border: 0.5px solid rgba(99,255,180,0.25);
          color: #63ffb4;
        }
        .need-delete {
          background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer;
          padding: 4px; transition: color 0.15s;
        }
        .need-delete:hover { color: #ff5555; }
        .need-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .need-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; margin: 0 0 12px; }
        .need-looking { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 12px; }
        .need-looking strong { color: #63ffb4; }
        .need-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .tech-chip { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
        .need-footer { display: flex; align-items: center; justify-content: space-between; }
        .need-author { display: flex; align-items: center; gap: 10px; }
        .need-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(99,255,180,0.1); border: 0.5px solid rgba(99,255,180,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: #63ffb4; overflow: hidden;
        }
        .need-avatar img { width: 100%; height: 100%; objectFit: cover; }
        .need-author-name { font-size: 12px; color: rgba(255,255,255,0.5); }
        .need-link {
          font-size: 12px; color: #63ffb4; text-decoration: none;
          padding: 6px 12px; border-radius: 8px;
          background: rgba(99,255,180,0.08); border: 0.5px solid rgba(99,255,180,0.2);
          transition: background 0.15s;
        }
        .need-link:hover { background: rgba(99,255,180,0.15); }
        .need-connect {
          font-size: 12px; color: #fff; text-decoration: none;
          padding: 6px 12px; border-radius: 8px;
          background: rgba(255,255,255,0.06); border: 0.5px solid rgba(255,255,255,0.1);
          transition: all 0.15s; cursor: pointer;
        }
        .need-connect:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .post-btn {
          background: #63ffb4; color: #09090b; border: none;
          padding: 10px 20px; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: transform 0.15s;
        }
        .post-btn:hover { transform: scale(1.02); }
        .form-modal {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 20px;
        }
        .form-panel {
          background: #18181b; border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 28px; width: 100%; max-width: 500px;
        }
        .form-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 20px; }
        .form-field { margin-bottom: 16px; }
        .form-label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-input, .form-textarea, .form-select {
          width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 12px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: rgba(99,255,180,0.45); }
        .form-textarea { min-height: 100px; resize: vertical; }
        .form-select { cursor: pointer; }
        .form-actions { display: flex; gap: 12px; margin-top: 20px; }
        .form-btn {
          flex: 1; padding: 12px; border-radius: 10px; font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: none;
        }
        .form-btn.cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .form-btn.cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .form-btn.submit { background: #63ffb4; color: #09090b; }
        .form-btn.submit:hover { background: #7affc4; }
        .form-btn.submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); }
      `}</style>

      <Navbar />

      <main className="needs-shell">
        <div className="needs-header">
          <h1 className="needs-title">Opportunities</h1>
          <button className="post-btn" onClick={() => setShowForm(true)}>
            + Post a Need
          </button>
        </div>

        <div className="needs-filters">
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

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filteredNeeds.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Be the first to share a need!</p>
          </div>
        ) : (
          <div className="needs-grid">
            {filteredNeeds.map((need) => (
              <div key={need.id} className="need-card">
                <div className="need-header">
                  <span className="need-type">{NEED_TYPES.find((t) => t.value === need.type)?.label}</span>
                  {need.authorId === user?.uid && (
                    <button className="need-delete" onClick={() => handleDelete(need.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                      </svg>
                    </button>
                  )}
                </div>
                <h3 className="need-title">{need.title}</h3>
                <p className="need-desc">{need.description}</p>
                {need.lookingFor && (
                  <p className="need-looking">Looking for: <strong>{need.lookingFor}</strong></p>
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
                        <img src={need.authorPhoto} alt="" />
                      ) : (
                        need.authorName?.[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="need-author-name">
                      {need.authorName} {need.authorCollege && `• ${need.authorCollege}`}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {need.authorId !== user?.uid && (
                      <button
                        className="need-connect"
                        onClick={async () => {
                          try {
                            await getOrCreateChat(user.uid, need.authorId, profile);
                            navigate(`/chat?chatWith=${need.authorId}`);
                          } catch (err) {
                            console.error("Error connecting:", err);
                          }
                        }}
                      >
                        Connect
                      </button>
                    )}
                    {need.link && (
                      <a href={need.link} target="_blank" rel="noreferrer" className="need-link">
                        View Details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="form-modal" onClick={() => setShowForm(false)}>
          <div className="form-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="form-title">Post a Need</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {NEED_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Looking for React developer for hackathon"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your project or what you're looking for..."
                />
              </div>
              <div className="form-field">
                <label className="form-label">Looking for (optional)</label>
                <input
                  className="form-input"
                  value={form.lookingFor}
                  onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                  placeholder="e.g., A designer and a backend developer"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Tech Stack (optional)</label>
                <SkillInput
                  value={form.techStack}
                  onChange={(techStack) => setForm({ ...form, techStack })}
                  max={8}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Link (optional)</label>
                <input
                  className="form-input"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="Link to repo, doc, or more details"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="form-btn cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="form-btn submit" disabled={submitting}>
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <style>{`
              .delete-modal-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.15s ease;
              }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .delete-modal {
                background: #18181b;
                border: 0.5px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 28px;
                width: 90%;
                max-width: 360px;
                text-align: center;
                animation: slideUp 0.2s ease;
              }
              @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              .delete-modal-icon {
                width: 52px; height: 52px;
                border-radius: 50%;
                background: rgba(255,80,80,0.1);
                border: 1px solid rgba(255,80,80,0.2);
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 18px;
              }
              .delete-modal-title {
                font-family: 'Syne', sans-serif;
                font-size: 18px; font-weight: 700;
                color: #fff;
                margin: 0 0 8px;
              }
              .delete-modal-text {
                font-size: 14px;
                color: rgba(255,255,255,0.5);
                margin: 0 0 24px;
                line-height: 1.5;
              }
              .delete-modal-actions {
                display: flex; gap: 12px;
              }
              .delete-modal-btn {
                flex: 1;
                padding: 12px;
                border-radius: 10px;
                font-family: 'Syne', sans-serif;
                font-size: 13px; font-weight: 700;
                cursor: pointer;
                transition: all 0.15s;
                border: none;
              }
              .delete-modal-btn.cancel {
                background: rgba(255,255,255,0.06);
                color: rgba(255,255,255,0.7);
              }
              .delete-modal-btn.cancel:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
              }
              .delete-modal-btn.delete {
                background: #ff5555;
                color: #fff;
              }
              .delete-modal-btn.delete:hover {
                background: #ff6b6b;
              }
              .delete-modal-btn.delete:disabled {
                opacity: 0.5; cursor: not-allowed;
              }
            `}</style>
            <div className="delete-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5555" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </div>
            <h3 className="delete-modal-title">Delete Post</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-btn cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-btn delete" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}