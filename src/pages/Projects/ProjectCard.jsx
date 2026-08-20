import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteProject, toggleInterest } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";
import { sendJoinRequest } from "../../services/joinService";

export default function ProjectCard({ project, showOwner = false, onClick, currentUserId, onDelete, featured = false }) {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const isOwner = currentUserId && project.ownerId === currentUserId;
  const canJoin = user && !isOwner && project.openToCollab;
  const hasInterest = Boolean(user?.uid && project.interests?.[user.uid]);

  const handleJoin = async (e) => {
    e.stopPropagation();
    setShowJoinModal(true);
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await sendJoinRequest(project.id, user.uid, profile, joinMessage.trim());
      setShowJoinModal(false);
      setJoinMessage("");
      toast.success("Request sent! The project owner will be notified.");
    } catch (err) {
      console.error("Error sending join request:", err);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      setShowDeleteModal(false);
      if (onDelete) onDelete(project.id);
      toast.success("Project deleted");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleInterest = async (e) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      await toggleInterest(project.id, user.uid);
    } catch (err) {
      console.error("Error toggling interest:", err);
    }
  };

  const handleClick = () => {
    if (onClick) onClick(project);
    else navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <style>{`
        .pcard {
          position: relative;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          padding: ${featured ? "26px 28px" : "20px 22px"};
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          height: 100%;
          transition: border-color 0.15s, background 0.15s;
        }
        .pcard:hover { border-color: rgba(230,25,25,0.5); background: #101010; }
        .pcard-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .pcard-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: ${featured ? "18px" : "15px"};
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #EAEAEA; margin: 0 0 8px;
          line-height: 1.1;
        }
        .pcard-desc {
          font-size: 12px; color: rgba(234,234,234,0.5);
          line-height: 1.65; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcard-id {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(234,234,234,0.28);
          margin: 0 0 8px;
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
        }
        .pcard-top-right { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; flex-shrink: 0; }
        .domain-chip {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 5px 10px;
          border: 1px solid #2A2A2A;
          background: #131313;
          color: rgba(234,234,234,0.65);
          white-space: nowrap;
        }
        .pcard-stack { display: flex; flex-wrap: wrap; gap: 6px; }
        .stack-chip {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.5);
        }
        .stack-more { font-size: 10px; color: rgba(234,234,234,0.35); padding: 4px 4px; }
        .pcard-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .collab-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 5px 10px;
          border: 1px solid rgba(230,25,25,0.5);
          background: rgba(230,25,25,0.08);
          color: #E61919;
        }
        .collab-dot { width: 6px; height: 6px; background: #E61919; animation: blink 1.6s steps(2) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }
        .owner-row { display: flex; align-items: center; gap: 8px; }
        .owner-avatar {
          width: 24px; height: 24px;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: #E61919;
          overflow: hidden; flex-shrink: 0;
        }
        .owner-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .owner-name { font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(234,234,234,0.5); }
        .icon-btn {
          background: #131313; border: 1px solid #2A2A2A; cursor: pointer;
          padding: 7px; color: rgba(234,234,234,0.5);
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { color: #EAEAEA; border-color: rgba(234,234,234,0.5); }
        .delete-btn:hover { background: rgba(230,25,25,0.12); color: #E61919; border-color: rgba(230,25,25,0.5); }
        .join-btn:hover { color: #E61919; border-color: rgba(230,25,25,0.5); }
        .meta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(234,234,234,0.45);
          text-decoration: none; padding: 6px 10px;
          border: 1px solid #2A2A2A;
          background: transparent;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-variant-numeric: tabular-nums;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .meta-btn:hover { color: #EAEAEA; border-color: rgba(234,234,234,0.5); }
        .meta-btn.interest-on { color: #E61919; border-color: rgba(230,25,25,0.5); background: rgba(230,25,25,0.08); }
        .meta-btn:disabled { opacity: 0.4; cursor: default; }
        @media (max-width: 768px) {
          .pcard { padding: 18px; }
        }
      `}</style>

      <div className="pcard" onClick={handleClick}>
        <div className="pcard-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="pcard-id">[ PROJECT / {project.id?.slice(0, 8)?.toUpperCase() || "----"} ]</p>
            <h3 className="pcard-title">{project.title}</h3>
            <p className="pcard-desc">{project.description}</p>
          </div>
          <div className="pcard-top-right">
            {project.domain && <span className="domain-chip">{project.domain}</span>}
            <div style={{ display: "flex", gap: 4 }}>
              {isOwner && (
                <button className="icon-btn delete-btn" onClick={handleDelete} title="Delete project">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                  </svg>
                </button>
              )}
              {canJoin && (
                <button className="icon-btn join-btn" onClick={handleJoin} title="Request to join">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {project.techStack?.length > 0 && (
          <div className="pcard-stack">
            {project.techStack.slice(0, 4).map((t) => (
              <span key={t} className="stack-chip">{t}</span>
            ))}
            {project.techStack.length > 4 && (
              <span className="stack-more">+{project.techStack.length - 4}</span>
            )}
          </div>
        )}

        <div className="pcard-footer">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {project.openToCollab && (
              <span className="collab-badge">
                <span className="collab-dot" />
                Open to collab
              </span>
            )}
            <button
              onClick={handleInterest}
              disabled={!user?.uid || isOwner}
              className={`meta-btn ${hasInterest ? "interest-on" : ""}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill={hasInterest ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              {project.interestCount || 0}
            </button>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="meta-btn"
              >
                GitHub
              </a>
            )}
          </div>

          {showOwner && (
            <div className="owner-row">
              <div className="owner-avatar">
                {project.ownerPhoto
                  ? <img src={project.ownerPhoto} alt="" />
                  : project.ownerName?.[0]?.toUpperCase()
                }
              </div>
              <span className="owner-name">{project.ownerName}</span>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </div>
            <h3 className="modal-title">Delete project</h3>
            <p className="confirm-message">
              Are you sure you want to delete <strong>"{project.title}"</strong>? This action cannot be undone.
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

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 12px" }}>
              [ JOIN REQUEST / {project.id?.slice(0, 8)?.toUpperCase() || "----"} ]
            </p>
            <h3 className="modal-title">Request to join</h3>
            <p className="modal-sub">
              Message <strong>{project.ownerName}</strong> explaining why you'd like to join <strong>"{project.title}"</strong>.
            </p>
            <form onSubmit={submitJoin}>
              <textarea
                className="field"
                style={{ minHeight: 90, marginBottom: 16 }}
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Why you want to join and what you bring..."
              />
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-red" disabled={joining}>
                  {joining ? "Sending..." : "Send request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}