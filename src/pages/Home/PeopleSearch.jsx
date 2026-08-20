import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../../services/userService";
import { useAuthStore } from "../../store/authStore";
import PersonCard from "./PersonCard";

export default function PeopleSearch() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllUsers().then((data) => {
      setUsers(data.filter((u) => u.uid !== user?.uid && !u.isAdmin));
      setLoading(false);
    });
  }, [user?.uid]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchName = u.displayName?.toLowerCase().includes(q);
      const matchCollege = u.college?.toLowerCase().includes(q);
      const matchSkills = u.skills?.some((s) => s.toLowerCase().includes(q));
      return matchName || matchCollege || matchSkills;
    });
  }, [users, search]);

  return (
    <div className="people-search">
      <style>{`
        .people-search {
          padding: 0 0 24px;
          font-family: 'JetBrains Mono', monospace;
        }
        .search-bar { margin-bottom: 28px; }
        .search-wrap { position: relative; }
        .search-prompt {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #E61919;
          font-size: 13px;
          font-weight: 700;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          padding: 13px 20px 13px 34px;
          color: #EAEAEA;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: rgba(230,25,25,0.55); }
        .search-input::placeholder { color: rgba(234,234,234,0.25); }
        .people-grid {
          display: grid;
          grid-auto-flow: dense;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
        }
        .people-grid .bento-item:first-child { grid-column: 1 / -1; }
        .bento-item { min-width: 0; background: #0A0A0A; }
        .feed-state {
          text-align: center;
          padding: 72px 24px;
          color: rgba(234,234,234,0.45);
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          font-size: 13px;
        }
        .people-loading {
          text-align: center;
          padding: 48px;
          color: rgba(234,234,234,0.45);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          animation: plblink 1.4s steps(2) infinite;
        }
        @keyframes plblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.25; } }
        @media (max-width: 768px) {
          .people-grid { grid-template-columns: 1fr; }
          .people-grid .bento-item:first-child { grid-column: auto; }
        }
      `}</style>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-prompt">&gt;</span>
          <input
            type="text"
            className="search-input"
            placeholder="search by name, college, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="people-loading">Loading people...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="feed-state">
          {users.length === 0
            ? "NO OTHER USERS YET."
            : "NO PEOPLE MATCH YOUR SEARCH."}
        </div>
      ) : (
        <div className="people-grid">
          {filteredUsers.map((u, i) => (
            <div key={u.uid} className="bento-item">
              <PersonCard user={u} featured={i === 0} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}