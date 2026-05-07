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
          padding: 24px 0;
        }
        .search-bar {
          margin-bottom: 24px;
        }
        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus {
          border-color: rgba(99,255,180,0.45);
        }
        .search-input::placeholder {
          color: rgba(255,255,255,0.22);
        }
      `}</style>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, college, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
          Loading people...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: 48, 
          color: "rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}>
          {users.length === 0 
            ? "No other users yet." 
            : "No people match your search."}
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {filteredUsers.map((u) => (
            <PersonCard key={u.uid} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}