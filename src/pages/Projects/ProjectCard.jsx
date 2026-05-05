import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteProject, toggleInterest } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";
import { sendJoinRequest } from "../../services/joinService";

const DOMAIN_COLORS = {
  "Web Development":     { bg: "rgba(24,95,165,0.1)",  border: "rgba(24,95,165,0.25)",  text: "#378ADD" },
  "Mobile Apps":         { bg: "rgba(83,74,183,0.1)",  border: "rgba(83,74,183,0.25)",  text: "#7F77DD" },
  "Machine Learning / AI": { bg: "rgba(29,158,117,0.1)", border: "rgba(29,158,117,0.25)", text: "#1D9E75" },
  "Data Science":        { bg: "rgba(186,117,23,0.1)", border: "rgba(186,117,23,0.25)", text: "#EF9F27" },
  "DevOps / Cloud":      { bg: "rgba(99,153,34,0.1)",  border: "rgba(99,153,34,0.25)",  text: "#97C459" },
  "Blockchain / Web3":   { bg: "rgba(212,83,126,0.1)", border: "rgba(212,83,126,0.25)", text: "#D4537E" },
  "Game Development":    { bg: "rgba(216,90,48,0.1)",  border: "rgba(216,90,48,0.25)",  text: "#F0997B" },
  "Cybersecurity":       { bg: "rgba(136,135,128,0.1)",border: "rgba(136,135,128,0.25)",text: "#B4B2A9" },
  "Open Source":         { bg: "rgba(99,255,180,0.08)",border: "rgba(99,255,180,0.2)",  text: "#63ffb4" },
};

