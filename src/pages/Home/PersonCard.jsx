import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { getOrCreateChat } from "../../services/chatService";

export default function PersonCard({ user, featured = false }) {
  const navigate = useNavigate();
  const { user: currentUser, profile: currentProfile } = useAuthStore();

  const handleCardClick = (e) => {
    if (e.target.closest('.connect-btn')) return;
    navigate(`/profile/${user.uid}`);
  };

  const handleConnect = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser?.uid) {
      toast("Please log in first to connect with others.", { icon: "ℹ️" });
      return;
    }
    try {
      await getOrCreateChat(currentUser.uid, user.uid, currentProfile);
      navigate(`/chat?chatWith=${user.uid}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Failed to start chat");
    }
  };

  return (
    <div className="person-shell" onClick={handleCardClick}>
      <style>{`
        .person-shell {
          position: relative;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          cursor: pointer;
          height: 100%;
          transition: border-color 0.15s, background 0.15s;
        }
        .person-shell:hover { border-color: rgba(230,25,25,0.5); background: #101010; }
        .person-card {
          padding: ${featured ? "28px 30px" : "22px 24px"};
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .person-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .person-avatar {
          width: ${featured ? "52px" : "46px"};
          height: ${featured ? "52px" : "46px"};
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: ${featured ? "18px" : "15px"};
          color: #E61919;
          overflow: hidden;
          flex-shrink: 0;
        }
        .person-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .person-info {
          flex: 1;
          min-width: 0;
        }
        .person-id {
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.28);
          margin: 0 0 4px;
        }
        .person-name {
          font-family: 'Archivo Black', sans-serif;
          font-size: ${featured ? "16px" : "14px"};
          font-weight: 400;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .person-college {
          font-size: 11px;
          color: rgba(234,234,234,0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .person-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .skill-chip {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.5);
          font-family: 'JetBrains Mono', monospace;
        }
        .skill-more {
          font-size: 10px;
          color: rgba(234,234,234,0.35);
          padding: 4px 6px;
        }
        .connect-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: 1px solid #2A2A2A;
          padding: 10px 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.6);
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          align-self: flex-start;
        }
        .connect-btn:hover {
          background: rgba(230,25,25,0.08);
          color: #E61919;
          border-color: rgba(230,25,25,0.5);
        }
        .connect-btn:active { transform: scale(0.98); }
      `}</style>

      <div className="person-card">
        <div className="person-header">
          <div className="person-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              user.displayName?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div className="person-info">
            <p className="person-id">[ UNIT / {user.uid?.slice(0, 8)?.toUpperCase() || "----"} ]</p>
            <h3 className="person-name">{user.displayName || "Anonymous"}</h3>
            {user.college && (
              <p className="person-college">{user.college}</p>
            )}
          </div>
        </div>

        {user.skills?.length > 0 && (
          <div className="person-skills">
            {user.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="skill-chip">{skill}</span>
            ))}
            {user.skills.length > 4 && (
              <span className="skill-more">+{user.skills.length - 4}</span>
            )}
          </div>
        )}

        <button className="connect-btn" onClick={handleConnect}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message
        </button>
      </div>
    </div>
  );
}