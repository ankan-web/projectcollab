import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { getOrCreateChat } from "../../services/chatService";

export default function PersonCard({ user, onConnect }) {
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
      console.log("Creating chat with:", user.uid);
      await getOrCreateChat(currentUser.uid, user.uid, currentProfile);
      console.log("Chat created, navigating...");
      navigate(`/chat?chatWith=${user.uid}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Failed to start chat");
    }
  };

  return (
    <div className="person-card" onClick={handleCardClick}>
      <style>{`
        .person-card {
          background: #111113;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .person-card:hover {
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }
        .person-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .person-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(99,255,180,0.1);
          border: 0.5px solid rgba(99,255,180,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #63ffb4;
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
        .person-name {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 2px;
        }
        .person-college {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
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
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
        }
        .skill-more {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          padding: 3px 6px;
        }
        .connect-btn {
          background: rgba(99,255,180,0.1);
          border: 0.5px solid rgba(99,255,180,0.3);
          border-radius: 8px;
          padding: 8px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #63ffb4;
          cursor: pointer;
          transition: background 0.15s;
        }
        .connect-btn:hover {
          background: rgba(99,255,180,0.2);
        }
      `}</style>

      <div className="person-header">
        <div className="person-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" />
          ) : (
            user.displayName?.[0]?.toUpperCase() || "?"
          )}
        </div>
        <div className="person-info">
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
        Message
      </button>
    </div>
  );
}