export default function ProjectCard({ project, showOwner = false, onClick, currentUserId, onDelete }) {
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

  const domainStyle = DOMAIN_COLORS[project.domain] || {
    bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.5)"
  };

  const handleClick = () => {
    if (onClick) onClick(project);
    else navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <style>{`
        .pcard {
          background: #111113;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px 22px;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .pcard:hover {
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }
        .pcard-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .pcard-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #fff; margin: 0 0 6px;
          letter-spacing: -0.2px;
          line-height: 1.3;
        }
        .pcard-desc {
          font-size: 13px; color: rgba(255,255,255,0.45);
          line-height: 1.6; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcard-stack { display: flex; flex-wrap: wrap; gap: 6px; }
        .stack-chip {
          font-size: 11px; font-weight: 500;
          padding: 3px 9px; border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
        }
        .stack-more {
          font-size: 11px; color: rgba(255,255,255,0.3);
          padding: 3px 6px;
        }
        .pcard-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .collab-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 500;
          padding: 4px 10px; border-radius: 20px;
          background: rgba(99,255,180,0.08);
          border: 0.5px solid rgba(99,255,180,0.2);
          color: #63ffb4;
        }
        .collab-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #63ffb4;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .owner-row { display: flex; align-items: center; gap: 7px; }
        .owner-avatar {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(99,255,180,0.1);
          border: 0.5px solid rgba(99,255,180,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 600; color: #63ffb4;
          overflow: hidden; flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }
        .owner-name { font-size: 12px; color: rgba(255,255,255,0.4); }
        .delete-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px;
          color: rgba(255,255,255,0.3);
          transition: background 0.15s, color 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .delete-btn:hover { background: rgba(255,80,80,0.15); color: #ff5555; }
        .join-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px;
          color: rgba(255,255,255,0.3);
          transition: background 0.15s, color 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .join-btn:hover { background: rgba(99,255,180,0.15); color: #63ffb4; }
      `}</style>

      <div className="pcard" onClick={handleClick}>
        <div className="pcard-top">
          <div style={{ flex: 1 }}>
            <h3 className="pcard-title">{project.title}</h3>
            <p className="pcard-desc">{project.description}</p>
          </div>
          {project.domain && (
            <span style={{
              fontSize: 11, fontWeight: 500,
              padding: "3px 10px", borderRadius: 20, flexShrink: 0,
              background: domainStyle.bg,
              border: `0.5px solid ${domainStyle.border}`,
              color: domainStyle.text,
            }}>
              {project.domain}
            </span>
          )}
          {isOwner && (
            <button className="delete-btn" onClick={handleDelete} title="Delete project">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </button>
          )}
          {canJoin && (
            <button className="join-btn" onClick={handleJoin} title="Request to join">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </button>
          )}
        </div>

        {project.techStack?.length > 0 && (
          <div className="pcard-stack">
            {project.techStack.slice(0, 4).map((t) => (
              <span key={t} className="stack-chip">{t}</span>
            ))}
            {project.techStack.length > 4 && (
              <span className="stack-more">+{project.techStack.length - 4} more</span>
            )}
          </div>
        )}

        <div className="pcard-footer">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {project.openToCollab && (
              <span className="collab-badge">
                <span className="collab-dot" />
                Open to collab
              </span>
            )}
            <button
              onClick={handleInterest}
              disabled={!user?.uid || isOwner}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, color: hasInterest ? "#63ffb4" : "rgba(255,255,255,0.35)",
                textDecoration: "none", padding: "3px 8px",
                border: `0.5px solid ${hasInterest ? "rgba(99,255,180,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 20, transition: "all 0.15s",
                background: hasInterest ? "rgba(99,255,180,0.08)" : "transparent",
                cursor: isOwner ? "default" : "pointer",
                opacity: isOwner ? 0.5 : 1,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill={hasInterest ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
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
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, color: "rgba(255,255,255,0.35)",
                  textDecoration: "none", padding: "3px 8px",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 20, transition: "color 0.15s",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </a>
            )}
          </div>

          {showOwner && (
            <div className="owner-row">
              <div className="owner-avatar">
                {project.ownerPhoto
                  ? <img src={project.ownerPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : project.ownerName?.[0]?.toUpperCase()
                }
              </div>
              <span className="owner-name">{project.ownerName}</span>
            </div>
          )}
        </div>
      </div>

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
            <h3 className="delete-modal-title">Delete Project</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>"{project.title}"</strong>? This action cannot be undone.
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

      {showJoinModal && (
        <div className="join-modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="join-modal" onClick={(e) => e.stopPropagation()}>
            <style>{`
              .join-modal-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.15s ease;
              }
              .join-modal {
                background: #18181b;
                border: 0.5px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 28px;
                width: 90%;
                max-width: 400px;
                animation: slideUp 0.2s ease;
              }
              @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              .join-modal-title {
                font-family: 'Syne', sans-serif;
                font-size: 18px; font-weight: 700;
                color: #fff;
                margin: 0 0 8px;
              }
              .join-modal-text {
                font-size: 14px;
                color: rgba(255,255,255,0.5);
                margin: 0 0 16px;
                line-height: 1.5;
              }
              .join-modal-input {
                width: 100%;
                background: rgba(255,255,255,0.04);
                border: 0.5px solid rgba(255,255,255,0.12);
                border-radius: 10px;
                padding: 12px;
                color: #fff;
                font-size: 14px;
                font-family: 'DM Sans', sans-serif;
                outline: none;
                resize: vertical;
                min-height: 80px;
                margin-bottom: 16px;
              }
              .join-modal-input:focus { border-color: rgba(99,255,180,0.45); }
              .join-modal-input::placeholder { color: rgba(255,255,255,0.25); }
              .join-modal-actions {
                display: flex; gap: 12px;
              }
              .join-modal-btn {
                flex: 1;
                padding: 12px;
                border-radius: 10px;
                font-family: 'Syne', sans-serif;
                font-size: 13px; font-weight: 700;
                cursor: pointer;
                transition: all 0.15s;
                border: none;
              }
              .join-modal-btn.cancel {
                background: rgba(255,255,255,0.06);
                color: rgba(255,255,255,0.7);
              }
              .join-modal-btn.cancel:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
              }
              .join-modal-btn.submit {
                background: #63ffb4;
                color: #09090b;
              }
              .join-modal-btn.submit:hover {
                background: #7affc4;
              }
              .join-modal-btn.submit:disabled {
                opacity: 0.5; cursor: not-allowed;
              }
            `}</style>
            <h3 className="join-modal-title">Join Project</h3>
            <p className="join-modal-text">
              Send a message to <strong>{project.ownerName}</strong> explaining why you'd like to join <strong>"{project.title}"</strong>.
            </p>
            <form onSubmit={submitJoin}>
              <textarea
                className="join-modal-input"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Hi! I'm interested in joining your project. I have experience with..."
              />
              <div className="join-modal-actions">
                <button 
                  type="button" 
                  className="join-modal-btn cancel" 
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="join-modal-btn submit"
                  disabled={joining}
                >
                  {joining ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
